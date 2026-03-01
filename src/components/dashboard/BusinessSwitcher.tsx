"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useBusinessContext } from "./BusinessProvider";
import { T, CTA_GRAD } from "@/lib/design-tokens";

export function BusinessSwitcher() {
  const { business, allBusinesses } = useBusinessContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!business) return null;

  const primaryColor = (business.brand as { colors?: { primary?: string } })?.colors?.primary || T.purple;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left"
        style={{ color: T.text }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          {business.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: T.text }}>{business.name}</p>
          <p className="text-xs truncate capitalize" style={{ color: T.text3 }}>{business.subtype || business.type}</p>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: T.text3 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: T.bgEl, border: `1px solid ${T.border}` }}
        >
          <div className="p-2 max-h-64 overflow-y-auto">
            {allBusinesses.map((biz) => {
              const isActive = biz.id === business.id;
              const bizColor = (biz.brand as { colors?: { primary?: string } })?.colors?.primary || T.purple;
              return (
                <Link
                  key={biz.id}
                  href={`/dashboard/${biz.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                  style={
                    isActive
                      ? { background: "rgba(123,57,252,0.10)", border: "1px solid rgba(123,57,252,0.20)" }
                      : {}
                  }
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: bizColor }}
                  >
                    {biz.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: isActive ? T.purpleLight : T.text }}>
                      {biz.name}
                    </p>
                    <p className="text-xs capitalize" style={{ color: T.text3 }}>{biz.subtype || biz.type}</p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: T.purple }} />
                  )}
                </Link>
              );
            })}
          </div>
          <div className="p-2" style={{ borderTop: `1px solid ${T.border}` }}>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
              style={{ color: T.text2 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              View All Businesses
            </Link>
            <Link
              href="/wizard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
              style={{ color: T.text2 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create New Business
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
