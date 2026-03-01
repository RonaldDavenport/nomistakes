import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm mb-12">Last updated: February 2026</p>

          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            No Mistakes (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to
            protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you use the No Mistakes platform (&ldquo;the
            Service&rdquo;).
          </p>

          {/* 1. Information We Collect */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">1. Information We Collect</h2>

          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            <strong className="text-zinc-300">Account Information:</strong> When you create an
            account, we collect your name, email address, and authentication credentials. If you sign
            in with Google, we receive your name, email, and profile picture from Google.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            <strong className="text-zinc-300">Business Data:</strong> We collect the information you
            provide during the business creation process, including your skills, interests, budget,
            and preferences. We also store all AI-generated business content, including websites,
            product listings, branding assets, copy, and configurations.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            <strong className="text-zinc-300">Payment Information:</strong> If you subscribe to a
            paid plan or use Stripe Connect for your business, Stripe collects and processes your
            payment information directly. We do not store your credit card numbers or bank account
            details on our servers.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            <strong className="text-zinc-300">Usage Analytics:</strong> We automatically collect
            information about how you use the Service, including pages visited, features used, time
            spent, device information, browser type, IP address, and referring URLs.
          </p>

          {/* 2. How We Use Information */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">2. How We Use Information</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-zinc-400 text-sm space-y-2 mb-4">
            <li>Provide, operate, and maintain the Service</li>
            <li>Generate AI-powered business content tailored to your inputs</li>
            <li>Process subscriptions and billing through Stripe</li>
            <li>Send transactional emails (account verification, password resets, billing receipts)</li>
            <li>Analyze usage patterns to improve the Service</li>
            <li>Detect and prevent fraud, abuse, and security incidents</li>
            <li>Comply with legal obligations</li>
          </ul>

          {/* 3. AI Processing */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">3. AI Processing</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            When you use the Service, your inputs (such as business preferences, skills, and
            instructions) are sent to third-party AI providers to generate content for your business.
            This includes:
          </p>
          <ul className="list-disc list-inside text-zinc-400 text-sm space-y-2 mb-4">
            <li><strong className="text-zinc-300">Anthropic (Claude)</strong> &mdash; Used for business strategy, copy generation, and AI chat features</li>
            <li><strong className="text-zinc-300">OpenAI</strong> &mdash; Used for content generation and image creation</li>
          </ul>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            These providers process your data according to their own privacy policies. We only send
            the minimum information necessary to generate the requested content. We do not send your
            email, password, or payment information to AI providers.
          </p>

          {/* 4. Third-Party Services */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">4. Third-Party Services</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            We use the following third-party services to operate the platform:
          </p>
          <ul className="list-disc list-inside text-zinc-400 text-sm space-y-2 mb-4">
            <li><strong className="text-zinc-300">Supabase</strong> &mdash; Authentication, database, and backend infrastructure</li>
            <li><strong className="text-zinc-300">Stripe</strong> &mdash; Subscription billing and payment processing (including Stripe Connect for user businesses)</li>
            <li><strong className="text-zinc-300">Vercel</strong> &mdash; Application hosting and deployment</li>
            <li><strong className="text-zinc-300">Anthropic</strong> &mdash; AI content generation (Claude)</li>
            <li><strong className="text-zinc-300">OpenAI</strong> &mdash; AI content and image generation</li>
          </ul>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            Each of these providers has their own privacy policies governing their handling of data.
            We encourage you to review their policies.
          </p>

          {/* 5. Data Storage & Security */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">5. Data Storage &amp; Security</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            Your data is stored securely using Supabase&apos;s infrastructure with encryption at rest
            and in transit. We implement industry-standard security measures including:
          </p>
          <ul className="list-disc list-inside text-zinc-400 text-sm space-y-2 mb-4">
            <li>HTTPS encryption for all data transmission</li>
            <li>Row-level security policies on database tables</li>
            <li>Secure authentication with hashed passwords</li>
            <li>Regular security reviews and updates</li>
          </ul>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            While we take reasonable measures to protect your information, no method of electronic
            transmission or storage is 100% secure. We cannot guarantee absolute security.
          </p>

          {/* 6. Your Rights */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">6. Your Rights</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            Depending on your jurisdiction, you may have the following rights regarding your personal data:
          </p>
          <ul className="list-disc list-inside text-zinc-400 text-sm space-y-2 mb-4">
            <li><strong className="text-zinc-300">Access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong className="text-zinc-300">Correction:</strong> Request correction of inaccurate personal data</li>
            <li><strong className="text-zinc-300">Deletion:</strong> Request deletion of your personal data and account</li>
            <li><strong className="text-zinc-300">Export:</strong> Request a portable copy of your data</li>
            <li><strong className="text-zinc-300">Opt-Out:</strong> Opt out of marketing communications at any time</li>
          </ul>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            To exercise any of these rights, please contact us at{" "}
            <a href="mailto:ronalddavenport08@gmail.com" className="text-brand-400 hover:text-brand-300 underline">
              ronalddavenport08@gmail.com
            </a>.
            We will respond to your request within 30 days.
          </p>

          {/* 7. Cookies */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">7. Cookies</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            We use cookies and similar technologies to:
          </p>
          <ul className="list-disc list-inside text-zinc-400 text-sm space-y-2 mb-4">
            <li>Maintain your authentication session</li>
            <li>Remember your preferences and settings</li>
            <li>Analyze usage patterns and improve the Service</li>
          </ul>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            Essential cookies are required for the Service to function. You can configure your
            browser to reject non-essential cookies, though this may affect certain features.
          </p>

          {/* 8. Children's Privacy */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">8. Children&apos;s Privacy</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            The Service is not intended for individuals under the age of 18. We do not knowingly
            collect personal information from anyone under 18. If we become aware that we have
            collected personal data from a minor, we will take steps to delete that information
            promptly. If you believe a minor has provided us with personal data, please contact us
            immediately.
          </p>

          {/* 9. Changes to This Policy */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">9. Changes to This Policy</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            We may update this Privacy Policy from time to time. If we make material changes, we will
            notify you by email or through a notice on the Service. The &ldquo;Last updated&rdquo;
            date at the top of this page indicates when the policy was last revised. Your continued
            use of the Service after any changes constitutes acceptance of the updated policy.
          </p>

          {/* 10. Contact */}
          <h2 className="text-xl font-semibold text-white mt-10 mb-4">10. Contact</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            If you have any questions or concerns about this Privacy Policy, please contact us at:
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
