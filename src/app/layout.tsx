import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "No Mistakes — AI Builds and Runs Your Entire Business",
  description:
    "Answer 4 questions. Get a fully deployed business in 60 seconds. No code. No experience. No mistakes.",
  openGraph: {
    title: "No Mistakes — AI Builds and Runs Your Entire Business",
    description:
      "Answer 4 questions. Get a fully deployed business in 60 seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
