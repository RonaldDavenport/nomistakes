// Avatar guide scripts — one per onboarding step
// videoUrl: path to pre-recorded AI avatar clip (empty = fallback to text-only bubble)
// transcript: what the avatar says (displayed as text in speech bubble)
// tip: short motivational stat shown below the transcript

export interface AvatarScript {
  stepId: string;
  videoUrl: string;
  transcript: string;
  tip: string;
}

export const AVATAR_SCRIPTS: AvatarScript[] = [
  {
    stepId: "name",
    videoUrl: "https://vmcdgynameujvljpqcfm.supabase.co/storage/v1/object/public/avatar-videos/name.mp4",
    transcript:
      "Hey! I'm Max, and I'll be walking you through setting up your business step by step. So first things first — let's nail your business name. This is what people are going to Google, tell their friends about, and see on every page of your site. A great name is short, memorable, and easy to spell. If you're not feeling the AI-generated one, hit that button and we'll come up with five fresh alternatives for you. Take your time with this one — it matters.",
    tip: "Short, unique names are easier to brand and find online.",
  },
  {
    stepId: "colors",
    videoUrl: "https://vmcdgynameujvljpqcfm.supabase.co/storage/v1/object/public/avatar-videos/colors.mp4",
    transcript:
      "Alright, now we're getting into the fun stuff — your brand colors. Here's the thing most people don't realize: color is the first thing visitors notice, even before they read a single word on your site. The right palette builds instant trust and sets the mood. Pick a preset that feels right, or go with the custom palette our AI designed specifically for your business. You'll see the preview update in real time on the right, so you can see exactly how it looks.",
    tip: "Consistent brand colors increase recognition by 80%.",
  },
  {
    stepId: "logo",
    videoUrl: "https://vmcdgynameujvljpqcfm.supabase.co/storage/v1/object/public/avatar-videos/logo.mp4",
    transcript:
      "Next up — your logo. Now don't overthink this one. Some of the most successful brands started with just a clean text logo. Think Google, think Supreme. You can use the text mark we've already generated for you, upload your own if you have one, or get a professional one designed later. The important thing is to keep moving — you can always come back and upgrade your logo from your dashboard.",
    tip: "You don't need a fancy logo to start. Text logos convert just as well.",
  },
  {
    stepId: "layout",
    videoUrl: "https://vmcdgynameujvljpqcfm.supabase.co/storage/v1/object/public/avatar-videos/layout.mp4",
    transcript:
      "Now let's choose how your website is structured. We've got three layouts that work great for different types of businesses. The Default layout is a solid all-rounder with a hero section, features, testimonials, and a call to action. Minimal is perfect if you're a consultant or coach — it's clean, personal, and puts your story front and center. And Creator is built for selling courses, templates, and digital products. Check the preview to see how each one looks with your colors.",
    tip: "The Default layout works best for most businesses. Creator is great for selling courses.",
  },
  {
    stepId: "domain",
    videoUrl: "https://vmcdgynameujvljpqcfm.supabase.co/storage/v1/object/public/avatar-videos/domain.mp4",
    transcript:
      "Your site is already live on a free URL, which is totally fine for getting started. But if you want to level up, a custom domain like your-business-dot-com makes a huge difference for credibility. You can grab one for less than ten dollars a year. If you already own a domain, just type it in and we'll walk you through connecting it. And if you're not ready yet, no worries — you can always add one later from your dashboard.",
    tip: "You can add a custom domain anytime from your dashboard.",
  },
  {
    stepId: "scheduling",
    videoUrl: "https://vmcdgynameujvljpqcfm.supabase.co/storage/v1/object/public/avatar-videos/scheduling.mp4",
    transcript:
      "If your business involves calls, consultations, or any kind of meetings, this step is a game-changer. By adding your Calendly link, visitors can book time with you directly from your website — no back and forth emails. It shows up as a beautiful booking widget right on your contact page. If you don't have Calendly yet, it's free to set up and takes about two minutes. Trust me, your future self will thank you for this one.",
    tip: "Businesses with online booking get 3x more appointments.",
  },
  {
    stepId: "payments",
    videoUrl: "https://vmcdgynameujvljpqcfm.supabase.co/storage/v1/object/public/avatar-videos/payments.mp4",
    transcript:
      "Okay, this is the big one. Connecting Stripe means you can start accepting real payments on your site today. Credit cards, Apple Pay, Google Pay — all of it. There's no monthly fee, just a small percentage per transaction. The setup takes about two minutes, and once it's done, you're officially in business. If you're not ready to accept payments yet, you can skip this and come back to it anytime.",
    tip: "Stripe setup takes 2 minutes. No monthly fees, just 2.9% + 30\u00a2 per transaction.",
  },
  {
    stepId: "email",
    videoUrl: "https://vmcdgynameujvljpqcfm.supabase.co/storage/v1/object/public/avatar-videos/email.mp4",
    transcript:
      "Last step — you made it! A professional email like hello at your-business dot com instantly builds trust with clients. It shows you're serious and established. You can set one up through Google Workspace, or just enter whatever email you want displayed on your site. Once you finish this step, you'll be taken to your dashboard where you can manage everything. Congratulations on setting up your business — let's go!",
    tip: "You're almost done! One more step to a fully set up business.",
  },
];

export function getAvatarScript(stepId: string): AvatarScript | undefined {
  return AVATAR_SCRIPTS.find((s) => s.stepId === stepId);
}
