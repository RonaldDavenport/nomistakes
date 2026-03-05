import type { Metadata } from "next";
import { AnalyticsInit } from "@/components/AnalyticsInit";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kovra — The Operating System for Service Businesses",
  description:
    "Build, sell, manage, and grow your service business. Website, CRM, proposals, payments — all in one platform.",
  openGraph: {
    title: "Kovra — The Operating System for Service Businesses",
    description:
      "Build, sell, manage, and grow your service business. All-in-one platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Syne:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AnalyticsInit />
        {children}
      </body>
    </html>
  );
}
