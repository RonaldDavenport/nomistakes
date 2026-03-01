import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-zinc-500 text-sm mb-12">Last updated: February 2026</p>

          {/* 1. Acceptance of Terms */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">1. Acceptance of Terms</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            By accessing or using No Mistakes (&ldquo;the Service&rdquo;), operated by No Mistakes
            (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree to be bound by
            these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you
            may not use the Service.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            We reserve the right to update or modify these Terms at any time. Your continued use of
            the Service after any changes constitutes acceptance of the revised Terms.
          </p>

          {/* 2. Service Description */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">2. Service Description</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            No Mistakes is an AI-powered business builder. Users answer a series of questions, and
            our AI generates a complete business including a website, online store, branding, copy,
            SEO optimization, and advertising assets. The Service also provides ongoing AI-powered
            business management tools including content creation, competitor analysis, analytics, and
            ad generation.
          </p>

          {/* 3. Account Registration */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">3. Account Registration</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            To use certain features of the Service, you must create an account. When creating an
            account, you agree to:
          </p>
          <ul className="list-disc list-inside text-zinc-400 text-sm space-y-2 mb-4">
            <li>Be at least 18 years of age</li>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activity that occurs under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>

          {/* 4. Subscription & Billing */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">4. Subscription &amp; Billing</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            No Mistakes offers the following subscription plans:
          </p>
          <ul className="list-disc list-inside text-zinc-400 text-sm space-y-2 mb-4">
            <li><strong className="text-zinc-300">Free</strong> &mdash; AI builds your full business at no cost</li>
            <li><strong className="text-zinc-300">Starter ($19.99/month)</strong> &mdash; AI-managed marketing, SEO, blog posts, and mobile app access</li>
            <li><strong className="text-zinc-300">Growth ($49.99/month)</strong> &mdash; Full growth engine with product research, UGC scripts, competitor analysis, and business reports</li>
            <li><strong className="text-zinc-300">Pro ($249.99/month)</strong> &mdash; Full AI autopilot with unlimited requests, daily management, and advanced analytics</li>
          </ul>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            Paid subscriptions are billed on a recurring monthly basis through Stripe. You authorize
            us to charge your payment method on file for each billing cycle. You may cancel your
            subscription at any time. Cancellation takes effect at the end of the current billing
            period, and you will retain access to paid features until that date. No refunds are
            provided for partial billing periods.
          </p>

          {/* 5. AI-Generated Content */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">5. AI-Generated Content</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            The Service uses artificial intelligence (powered by Anthropic Claude and OpenAI) to
            generate business content including but not limited to website copy, product descriptions,
            branding assets, blog posts, ad copy, and SEO content.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            You acknowledge and agree that:
          </p>
          <ul className="list-disc list-inside text-zinc-400 text-sm space-y-2 mb-4">
            <li>AI-generated content may contain errors, inaccuracies, or inappropriate material</li>
            <li>You are solely responsible for reviewing, editing, and approving all AI-generated content before it is published or used</li>
            <li>We make no guarantees regarding the accuracy, completeness, legality, or suitability of AI-generated content</li>
            <li>AI-generated content should not be relied upon as professional legal, financial, medical, or other specialized advice</li>
          </ul>

          {/* 6. Intellectual Property */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">6. Intellectual Property</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            <strong className="text-zinc-300">Your Content:</strong> You retain ownership of the
            business content generated through the Service for your use, including website copy,
            product listings, branding assets, and other business materials. You grant us a limited
            license to host, display, and process this content as necessary to provide the Service.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            <strong className="text-zinc-300">Our Platform:</strong> No Mistakes owns all rights to
            the platform, including its software, design, features, AI models and prompts, templates,
            and underlying technology. You may not copy, modify, distribute, or create derivative
            works based on any part of the platform.
          </p>

          {/* 7. Stripe Connect & Payment Processing */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">7. Stripe Connect &amp; Payment Processing</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            If you sell products or services through your No Mistakes-generated business, payment
            processing is handled through Stripe Connect. By using this feature, you agree to:
          </p>
          <ul className="list-disc list-inside text-zinc-400 text-sm space-y-2 mb-4">
            <li>Stripe&apos;s <a href="https://stripe.com/legal/connect-account" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 underline">Connected Account Agreement</a> and <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 underline">Terms of Service</a></li>
            <li>A 5% platform fee on transactions processed through your business</li>
            <li>Provide accurate business and tax information required by Stripe</li>
            <li>Comply with all applicable laws regarding the sale of your products or services</li>
          </ul>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            We are not responsible for payment processing failures, chargebacks, or disputes between
            you and your customers. Stripe&apos;s terms and policies govern all payment-related matters.
          </p>

          {/* 8. Prohibited Uses */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">8. Prohibited Uses</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            You agree not to use the Service to:
          </p>
          <ul className="list-disc list-inside text-zinc-400 text-sm space-y-2 mb-4">
            <li>Engage in any illegal activity or violate any applicable laws</li>
            <li>Create businesses that sell illegal, counterfeit, or regulated products without proper authorization</li>
            <li>Generate or distribute spam, phishing content, or malicious material</li>
            <li>Create content that is defamatory, harassing, threatening, or promotes violence or hate</li>
            <li>Infringe on the intellectual property rights of others</li>
            <li>Attempt to reverse engineer, decompile, or extract the source code of the platform</li>
            <li>Circumvent any security measures or access restrictions</li>
            <li>Use the Service to compete directly with No Mistakes</li>
          </ul>

          {/* 9. Limitation of Liability */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">9. Limitation of Liability</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            To the maximum extent permitted by applicable law, No Mistakes and its officers,
            directors, employees, and agents shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages, including but not limited to loss of
            profits, data, business opportunities, or goodwill, arising out of or related to your
            use of the Service.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
            warranties of any kind, whether express or implied, including but not limited to
            warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            Our total liability to you for any claims arising from or related to the Service shall
            not exceed the amount you paid us in the twelve (12) months preceding the claim.
          </p>

          {/* 10. Termination */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">10. Termination</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            We may suspend or terminate your account at any time, with or without notice, if we
            reasonably believe you have violated these Terms or engaged in conduct that may harm the
            Service or other users. You may terminate your account at any time by contacting us.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            Upon termination, your right to use the Service ceases immediately. We may, but are not
            obligated to, retain your data for a reasonable period. Any websites or businesses
            generated through the Service may be taken offline upon termination.
          </p>

          {/* 11. Changes to Terms */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">11. Changes to Terms</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            We reserve the right to modify these Terms at any time. If we make material changes, we
            will notify you by email or through the Service. Your continued use of the Service after
            changes are posted constitutes your acceptance of the revised Terms.
          </p>

          {/* 12. Contact */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">12. Contact</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            <a href="mailto:ronalddavenport08@gmail.com" className="text-brand-400 hover:text-brand-300 underline">
              ronalddavenport08@gmail.com
            </a>
          </p>

          {/* Back link */}
          <div className="mt-16 pt-8 border-t border-white/5">
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
