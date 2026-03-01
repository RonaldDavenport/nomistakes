"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { T, CTA_GRAD } from "@/lib/design-tokens";

interface SiteAdminBarProps {
  ownerId: string;
  businessId: string;
  businessName: string;
}

export default function SiteAdminBar({ ownerId, businessId, businessName }: SiteAdminBarProps) {
  const [isOwner, setIsOwner] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && user.id === ownerId) setIsOwner(true);
    });
  }, [ownerId]);

  // Push site content down when bar is visible
  useEffect(() => {
    if (isOwner && !hidden) {
      document.body.style.paddingTop = "44px";
    } else {
      document.body.style.paddingTop = "0px";
    }
    return () => { document.body.style.paddingTop = "0px"; };
  }, [isOwner, hidden]);

  if (!isOwner) return null;

  // "View as visitor" — show small re-show pill
  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        style={{
          position: "fixed",
          top: 8,
          right: 8,
          zIndex: 9999,
          background: "#1e1e2e",
          color: "#a1a1aa",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "6px 14px",
          fontSize: 12,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Admin
      </button>
    );
  }

  const linkStyle: React.CSSProperties = {
    color: "#d4d4d8",
    textDecoration: "none",
    fontSize: 13,
    padding: "4px 10px",
    borderRadius: 4,
    transition: "background 0.15s",
    whiteSpace: "nowrap",
  };

  return (
    <>
      {/* Hide link labels on small screens */}
      <style>{`
        @media (max-width: 639px) {
          .admin-bar-label { display: none !important; }
          .admin-bar-link { padding: 6px !important; }
        }
      `}</style>
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 44,
        zIndex: 9999,
        background: "#1e1e2e",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 13,
        color: "#e4e4e7",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }}>
        {/* Left: logo + business name + links */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          {/* NM logo pill */}
          <a
            href={`/dashboard/${businessId}`}
            style={{
              background: CTA_GRAD,
              color: "#fff",
              fontWeight: 700,
              fontSize: 11,
              padding: "3px 8px",
              borderRadius: 4,
              textDecoration: "none",
              letterSpacing: 0.5,
              flexShrink: 0,
            }}
          >
            NM
          </a>
          <span style={{ color: "#a1a1aa", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
            {businessName}
          </span>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

          <a href={`/dashboard/${businessId}/editor`} className="admin-bar-link" style={linkStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span className="admin-bar-label">Edit Site</span>
            </span>
          </a>
          <a href={`/dashboard/${businessId}`} className="admin-bar-link" style={linkStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              <span className="admin-bar-label">Dashboard</span>
            </span>
          </a>
          <a href={`/dashboard/${businessId}/settings`} className="admin-bar-link" style={linkStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              <span className="admin-bar-label">Settings</span>
            </span>
          </a>
        </div>

        {/* Right: view as visitor */}
        <button
          onClick={() => setHidden(true)}
          style={{
            color: "#71717a",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 4,
            padding: "4px 10px",
            fontSize: 12,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#d4d4d8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#71717a"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="admin-bar-label">View as Visitor</span>
          </span>
        </button>
      </div>
    </>
  );
}
