# E Track Project Intelligence Dashboard

Production-oriented admin dashboard for team-based project intelligence, built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Supabase, TanStack Query, React Hook Form, and Zod.

## Included

- Admin-first navigation and command dashboard
- Teams, employees, projects, blockers, leaderboard, reports, and paste-update flows
- Telegram update parser with preview and warning handling
- Employee scoring model with manual adjustment hooks and score history
- Team-level analytics with 10 dashboard charts
- Supabase-ready schema, RLS starter policies, and server actions
- Demo-backed fallback mode so the app renders before Supabase is connected

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create local env:

```bash
cp .env.example .env.local
```

3. Add your Supabase and app values to `.env.local`.

4. Apply the SQL in `supabase/migrations/20260430_initial.sql` to your Supabase project.

5. Start the app:

```bash
npm run dev
```

## Environment variables

See `.env.example`.

## Demo mode

If Supabase env vars are missing, the app runs in demo mode using seeded in-repo data. Reads still work, but writes only validate and return success messages until Supabase is connected.

## Production checklist

- Configure Supabase Auth providers and admin user seed
- Apply the SQL migration
- Add storage bucket policy for attachments
- Set Vercel env vars
- Replace report export stubs with PDF and CSV route handlers
- Optionally add middleware auth enforcement once your role claims flow is finalized
