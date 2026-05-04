This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment variables

Copy `.env.example` to `.env.local` and fill in values. At minimum you need `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, and `NEXT_PUBLIC_APP_URL` (your site origin, e.g. `http://localhost:3000`).

## Social sign-in (Supabase OAuth)

The auth page offers **Continue with Google** and **Continue with Microsoft** (`signInWithOAuth` with providers **`google`** and **`azure`** in `src/app/auth/AuthForm.tsx`). OAuth returns to **`/auth/callback`** (`src/app/auth/callback/route.ts`).

**Google:** [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth client ID (Web). Redirect URI: `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`. **Supabase** → Authentication → Providers → **Google**: enable; paste client ID and secret.

**Microsoft (Entra):** [Entra admin center](https://entra.microsoft.com/) → App registrations → redirect URI `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`. **Supabase** → Providers → **Azure**: enable; paste Entra client ID and secret.

**Both:** **Supabase** → Authentication → URL configuration: **Site URL** and **Redirect URLs** including `http://localhost:3000/auth/callback` and your production `/auth/callback`. Credentials live in Supabase, not in `.env`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
