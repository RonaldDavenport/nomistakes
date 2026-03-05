"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-x-hidden">
        <section>
          <div className="pb-24 pt-12 md:pb-32 lg:pb-56 lg:pt-44">
            <div className="relative mx-auto flex max-w-6xl flex-col px-6 lg:block">
              <div className="mx-auto max-w-lg text-center lg:ml-0 lg:w-1/2 lg:text-left">
                <h1 className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16 xl:text-7xl">
                  Run your service business from one place
                </h1>
                <p className="mt-8 max-w-2xl text-pretty text-lg text-muted-foreground">
                  Kovra replaces Calendly, Dubsado, HoneyBook, DocuSign, and six other
                  tools with one OS built for serious service businesses.
                </p>
                <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                  <Button asChild size="lg" className="px-5 text-base">
                    <Link href="/auth/signup">
                      <span className="text-nowrap">Start free</span>
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost" className="px-5 text-base">
                    <Link href="#features">
                      <span className="text-nowrap">See all features</span>
                    </Link>
                  </Button>
                </div>
              </div>
              <img
                className="pointer-events-none order-first ml-auto h-56 w-full object-cover sm:h-96 lg:absolute lg:inset-0 lg:-right-20 lg:-top-96 lg:order-last lg:h-max lg:w-2/3 lg:object-contain"
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop"
                alt="Service business dashboard"
                height="4000"
                width="3000"
              />
            </div>
          </div>
        </section>

        <section className="bg-background pb-16 md:pb-32">
          <div className="group relative m-auto max-w-6xl px-6">
            <div className="flex flex-col items-center md:flex-row">
              <div className="md:max-w-44 md:border-r md:border-border md:pr-6">
                <p className="text-end text-sm text-muted-foreground">Replaces all of these</p>
              </div>
              <div className="relative py-6 md:w-[calc(100%-11rem)]">
                <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
                  {["Calendly", "Dubsado", "HoneyBook", "DocuSign", "Toggl", "Pipedrive", "Typeform", "ManyChat"].map(
                    (name) => (
                      <div key={name} className="flex items-center px-2">
                        <span className="text-muted-foreground font-medium text-sm line-through decoration-muted-foreground/40">
                          {name}
                        </span>
                      </div>
                    )
                  )}
                </InfiniteSlider>
                <div className="bg-gradient-to-r from-background absolute inset-y-0 left-0 w-20" />
                <div className="bg-gradient-to-l from-background absolute inset-y-0 right-0 w-20" />
                <ProgressiveBlur
                  className="pointer-events-none absolute left-0 top-0 h-full w-20"
                  direction="left"
                  blurIntensity={1}
                />
                <ProgressiveBlur
                  className="pointer-events-none absolute right-0 top-0 h-full w-20"
                  direction="right"
                  blurIntensity={1}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const menuItems = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
];

const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  return (
    <header>
      <nav
        data-state={menuState ? "active" : undefined}
        className="group bg-background/50 fixed z-20 w-full border-b border-border backdrop-blur-3xl"
      >
        <div className="mx-auto max-w-6xl px-6 transition-all duration-300">
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center space-x-2">
                <span className="text-lg font-bold text-foreground tracking-tight">Kovra</span>
              </Link>
              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
              <div className="hidden lg:block">
                <ul className="flex gap-8 text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link href={item.href} className="text-muted-foreground hover:text-foreground block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-border p-6 shadow-2xl md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link href={item.href} className="text-muted-foreground hover:text-foreground block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button asChild variant="outline" size="sm">
                  <Link href="/auth/login"><span>Login</span></Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/signup"><span>Sign Up</span></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
