import Link from "next/link";
import Navbar from "@/components/Navbar";

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] top-[-200px] left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(76,110,245,0.15) 0%, transparent 70%)" }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-700/30 bg-brand-900/20 text-brand-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Open now &mdash; start building for free
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            Your AI builds and runs<br />
            <span className="gradient-text">your entire business.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Answer 4 questions. Get a fully deployed business in 60 seconds.
            Website, store, branding, copy, SEO, ads &mdash; all done for you. For free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/wizard" className="btn-primary px-8 py-4 rounded-xl text-base font-bold text-white w-full sm:w-auto text-center">
              Start Your Business &mdash; Free
            </Link>
            <a href="#how-it-works" className="btn-secondary px-8 py-4 rounded-xl text-base font-medium text-zinc-300 w-full sm:w-auto text-center">
              See How It Works
            </a>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-zinc-500">
            <div className="flex items-center gap-2"><CheckIcon /> No credit card required</div>
            <div className="flex items-center gap-2"><CheckIcon /> Live business in 60 seconds</div>
            <div className="flex items-center gap-2"><CheckIcon /> No technical skills needed</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-32 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-400 mb-3 tracking-wide uppercase">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">From zero to live business.<br />In five steps.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">No code. No design skills. No business experience needed.</p>
          </div>
          <div className="grid gap-6">
            {[
              { n: "1", title: "Tell us about you", time: "30 seconds", desc: "Skills, interests, available time, and budget. Four quick questions." },
              { n: "2", title: "AI generates 3 business concepts", time: "10 seconds", desc: "Tailored to your skills. Each shows what you'd sell, who buys it, and revenue potential." },
              { n: "3", title: "Pick the one you like", time: "1 tap", desc: "Just tap your favorite. That's the last decision you need to make for a while." },
              { n: "4", title: "AI builds your entire business", time: "60 seconds", desc: "Website or store. Brand, logo, copy, products, checkout, policies \u2014 everything." },
              { n: "5", title: "Share your live business", time: "Right now", desc: "You have a real URL. A real store or service site. You're in business." },
            ].map((step) => (
              <div key={step.n} className="flex gap-6 items-start p-6 rounded-xl border border-white/5 bg-surface/50 hover:border-brand-700/30 transition-all">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600/15 to-purple-600/15 border border-brand-600/20 flex items-center justify-center text-brand-400 font-bold text-lg">
                  {step.n}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{step.title} <span className="text-zinc-500 font-normal text-sm ml-2">{step.time}</span></h3>
                  <p className="text-zinc-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 md:py-32 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-400 mb-3 tracking-wide uppercase">AI Business Manager</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Then AI runs it for you.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Content, marketing, ads, competitor intel, analytics. You just make decisions when asked.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "Content & SEO", desc: "AI writes blog posts, optimizes pages for search, and manages your content calendar." },
              { title: "UGC Video Ads", desc: "AI generates ready-to-upload TikTok and Meta video ads in every format you need." },
              { title: "Business Intelligence", desc: "Revenue tracking, conversion insights, and a weekly AI-generated business report." },
              { title: "Competitor Intel", desc: "AI monitors competitor pricing, products, and promotions. Weekly intelligence brief." },
              { title: "Winning Products", desc: "AI finds trending products, suggests additions based on market data, and optimizes pricing." },
              { title: "Mobile App", desc: "Chat with your AI business manager, approve content, and check stats from your phone." },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-white/5 bg-surface/50 hover:border-brand-600/30 hover:shadow-[0_0_40px_rgba(76,110,245,0.1)] transition-all">
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 md:py-32 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-400 mb-3 tracking-wide uppercase">Pricing</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Start free. Scale when ready.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: "Free", price: "$0", sub: "", desc: "AI builds your full business.", features: ["Business idea generation", "Full website or store", "Logo + brand kit", "All copy written by AI", "Live URL to share"], popular: false },
              { name: "Starter", price: "$19.99", sub: "/mo", desc: "AI manages your marketing.", features: ["Weekly AI blog posts", "Ad copy generation", "SEO optimization", "Mobile app access", "Weekly check-ins"], popular: false },
              { name: "Growth", price: "$49.99", sub: "/mo", desc: "Full growth engine.", features: ["Everything in Starter", "Winning product research", "UGC video scripts", "Competitor analysis", "Weekly business report", "Ad image generation"], popular: true },
              { name: "Pro", price: "$249.99", sub: "/mo", desc: "Full AI autopilot.", features: ["Everything in Growth", "Unlimited UGC video ads", "Unlimited ad images", "Daily AI management", "Daily competitor monitoring", "Advanced analytics", "Unlimited AI requests"], popular: false },
            ].map((tier) => (
              <div key={tier.name} className={`p-6 rounded-xl flex flex-col relative ${tier.popular ? "bg-gradient-to-br from-brand-600/10 to-purple-600/10 border border-brand-600/30" : "border border-white/5 bg-surface/50"}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-xs font-bold text-white">Most Popular</div>
                )}
                <p className="text-sm font-semibold text-zinc-500 mb-1">{tier.name}</p>
                <div className="mb-4">
                  <span className="text-4xl font-black text-white">{tier.price}</span>
                  {tier.sub && <span className="text-zinc-500 text-sm">{tier.sub}</span>}
                </div>
                <p className="text-zinc-500 text-sm mb-6">{tier.desc}</p>
                <ul className="space-y-3 text-sm text-zinc-400 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2"><CheckIcon />{f}</li>
                  ))}
                </ul>
                <Link href="/wizard" className={`py-3 rounded-lg text-sm font-semibold text-center block ${tier.popular ? "btn-primary text-white" : "btn-secondary text-zinc-300"}`}>
                  {tier.name === "Free" ? "Get Started Free" : "Start Free Trial"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Your first business.<br /><span className="gradient-text">Built right.</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-10">Start now. Your AI-powered business will be live before you finish your coffee.</p>
          <Link href="/wizard" className="btn-primary px-10 py-4 rounded-xl text-lg font-bold text-white inline-block">
            Build My Business &mdash; Free
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-zinc-600">&copy; 2026 No Mistakes. All rights reserved.</div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-zinc-300 transition">Privacy</a>
            <a href="#" className="hover:text-zinc-300 transition">Terms</a>
            <a href="mailto:ronalddavenport08@gmail.com" className="hover:text-zinc-300 transition">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
