# Align Everyday

Align Everyday is an identity-driven learning and productivity app for self-taught professionals. It connects courses, daily actions, progress tracking, and a visible portfolio in one calm system.

## Product flow

1. Create an account with a required email address, continue with Google, or enter the interactive demo.
2. Complete the short identity and portfolio onboarding.
3. Add a YouTube, Udemy, Coursera, or manual learning path.
4. Turn the learning path into concrete daily alignments.
5. Check off work and update elapsed learning time.
6. Complete a course and surface it in the learning portfolio.

The app includes sign-in, sign-up, email recovery, protected routes, onboarding, shelf filters, course progress, task CRUD, profile controls, and resilient loading, empty, and error states.

## Stack

- Expo SDK 56 and Expo Router
- React Native with strict TypeScript
- NativeWind
- Supabase Auth and PostgreSQL with row-level security
- AsyncStorage-backed native sessions

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and add the public Supabase values:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-client-safe-key
   ```

3. Apply the SQL files in `supabase/migrations` in filename order. They create the core tables, user-profile trigger, RLS policies, and public portfolio read policies.

4. In Supabase Auth, keep Email enabled, enable **Confirm email**, and enable the
   Google provider with the Web OAuth client ID and secret from Google Cloud. Add
   `aligneveryday://onboarding` and the deployed web `/onboarding` URL to the
   Supabase redirect allow list. Google Cloud's authorized redirect URI is the
   callback URL shown on the Supabase Google provider page.

5. Start the app:

   ```bash
   npm run start
   ```

Use “Explore with demo data” on the welcome screen to evaluate the full productivity flow without creating an account.

## Validation

```bash
npm run format:check
npm run typecheck
npm run expo:check
npm run build
npm run test:e2e
```

Database migration, backup, rollback, and RLS test commands are documented in
[`docs/database-operations.md`](docs/database-operations.md).
Crash reporting, privacy rules, release dashboards, and alert thresholds are documented in
[`docs/observability.md`](docs/observability.md).

`npm run build` produces the Expo web export in `dist`.
The Playwright suite uses deterministic mocked authentication and demo data; it
does not create users or mutate records in your Supabase project. Pull requests
and pushes to `main` run all quality gates in GitHub Actions.

## ClickUp product planning

The product backlog lives in **Eniola Aderounmu's Workspace → Team Space → Projects → Align Everyday — Product Backlog**.

Codex can safely synchronize the canonical story set without creating duplicates:

```bash
node scripts/sync-clickup-backlog.mjs
```

The script reads `CLICKUP_API_TOKEN` from the ignored local `.env` file. Never prefix this credential with `EXPO_PUBLIC_` or include it in application code.
