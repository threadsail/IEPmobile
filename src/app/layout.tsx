import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { SITE_NAME } from "@/lib/site-config";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "IEP management for teachers and teams—schedules, activities, and student data in one place.",
  alternates: {
    canonical: "/",
    types: {
      "text/plain": [{ url: "/llms.txt", title: "LLM site index" }],
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description:
      "IEP management for teachers and teams—schedules, activities, and student data in one place.",
    url: "/",
  },
  icons: {
    icon: "/pencil-logo.png",
    apple: "/pencil-logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isComingSoon = pathname.startsWith("/coming-soon");

  return (
    <html lang="en">
      <body className="antialiased">
        {isComingSoon ? children : <AppShell>{children}</AppShell>}
      </body>
    </html>
  );
}
