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
    videoUrl: "", // Upload to Supabase Storage and update
    transcript:
      "Hey! I'm Max, and I'll be guiding you through setting up your business. First up — your name. This is what people will remember, so make it count.",
    tip: "Short, unique names are easier to brand and find online.",
  },
  {
    stepId: "colors",
    videoUrl: "",
    transcript:
      "Nice! Now let's set the vibe. Colors shape how people feel about your brand before they read a single word.",
    tip: "Consistent brand colors increase recognition by 80%.",
  },
  {
    stepId: "logo",
    videoUrl: "",
    transcript:
      "A logo makes you look legit. Even a clean text mark works great — you can always upgrade later.",
    tip: "You don't need a fancy logo to start. Text logos convert just as well.",
  },
  {
    stepId: "layout",
    videoUrl: "",
    transcript:
      "This is the fun part. Pick a layout that matches your style — you can always change it later.",
    tip: "The Default layout works best for most businesses. Creator is great for selling courses.",
  },
  {
    stepId: "domain",
    videoUrl: "",
    transcript:
      "A custom domain makes you look professional. But your free URL works perfectly fine to start.",
    tip: "You can add a custom domain anytime from your dashboard.",
  },
  {
    stepId: "scheduling",
    videoUrl: "",
    transcript:
      "If you offer calls or sessions, Calendly makes booking effortless for your clients.",
    tip: "Businesses with online booking get 3x more appointments.",
  },
  {
    stepId: "payments",
    videoUrl: "",
    transcript:
      "This is where it gets real — connect Stripe and start accepting money today.",
    tip: "Stripe setup takes 2 minutes. No monthly fees, just 2.9% + 30¢ per transaction.",
  },
  {
    stepId: "email",
    videoUrl: "",
    transcript:
      "Last step! A professional email builds trust. But you can always use your personal email to start.",
    tip: "You're almost done! One more step to a fully set up business.",
  },
];

export function getAvatarScript(stepId: string): AvatarScript | undefined {
  return AVATAR_SCRIPTS.find((s) => s.stepId === stepId);
}
