import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase";
import { addCredits, PLAN_CREDITS } from "@/lib/credits";

export const runtime = "nodejs";

// Map Stripe price IDs to plan names (env vars may still use old names during transition)
const PRICE_TO_PLAN: Record<string, string> = {
  ...(process.env.STRIPE_SOLO_PRICE_ID && { [process.env.STRIPE_SOLO_PRICE_ID]: "solo" }),
  ...(process.env.STRIPE_STARTER_PRICE_ID && { [process.env.STRIPE_STARTER_PRICE_ID]: "solo" }),
  ...(process.env.STRIPE_SCALE_PRICE_ID && { [process.env.STRIPE_SCALE_PRICE_ID]: "scale" }),
  ...(process.env.STRIPE_GROWTH_PRICE_ID && { [process.env.STRIPE_GROWTH_PRICE_ID]: "scale" }),
};

function getStripeInstance(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  const stripe = getStripeInstance();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 },
    );
  }

  const supabase = createServerClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Handle proposal payments (one-time payment via connected account or platform)
        if (session.mode === "payment" && session.metadata?.type === "proposal") {
          const proposalId = session.metadata.proposalId;
          const contactId = session.metadata.contactId;
          const businessId = session.metadata.businessId;

          if (proposalId) {
            try {
              const now = new Date().toISOString();
              const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : "";

              // Update proposal status
              await supabase
                .from("proposals")
                .update({
                  status: "accepted",
                  accepted_at: now,
                  paid_at: now,
                  payment_intent_id: paymentIntentId,
                  payment_amount_cents: session.amount_total || 0,
                  updated_at: now,
                })
                .eq("id", proposalId);

              // Upgrade contact to customer
              if (contactId) {
                await supabase
                  .from("contacts")
                  .update({ lifecycle_stage: "customer", last_contacted_at: now })
                  .eq("id", contactId);

                // Log activities
                await supabase.from("contact_activity").insert([
                  {
                    contact_id: contactId,
                    business_id: businessId,
                    type: "proposal_accepted",
                    title: "Proposal accepted",
                    metadata: { proposal_id: proposalId },
                  },
                  {
                    contact_id: contactId,
                    business_id: businessId,
                    type: "payment_received",
                    title: `Payment received: $${((session.amount_total || 0) / 100).toFixed(2)}`,
                    metadata: { proposal_id: proposalId, payment_intent_id: paymentIntentId },
                  },
                  {
                    contact_id: contactId,
                    business_id: businessId,
                    type: "stage_changed",
                    title: "Stage changed to Customer",
                    metadata: { from: "unknown", to: "customer" },
                  },
                ]);
              }

              console.log(`checkout.session.completed: proposal ${proposalId} accepted, payment $${((session.amount_total || 0) / 100).toFixed(2)}`);
            } catch (err) {
              console.error("checkout.session.completed: proposal payment fulfillment failed:", err);
            }
          }
          break;
        }

        // Handle invoice payments (one-time payment via connected account or platform)
        if (session.mode === "payment" && session.metadata?.type === "invoice") {
          const invoiceId = session.metadata.invoiceId;
          const contactId = session.metadata.contactId;
          const businessId = session.metadata.businessId;

          if (invoiceId) {
            try {
              const now = new Date().toISOString();
              const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : "";

              await supabase
                .from("invoices")
                .update({
                  status: "paid",
                  paid_at: now,
                  payment_status: "completed",
                  stripe_payment_intent_id: paymentIntentId,
                  updated_at: now,
                })
                .eq("id", invoiceId);

              if (contactId) {
                await supabase.from("contact_activity").insert({
                  contact_id: contactId,
                  business_id: businessId,
                  type: "payment_received",
                  title: `Invoice payment received: $${((session.amount_total || 0) / 100).toFixed(2)}`,
                  metadata: { invoice_id: invoiceId, payment_intent_id: paymentIntentId },
                });
              }

              console.log(`checkout.session.completed: invoice ${invoiceId} paid, $${((session.amount_total || 0) / 100).toFixed(2)}`);
            } catch (err) {
              console.error("checkout.session.completed: invoice payment fulfillment failed:", err);
            }
          }
          break;
        }

        // Handle credit pack purchases (one-time payment)
        if (session.mode === "payment" && session.metadata?.type === "credit_pack") {
          const packUserId = session.metadata.userId;
          const packBusinessId = session.metadata.businessId;
          const packCredits = parseInt(session.metadata.credits || "0", 10);
          const packId = session.metadata.packId;

          if (packUserId && packBusinessId && packCredits > 0) {
            try {
              await addCredits(packUserId, packBusinessId, packCredits, "pack_purchase", {
                pack_id: packId,
                stripe_payment_intent_id: session.payment_intent,
              });

              // Log the purchase
              await supabase.from("credit_pack_purchases").insert({
                user_id: packUserId,
                pack_type: packId,
                credits: packCredits,
                amount_cents: session.amount_total || 0,
                stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : "",
                status: "completed",
              });

              console.log(`checkout.session.completed: credit pack ${packId} (${packCredits} credits) for user ${packUserId}`);
            } catch (err) {
              console.error("checkout.session.completed: credit pack fulfillment failed:", err);
            }
          }
          break;
        }

        // Only handle subscription checkouts (not one-time payments for Connect)
        if (session.mode !== "subscription") break;

        const email =
          session.customer_email || session.customer_details?.email;
        const planId = session.metadata?.planId;
        const userId = session.metadata?.userId;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        if (!email && !userId) {
          console.error(
            "checkout.session.completed: no email or userId in session",
          );
          break;
        }

        // Build the update payload
        const update: Record<string, string> = {};
        if (planId) update.plan = planId;
        if (customerId) update.stripe_customer_id = customerId;

        // Prefer userId lookup, fall back to email
        if (userId) {
          const { error } = await supabase
            .from("profiles")
            .update(update)
            .eq("id", userId);

          if (error) {
            console.error(
              `checkout.session.completed: failed to update profile by userId ${userId}:`,
              error.message,
            );
          } else {
            console.log(
              `checkout.session.completed: updated profile ${userId} to plan=${planId}`,
            );
            // Initial credit refill for new subscription
            if (planId && PLAN_CREDITS[planId] > 0) {
              const { data: businesses } = await supabase
                .from("businesses")
                .select("id")
                .eq("user_id", userId);
              if (businesses) {
                for (const biz of businesses) {
                  await addCredits(userId, biz.id, PLAN_CREDITS[planId], "subscription_refill", { plan: planId, initial: true });
                }
              }
            }
          }
        } else if (email) {
          const { error } = await supabase
            .from("profiles")
            .update(update)
            .eq("email", email);

          if (error) {
            console.error(
              `checkout.session.completed: failed to update profile by email ${email}:`,
              error.message,
            );
          } else {
            console.log(
              `checkout.session.completed: updated profile (email=${email}) to plan=${planId}`,
            );
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        // Get the current price to determine the plan
        const priceId = subscription.items.data[0]?.price?.id;
        const newPlan = priceId ? PRICE_TO_PLAN[priceId] : null;

        if (!newPlan) {
          console.warn(
            `customer.subscription.updated: unknown price_id ${priceId}`,
          );
          break;
        }

        // Look up profile by stripe_customer_id first, fall back to customer email
        const { data: profileByCustomer } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profileByCustomer) {
          const { error } = await supabase
            .from("profiles")
            .update({ plan: newPlan })
            .eq("stripe_customer_id", customerId);

          if (error) {
            console.error(
              `customer.subscription.updated: failed to update by customer_id:`,
              error.message,
            );
          } else {
            console.log(
              `customer.subscription.updated: updated ${customerId} to plan=${newPlan}`,
            );
          }
        } else {
          // Fall back: retrieve customer email from Stripe
          const customer = await stripe.customers.retrieve(customerId);
          if (customer.deleted) break;

          const email = (customer as Stripe.Customer).email;
          if (!email) {
            console.error(
              `customer.subscription.updated: no email for customer ${customerId}`,
            );
            break;
          }

          const { error } = await supabase
            .from("profiles")
            .update({ plan: newPlan, stripe_customer_id: customerId })
            .eq("email", email);

          if (error) {
            console.error(
              `customer.subscription.updated: failed to update by email ${email}:`,
              error.message,
            );
          } else {
            console.log(
              `customer.subscription.updated: updated (email=${email}) to plan=${newPlan}`,
            );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        // Try by stripe_customer_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile) {
          const { error } = await supabase
            .from("profiles")
            .update({ plan: "free" })
            .eq("stripe_customer_id", customerId);

          if (error) {
            console.error(
              `customer.subscription.deleted: failed to downgrade by customer_id:`,
              error.message,
            );
          } else {
            console.log(
              `customer.subscription.deleted: downgraded ${customerId} to free`,
            );
          }
        } else {
          // Fall back to customer email
          const customer = await stripe.customers.retrieve(customerId);
          if (customer.deleted) break;

          const email = (customer as Stripe.Customer).email;
          if (!email) break;

          const { error } = await supabase
            .from("profiles")
            .update({ plan: "free" })
            .eq("email", email);

          if (error) {
            console.error(
              `customer.subscription.deleted: failed to downgrade by email ${email}:`,
              error.message,
            );
          } else {
            console.log(
              `customer.subscription.deleted: downgraded (email=${email}) to free`,
            );
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        // Refill credits on successful subscription renewal
        const paidInvoice = event.data.object as Stripe.Invoice;
        const paidCustomerId =
          typeof paidInvoice.customer === "string"
            ? paidInvoice.customer
            : paidInvoice.customer?.id;

        // Only handle subscription invoices (not one-time)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoiceSub = (paidInvoice as any).subscription;
        if (invoiceSub && paidCustomerId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, plan")
            .eq("stripe_customer_id", paidCustomerId)
            .maybeSingle();

          if (profile && profile.plan && PLAN_CREDITS[profile.plan] > 0) {
            // Get all businesses for this user and refill credits
            const { data: businesses } = await supabase
              .from("businesses")
              .select("id")
              .eq("user_id", profile.id);

            if (businesses) {
              for (const biz of businesses) {
                await addCredits(
                  profile.id,
                  biz.id,
                  PLAN_CREDITS[profile.plan],
                  "subscription_refill",
                  { plan: profile.plan, invoice_id: paidInvoice.id }
                );
              }
              console.log(
                `invoice.payment_succeeded: refilled ${PLAN_CREDITS[profile.plan]} credits for user ${profile.id} (${profile.plan} plan, ${businesses.length} businesses)`
              );
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        console.error(
          `invoice.payment_failed: customer=${customerId}, invoice=${invoice.id}, amount_due=${invoice.amount_due}`,
        );

        // Optionally downgrade after failed payment
        // Uncomment if you want immediate downgrade on payment failure:
        // if (customerId) {
        //   await supabase
        //     .from("profiles")
        //     .update({ plan: "free" })
        //     .eq("stripe_customer_id", customerId);
        // }
        break;
      }

      default:
        // Unhandled event type — log and return 200
        console.log(`Unhandled webhook event: ${event.type}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook handler error for ${event.type}: ${message}`);
    // Still return 200 so Stripe doesn't retry
  }

  return NextResponse.json({ received: true });
}
