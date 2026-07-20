# Align Everyday Web Version Plan

Align Everyday can support mobile and web from the same Expo codebase. We should not clone the app into a separate React or Next.js project yet. A separate clone would create duplicate screens, duplicated bugs, and extra work every time the product changes.

The recommended path is:

> One shared Expo app, one shared Supabase backend, separate mobile and web deployment targets.

## What “synced” means

Mobile and web should use the same:

- Supabase project;
- authentication system;
- profiles;
- courses;
- alignments/tasks;
- trophy rooms;
- portfolio invitations;
- public portfolio routes;
- future AI suggestions and trophy summaries.

If a user creates a course on mobile, it should appear on web. If they complete an alignment on web, the mobile app should update after refresh/sync.

## Current status

The project already has Expo web support.

Relevant scripts:

```json
{
  "web": "expo start --web",
  "build": "expo export --platform web"
}
```

This means:

- local web development already exists;
- static web export already exists;
- the current app can be deployed as a web app after environment variables are configured.

## Why we should not clone into a separate app yet

Avoid a separate web clone because:

- auth logic would have to be rebuilt;
- Supabase queries would need to be duplicated;
- RLS-sensitive features could drift;
- every screen change would need to be implemented twice;
- mobile-first UX and web UX would slowly become inconsistent;
- AI integration would need duplicate clients later.

Instead, we should use responsive layouts inside the existing Expo app.

## Recommended architecture

```text
Expo Mobile App ─┐
                 ├── Supabase Auth
Expo Web App ────┤── Supabase Database
                 ├── Supabase Storage
                 └── Supabase Edge Functions / AI
```

The app layer changes per platform, but the data layer remains shared.

## Web-specific product experience

The web version should feel like a premium productivity dashboard, not a stretched phone screen.

### Web dashboard

Desktop should eventually use a wider layout:

- left column: Today, streak, overdue state;
- center column: alignments;
- right column: focus shelf / trophy preview.

Mobile web can keep the current stacked layout.

### Web learning shelf

Desktop should show courses in a grid instead of only horizontal scroll.

### Web alignments

Desktop should support:

- larger task list;
- faster editing;
- keyboard-friendly interaction;
- eventually drag-and-drop ordering.

### Web trophy room

This is the strongest public-web surface.

It should support:

- public username URLs;
- polished trophy cards;
- social sharing;
- future SEO/social preview metadata;
- invite acceptance links.

## Routing plan

Keep the current Expo Router routes.

Important routes:

```text
/
/alignments
/shelf
/profile
/portfolio
/portfolio/[username]
/course/[id]
```

For web, `/portfolio/[username]` becomes especially important because this is what other people will view.

## Environment variables

The web deployment needs the same public environment variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_APP_ENV=production
```

Do not expose service-role keys in the client.

Future AI keys must not be exposed to web or mobile. AI calls should go through Supabase Edge Functions.

## Auth behavior

Email/password auth can work across mobile and web.

Google auth needs redirect URLs configured for each environment:

- local web;
- production web domain;
- Expo/native app scheme;
- password reset route;
- email confirmation route.

Before production launch, test:

- sign up on web, use account on mobile;
- sign up on mobile, use account on web;
- password reset from web;
- Google auth redirect on web;
- Google auth redirect on Android/iOS.

## Public portfolio behavior

Public portfolio access should work like this:

- if `portfolio_public = true`, anonymous visitors can view the public profile and completed trophies;
- if `portfolio_public = false`, anonymous visitors cannot view it;
- accepted invitees can view shared trophies after signing in;
- private alignments/todos are never public.

This is already aligned with the existing RLS direction.

## Delivery phases

### Phase 1: Web readiness check

Goal: prove the current app builds and runs as web.

Tasks:

1. Run `npm run web` locally.
2. Run `npm run build`.
3. Verify auth screens.
4. Verify dashboard.
5. Verify course workspace.
6. Verify alignments.
7. Verify trophy room.
8. Verify public portfolio route.

Definition of done:

- no web runtime crashes;
- layout is usable at mobile, tablet, and desktop widths;
- Supabase reads/writes work from web.

### Phase 2: Web deployment

Goal: publish a web preview.

Tasks:

1. Choose hosting target.
2. Configure production environment variables.
3. Deploy static web export.
4. Add the deployment URL to Supabase auth redirect allowlist.
5. Test sign-up, sign-in, password reset, Google auth, and public portfolio links.

Definition of done:

- users can open the app in a browser;
- web and mobile share the same account/data.

### Phase 3: Responsive UX polish

Goal: make desktop feel intentional.

Tasks:

1. Add responsive layout helpers.
2. Create desktop dashboard layout.
3. Convert shelf to responsive grid on large screens.
4. Improve alignments layout for keyboard/mouse.
5. Improve trophy room public presentation.

Definition of done:

- web feels like a real desktop app, not a stretched mobile screen.

### Phase 4: Public portfolio polish

Goal: make public sharing market-ready.

Tasks:

1. Polish `/portfolio/[username]`.
2. Add empty states for private/unavailable portfolios.
3. Add share copy.
4. Add social preview metadata where supported.
5. Add published trophy summaries after AI trophy work lands.

Definition of done:

- the public portfolio is good enough to send to friends, mentors, recruiters, or collaborators.

### Phase 5: AI-ready shared client

Goal: ensure AI works identically on mobile and web.

Tasks:

1. Route all AI calls through Supabase Edge Functions.
2. Use the same app-side AI helper on mobile and web.
3. Store AI suggestions in Supabase.
4. Test AI-generated course plans from both platforms.

Definition of done:

- AI suggestions created on web appear on mobile, and vice versa.

## First web ticket

Recommended first ticket:

> Prepare Align Everyday web preview: verify Expo web build, document environment variables, test Supabase auth/data sync, and create a responsive polish backlog.

This gives us the web version without fragmenting the codebase.

## Decision

Do not clone into a separate app right now.

Use the existing Expo project as the web app and mobile app. Only split later if the web product becomes meaningfully different, such as a heavy SEO marketing site, admin console, or employer-facing analytics dashboard.
