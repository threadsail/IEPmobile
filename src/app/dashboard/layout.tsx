import { redirect } from "next/navigation";
import { ensureUserProfileSetup } from "@/lib/ensure-user-profile";
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

  await ensureUserProfileSetup(user.id);

  return <>{children}</>;
}
