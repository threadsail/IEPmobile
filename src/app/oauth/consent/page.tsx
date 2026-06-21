import Link from "next/link";
import { redirect } from "next/navigation";
import { SITE_NAME } from "@/lib/site-config";
import { formatOAuthScopes } from "@/lib/oauth-scope-labels";
import { getCurrentUser } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";

type Props = {
  searchParams: Promise<{ authorization_id?: string }>;
};

function consentLoginPath(authorizationId: string): string {
  const returnTo = `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`;
  return `/auth?next=${encodeURIComponent(returnTo)}`;
}

export default async function OAuthConsentPage({ searchParams }: Props) {
  const { authorization_id: authorizationId } = await searchParams;

  if (!authorizationId) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-xl border border-red-200/80 bg-red-50/90 p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-red-950/40">
          <h1 className="text-lg font-semibold text-red-900 dark:text-red-100">
            Missing authorization request
          </h1>
          <p className="mt-2 text-sm text-red-800 dark:text-red-200">
            This page requires an authorization ID from an OAuth sign-in request.
          </p>
          <Link
            href="/auth"
            className="mt-6 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(consentLoginPath(authorizationId));
  }

  const supabase = await createClient();
  const { data: authDetails, error } =
    await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

  if (error || !authDetails) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-xl border border-red-200/80 bg-red-50/90 p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-red-950/40">
          <h1 className="text-lg font-semibold text-red-900 dark:text-red-100">
            Authorization request invalid
          </h1>
          <p className="mt-2 text-sm text-red-800 dark:text-red-200">
            {error?.message ?? "This authorization request could not be loaded."}
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!("authorization_id" in authDetails)) {
    redirect(authDetails.redirect_url);
  }

  const scopes = formatOAuthScopes(authDetails.scope);
  const clientName = authDetails.client.name || "An application";

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-zinc-200/80 bg-white/90 p-8 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900/90">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Authorize access
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {clientName}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          <strong className="font-medium text-zinc-800 dark:text-zinc-200">
            {clientName}
          </strong>{" "}
          wants to access your {SITE_NAME} account
          {user.email ? (
            <>
              {" "}
              (<span className="font-medium">{user.email}</span>)
            </>
          ) : null}
          .
        </p>

        {scopes.length > 0 ? (
          <div className="mt-6 rounded-lg border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-700/80 dark:bg-zinc-800/50">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Requested permissions
            </p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              {scopes.map((scope) => (
                <li key={scope} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  <span>{scope}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          You will be returned to the application after approving or denying this
          request.
        </p>

        <form action="/api/oauth/decision" method="POST" className="mt-6 flex gap-3">
          <input type="hidden" name="authorization_id" value={authorizationId} />
          <button
            type="submit"
            name="decision"
            value="deny"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Deny
          </button>
          <button
            type="submit"
            name="decision"
            value="approve"
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Allow
          </button>
        </form>
      </div>
    </div>
  );
}
