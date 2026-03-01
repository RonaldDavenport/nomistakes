"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased bg-[#0c0a09] text-white">
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-zinc-400 text-sm mb-8">An unexpected error occurred. Our team has been notified.</p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
