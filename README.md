# NetLab

A telecom & networking study toolkit — subnet calculator, RF formula solvers,
quizzes with saved scores, and a course blog. Built for a telecommunications
student (and a professor who wants to read the database without a headache).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer
Motion · Supabase (Postgres + Auth) · Vitest · pnpm · deploy-ready for Vercel.

---

## 1. Create the Supabase project

1. Sign in at [supabase.com](https://supabase.com) and create a new project
   (any name, e.g. `netlab`). Pick the region closest to the students.
2. Save the database password somewhere safe — you won't need it for this app,
   but you will if you ever connect directly.

## 2. Run the SQL (two files, in order)

Open **SQL Editor** in the Supabase dashboard and run these, one at a time:

| Order | File | What it does |
|---|---|---|
| 1 | `supabase/migrations/0001_init.sql` | Creates `posts`, `questions`, `quiz_results`, `profiles`, the admin helper, RLS policies, and a trigger that creates a profile for every new signup |
| 2 | `supabase/seed.sql` | Inserts 5 sample blog posts and 20 quiz questions |

Both files are plain SQL — paste the whole file, press Run. When it says
`Success. No rows returned`, it worked.

## 3. Make the first admin

1. In the app, go to `/login` → **sign up** with your (the professor's) email
   and a password.
2. If the project requires email confirmation, click the link Supabase sends.
3. Back in the Supabase **SQL Editor**, run:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

That account can now open `/admin` — Posts, Questions, and every saved quiz
score. Everyone else who signs up is a regular user and can only save their own
scores.

## 4. Set the environment variables

Copy `.env.example` to `.env.local` and fill it in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

You'll find both values in **Project Settings → API**.
> The `sb_secret_...` key is **not** used by this app and must never be
> committed — all privileged writes go through RLS policies that check
> `profiles.role = 'admin'`.

## 5. Run it locally

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # 48 unit tests for the subnet + telecom math
pnpm build      # production build
```

## 6. Deploy to Vercel

1. Push the repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo.
3. Add the three environment variables from step 4 (use your real domain in
   `NEXT_PUBLIC_SITE_URL`, e.g. `https://netlab.vercel.app`).
4. Deploy. Add the deployed URL to **Supabase → Authentication → URL
   Configuration** (Site URL + redirect URLs) so sign-in works in production.

---

## What's inside

```
src/
├── app/
│   ├── page.tsx               # hero + tool cards + latest posts
│   ├── subnet/                # IPv4 calculator + VLSM-lite splitter
│   ├── formulas/              # 8 tabbed live calculators
│   ├── quiz/                  # generated drills + theory bank, scores saved
│   ├── blog/, blog/[slug]/    # markdown articles, category filter, search
│   ├── login/                 # sign in / sign up
│   ├── admin/                 # role-guarded CRUD + results viewer
│   └── sitemap.ts, robots.ts, icon.svg
├── components/                # Navbar, ToolCard, ResultRow, QuizCard, …
├── lib/
│   ├── subnet.ts              # pure IPv4 math (tested, /31 + /32 aware)
│   ├── telecom.ts             # pure formula functions (tested)
│   ├── quiz/generator.ts      # seeded subnetting question generator
│   └── supabase/              # browser + server clients (SSR-safe)
└── middleware.ts              # session refresh + /admin guard
supabase/
├── migrations/0001_init.sql   # schema + RLS
└── seed.sql                   # 5 posts + 20 questions
```

### Database at a glance (professor-friendly)

| Table | Read | Write |
|---|---|---|
| `posts` | everyone, published only | `role='admin'` only |
| `questions` | everyone | `role='admin'` only |
| `quiz_results` | own rows (+ admin reads all) | logged-in user inserts own |
| `profiles` | own row (+ admin reads all) | managed via SQL editor |

All content is plain Markdown with GFM tables, and ```` ```cisco ```` code
blocks render as styled CLI snippets.

### The formulas (all in `lib/telecom.ts`)

dB↔ratio (10·log / 20·log), dBm↔mW, Shannon `C = B·log₂(1+SNR)`, SNR↔dB,
FSPL `20log(d_km)+20log(f_MHz)+32.44`, link budget margin, Nyquist
`2B·log₂(M)`, attenuation `α×length`, transfer time.
