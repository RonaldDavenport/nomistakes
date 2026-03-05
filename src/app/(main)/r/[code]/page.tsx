import { redirect } from "next/navigation";

// Server component — handles referral click tracking and redirects
export default async function ReferralRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Call the click endpoint server-side
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kovra.app";
  try {
    const res = await fetch(`${appUrl}/api/referrals/${code}/click`, {
      redirect: "manual",
    });

    if (res.status === 302 || res.status === 301) {
      const location = res.headers.get("location");
      if (location) {
        redirect(location);
      }
    }
  } catch {
    // Fall through to fallback
  }

  // Fallback
  redirect("/");
}
