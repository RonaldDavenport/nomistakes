"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Layout, Pointer, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TabContent {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  imageSrc: string;
  imageAlt: string;
}

interface Tab {
  value: string;
  icon: React.ReactNode;
  label: string;
  content: TabContent;
}

interface Feature108Props {
  badge?: string;
  heading?: string;
  description?: string;
  tabs?: Tab[];
}

const Feature108 = ({
  badge = "Kovra",
  heading = "Everything your service business needs, in one place",
  description = "Book clients, send contracts, manage projects, and get paid — without switching apps.",
  tabs = [
    {
      value: "tab-1",
      icon: <Zap className="h-auto w-4 shrink-0" />,
      label: "Book & Sign",
      content: {
        badge: "Booking & Contracts",
        title: "From first call to signed contract.",
        description:
          "Your own booking link, intake forms, automated reminders, and legally-binding e-signatures — all in one flow.",
        buttonText: "See how it works",
        imageSrc: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop",
        imageAlt: "Booking and contracts",
      },
    },
    {
      value: "tab-2",
      icon: <Pointer className="h-auto w-4 shrink-0" />,
      label: "Deliver & Track",
      content: {
        badge: "Projects & Time",
        title: "Deliver work. Track every hour.",
        description:
          "Project boards with deliverable checklists, nested subtasks, file sharing, and a time tracker that feeds directly into invoices.",
        buttonText: "See project tools",
        imageSrc: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=2087&auto=format&fit=crop",
        imageAlt: "Project management",
      },
    },
    {
      value: "tab-3",
      icon: <Layout className="h-auto w-4 shrink-0" />,
      label: "Get Paid & Grow",
      content: {
        badge: "Billing & Retention",
        title: "Recurring revenue on autopilot.",
        description:
          "Invoices, deposits, payment plans, recurring billing, review requests, referral links, and re-engagement flows — all automated.",
        buttonText: "See billing tools",
        imageSrc: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?q=80&w=2070&auto=format&fit=crop",
        imageAlt: "Billing and growth",
      },
    },
  ],
}: Feature108Props) => {
  return (
    <section className="py-32">
      <div className="container mx-auto">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="outline">{badge}</Badge>
          <h1 className="max-w-2xl text-3xl font-semibold md:text-4xl text-foreground">{heading}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Tabs defaultValue={tabs[0].value} className="mt-8">
          <TabsList className="container flex flex-col items-center justify-center gap-4 sm:flex-row md:gap-10">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground cursor-pointer"
              >
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mx-auto mt-8 max-w-screen-xl rounded-2xl bg-muted/70 p-6 lg:p-16">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="grid place-items-center gap-20 lg:grid-cols-2 lg:gap-10"
              >
                <div className="flex flex-col gap-5">
                  <Badge variant="outline" className="w-fit bg-background">{tab.content.badge}</Badge>
                  <h3 className="text-3xl font-semibold lg:text-5xl text-foreground">{tab.content.title}</h3>
                  <p className="text-muted-foreground lg:text-lg">{tab.content.description}</p>
                  <Button className="mt-2.5 w-fit gap-2" size="lg">{tab.content.buttonText}</Button>
                </div>
                <img
                  src={tab.content.imageSrc}
                  alt={tab.content.imageAlt}
                  className="rounded-xl object-cover h-64 w-full lg:h-auto"
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
};

export { Feature108 };
