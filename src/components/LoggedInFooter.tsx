import { createClient } from "@/utils/supabase/server";
import FooterNav from "./FooterNav";

export default async function LoggedInFooter() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    return null;
  }

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
