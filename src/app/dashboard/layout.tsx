import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/auth";

/** Always run auth + fresh markup for dashboard (avoids stale shell after OAuth / deploys). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  return <>{children}</>;
}
