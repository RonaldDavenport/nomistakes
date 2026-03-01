import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

// Map Stripe price IDs to plan names
const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_STARTER_PRICE_ID as string]: "starter",
  [process.env.STRIPE_GROWTH_PRICE_ID as string]: "growth",
  [process.env.STRIPE_PRO_PRICE_ID as string]: "pro",
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
