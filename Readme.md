# Align Everyday

An editorial, dark-mode learning portfolio for independent professionals. The
prototype is built with Expo Router, NativeWind, and a typed Supabase client.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and add your Supabase project values.
3. Start Expo with `npm run start` (or `npm run web`).

The screens use mock data when Supabase credentials or an authenticated user ID
are not available, so the visual prototype works immediately.

## Routes

- `/` — daily dashboard and learning shelf
- `/course/[id]` — focused course workspace
- The center tab action opens the native add-to-shelf bottom sheet

## Data model

The typed client in `lib/supabase.ts` maps to `profiles`, `courses`, and `todos`.
The initial SQL migration lives in `supabase/migrations`. Replace the mock user
ID in your auth layer and pass the active session user to `useDashboardData` and
`useCourseWorkspace` when authentication is connected.
