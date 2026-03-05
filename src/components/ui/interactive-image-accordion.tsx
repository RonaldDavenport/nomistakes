"use client";
import React, { useState } from "react";

const accordionItems = [
  {
    id: 1,
    title: "Client Onboarding",
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Proposals & Contracts",
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Project Delivery",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Payments & Invoicing",
    imageUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Growth & Referrals",
    imageUrl: "https://images.unsplash.com/photo-1553484771-371a605b060b?q=80&w=2070&auto=format&fit=crop",
  },
];

interface AccordionItemProps {
  item: (typeof accordionItems)[number];
  isActive: boolean;
  onMouseEnter: () => void;
}

const AccordionItem = ({ item, isActive, onMouseEnter }: AccordionItemProps) => {
  return (
    <div
      className={`relative h-[450px] rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-in-out ${
        isActive ? "w-[400px]" : "w-[60px]"
      }`}
      onMouseEnter={onMouseEnter}
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = "https://placehold.co/400x450/111113/ffffff?text=Kovra";
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      <span
        className={`absolute text-white text-lg font-semibold whitespace-nowrap transition-all duration-300 ease-in-out ${
          isActive
            ? "bottom-6 left-1/2 -translate-x-1/2 rotate-0"
            : "bottom-24 left-1/2 -translate-x-1/2 rotate-90"
        }`}
      >
        {item.title}
      </span>
    </div>
  );
};

export function LandingAccordionItem() {
  const [activeIndex, setActiveIndex] = useState(4);

  return (
    <div className="bg-background font-sans">
      <section className="container mx-auto px-4 py-12 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tighter">
              Run your entire service business from one place
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto md:mx-0">
              Kovra replaces Calendly, Dubsado, DocuSign, Toggl, and six other tools
              with a single OS built for serious service businesses.
            </p>
            <div className="mt-8">
              <a
                href="/auth/signup"
                className="inline-block bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-lg shadow-lg hover:opacity-90 transition-opacity duration-300"
              >
                Get started free
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="flex flex-row items-center justify-center gap-4 overflow-x-auto p-4">
              {accordionItems.map((item, index) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isActive={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
