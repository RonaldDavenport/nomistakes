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
    stepId: "your-site",
    videoUrl: "https://vmcdgynameujvljpqcfm.supabase.co/storage/v1/object/public/avatar-videos/name.mp4",
    transcript:
      "Hey! I'm Max, and I'll be walking you through setting up your business step by step. First up — your name and URL. A great name is short, memorable, and easy to spell. If you're not feeling the AI-generated one, hit that button and we'll come up with five fresh alternatives.",
    tip: "Short, unique names are easier to brand and find online.",
  },
  {
    stepId: "your-brand",
    videoUrl: "https://vmcdgynameujvljpqcfm.supabase.co/storage/v1/object/public/avatar-videos/colors.mp4",
    transcript:
      "Now the fun stuff — your brand! Color is the first thing visitors notice, even before they read a single word. Pick a palette that feels right, then choose how you want your logo to look. You can use a clean text mark or upload your own. Don't overthink the logo — some of the biggest brands started with just text. You'll see everything update in real time on the preview.",
    tip: "Consistent brand colors increase recognition by 80%.",
  },
  {
    stepId: "payments",
    videoUrl: "https://vmcdgynameujvljpqcfm.supabase.co/storage/v1/object/public/avatar-videos/payments.mp4",
    transcript:
      "Okay, this is the big one. Connecting Stripe means you can start accepting real payments on your site today. Credit cards, Apple Pay, Google Pay — all of it. There's no monthly fee, just a small percentage per transaction. The setup takes about two minutes, and once it's done, you're officially in business. If you're not ready to accept payments yet, you can skip this and come back to it anytime.",
    tip: "Stripe setup takes 2 minutes. No monthly fees, just 2.9% + 30\u00a2 per transaction.",
  },
  {
    stepId: "booking",
    videoUrl: "https://vmcdgynameujvljpqcfm.supabase.co/storage/v1/object/public/avatar-videos/scheduling.mp4",
    transcript:
      "If your business involves calls or consultations, add your Calendly link so visitors can book time with you directly. No back and forth emails — they pick a time, you get notified. If you don't have Calendly yet, it's free to set up and takes about two minutes.",
    tip: "Businesses with online booking get 3x more appointments.",
  },
  {
    stepId: "go-live",
    videoUrl: "https://vmcdgynameujvljpqcfm.supabase.co/storage/v1/object/public/avatar-videos/email.mp4",
    transcript:
      "Almost there! A professional email like hello at your-business dot com instantly builds trust with clients. Set yours up, and then we'll get you live. One more step after this and you're all set!",
    tip: "Professional emails improve open rates by 20%.",
  },
  {
    stepId: "meet-your-coach",
    videoUrl: "",
    transcript:
      "You did it — your business is set up! Now let me show you what we built. Everything looks great. When you're ready, meet your AI coach — it'll analyze your setup and give you a personalized game plan to grow. This is where it all comes together.",
    tip: "Businesses with a coach grow 2.3x faster in their first 90 days.",
  },
];

export function getAvatarScript(stepId: string): AvatarScript | undefined {
  return AVATAR_SCRIPTS.find((s) => s.stepId === stepId);
}
