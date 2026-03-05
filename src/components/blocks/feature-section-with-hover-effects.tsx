import { cn } from "@/lib/utils";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from "@tabler/icons-react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Built for service businesses",
      description: "Built for freelancers, agencies, consultants, and anyone who sells their time.",
      icon: <IconTerminal2 />,
    },
    {
      title: "Ease of use",
      description: "Set up in 4 minutes. No onboarding calls, no 50-page docs, no confusion.",
      icon: <IconEaseInOut />,
    },
    {
      title: "Transparent pricing",
      description: "One price. Everything included. No per-seat fees, no feature gating.",
      icon: <IconCurrencyDollar />,
    },
    {
      title: "Always available",
      description: "Your booking link, client portal, and contracts work 24/7.",
      icon: <IconCloud />,
    },
    {
      title: "Complete business OS",
      description: "CRM, booking, proposals, contracts, invoicing, projects — all in one place.",
      icon: <IconRouteAltLeft />,
    },
    {
      title: "AI-powered",
      description: "AI writes your proposals, your website, your blog posts, and your follow-up emails.",
      icon: <IconHelp />,
    },
    {
      title: "Replaces 11 tools",
      description: "Calendly, Dubsado, DocuSign, Toggl, Pipedrive, Typeform, and more.",
      icon: <IconAdjustmentsBolt />,
    },
    {
      title: "Everything else",
      description: "Referral links, team accounts, automations, analytics, client portal, and custom domain.",
      icon: <IconHeart />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-border",
        (index === 0 || index === 4) && "lg:border-l border-border",
        index < 4 && "lg:border-b border-border"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-muted to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-muted to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-muted-foreground">{icon}</div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-border group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
          {title}
        </span>
      </div>
      <p className="text-sm text-muted-foreground max-w-xs relative z-10 px-10">{description}</p>
    </div>
  );
};
