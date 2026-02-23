import { getCurrentUser } from "@/utils/auth";
import FooterNav from "./FooterNav";

export default async function LoggedInFooter() {
  const user = await getCurrentUser();

  if (!user) return null;

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center border-t border-zinc-200/80 bg-white/80 py-2 backdrop-blur-md dark:border-zinc-700/50 dark:bg-white/10"
      aria-label="Quick navigation"
    >
      <FooterNav />
    </footer>
  );
}
