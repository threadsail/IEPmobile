import { getCurrentUser } from "@/utils/auth";
import AppHeader from "@/components/AppHeader";
import LoggedInFooter from "@/components/LoggedInFooter";
import LoggedInWorkspaceArea from "@/components/LoggedInWorkspaceArea";
import SiteFooter from "@/components/SiteFooter";

export default async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div
      className={
        user
          ? "flex min-h-screen flex-col md:flex-row"
          : "flex min-h-screen flex-col"
      }
    >
      <AppHeader user={user} />

      {user ? (
        <LoggedInWorkspaceArea
          bottom={
            <>
              <LoggedInFooter />
              <SiteFooter hideOnDesktop />
            </>
          }
        >
          {children}
        </LoggedInWorkspaceArea>
      ) : (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-8 pb-20">
            {children}
          </main>
          <LoggedInFooter />
          <SiteFooter />
        </div>
      )}
    </div>
  );
}
