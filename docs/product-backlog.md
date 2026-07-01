# Align Everyday — Product Backlog

This backlog begins after the implemented prototype baseline: authentication, onboarding, course CRUD, alignment CRUD, progress tracking, demo mode, profiles, and portfolio preview.

## Now — make the product trustworthy

### P0 · Ship and verify the production Supabase foundation

**User story:** As a learner, I need my private learning data to remain available and isolated so I can trust Align Everyday as my system of record.

**Acceptance criteria**

- All migrations run successfully in a clean Supabase project.
- Sign-up automatically creates exactly one profile.
- RLS tests prove users cannot read or mutate another user’s courses or todos.
- Public portfolio policies expose only public profiles and completed courses.
- A rollback and backup note exists for every production migration.

**Estimate:** 5 points · **Priority:** Urgent · **Area:** Platform

### P0 · Automate the critical learner journey

**User story:** As the product team, we need automated coverage of the primary journey so improvements do not silently break activation.

**Acceptance criteria**

- Tests cover sign-up/onboarding, demo entry, course creation, alignment creation, completion, and course progress.
- Tests cover editing courses and alignments.
- Tests cover logout and protected-route redirects.
- The suite runs in CI on every pull request.

**Estimate:** 8 points · **Priority:** Urgent · **Area:** Quality

### P0 · Add production observability and actionable errors

**User story:** As the product team, we need to see crashes and failed mutations so user problems can be fixed before trust is lost.

**Acceptance criteria**

- Native and web crashes include release, route, and device context.
- Supabase mutation failures are captured without credentials or personal content.
- Users receive retryable, human-readable failure states.
- A release health dashboard and alert threshold are documented.

**Estimate:** 5 points · **Priority:** Urgent · **Area:** Platform

### P1 · Complete device-level authentication QA

**User story:** As a returning learner, I need email confirmation and password recovery links to return me to the correct app screen.

**Acceptance criteria**

- Confirmation and recovery links work on iOS, Android, and web.
- Expired and reused links show a recovery path.
- Sessions persist across app restarts and refresh only while appropriate.
- No protected screen flashes before session resolution.

**Estimate:** 5 points · **Priority:** High · **Area:** Authentication

### P1 · Establish CI quality gates

**User story:** As the product team, we need every change checked consistently so the main branch remains releasable.

**Acceptance criteria**

- CI runs type-checking, formatting, tests, and Expo web export.
- Dependency compatibility is checked against the pinned Expo SDK.
- Failed checks block merging.
- Release notes and environment requirements are documented.

**Estimate:** 3 points · **Priority:** High · **Area:** Quality

## Next — make daily learning meaningfully easier

### P1 · Import course metadata from learning links

**User story:** As a learner, I want a pasted YouTube, Udemy, or Coursera link to prefill useful course details so capture feels effortless.

**Acceptance criteria**

- Supported links detect platform and populate title and available duration metadata.
- Previewed metadata can be edited before saving.
- Unsupported/private links fall back to manual entry without losing input.
- Metadata retrieval happens server-side with safe timeouts and rate limits.

**Estimate:** 8 points · **Priority:** High · **Area:** Learning Shelf

### P1 · Model chapters and learning milestones

**User story:** As a learner, I want a course broken into real milestones so progress reflects what I have actually covered.

**Acceptance criteria**

- A migration introduces ordered course milestones with duration and completion state.
- Users can add, edit, reorder, complete, and delete milestones.
- Course progress can be derived from milestone completion or elapsed time.
- Existing courses receive a safe default milestone without data loss.

**Estimate:** 8 points · **Priority:** High · **Area:** Learning Shelf

### P1 · Build a focused daily planning flow

**User story:** As a learner, I want to choose and order today’s most important alignments so the dashboard tells me what to do next.

**Acceptance criteria**

- Alignments support full date selection, optional time, and manual priority.
- Today’s list can be reordered with persisted ordering.
- Overdue work is visible without overwhelming the current day.
- Completing an action gives immediate feedback and an undo option.

**Estimate:** 8 points · **Priority:** High · **Area:** Alignments

### P1 · Calculate real consistency and learning metrics

**User story:** As a learner, I want streaks and progress metrics based on my activity so motivation feels earned rather than decorative.

**Acceptance criteria**

- Daily activity records completed alignments and learning-time updates.
- Streak rules are documented and timezone-safe.
- Dashboard metrics use persisted activity instead of static values.
- Backfilled data does not create false streaks.

**Estimate:** 5 points · **Priority:** High · **Area:** Motivation

### P2 · Add course archive and safe deletion

**User story:** As a learner, I want to remove abandoned or accidental courses without unintentionally losing useful work.

**Acceptance criteria**

- Courses can be archived independently of backlog/completion status.
- Delete clearly explains what happens to linked alignments.
- Destructive actions require confirmation and support a short undo window where feasible.
- Archived courses are restorable.

**Estimate:** 5 points · **Priority:** Normal · **Area:** Learning Shelf

### P2 · Add recurring alignments and reminders

**User story:** As a learner, I want recurring learning habits and respectful reminders so consistency requires less remembering.

**Acceptance criteria**

- Users can create daily, weekly, and selected-day recurrence rules.
- Notification permission is requested only after the user enables reminders.
- Reminder time respects local timezone and quiet hours.
- Completing one occurrence does not complete the entire recurring series.

**Estimate:** 8 points · **Priority:** Normal · **Area:** Alignments

### P2 · Complete accessibility and small-device QA

**User story:** As a learner using assistive technology or a small device, I need every core flow to remain clear and operable.

**Acceptance criteria**

- Core screens pass screen-reader navigation on iOS and Android.
- Touch targets, contrast, text scaling, and keyboard navigation meet agreed standards.
- Bottom sheets remain usable with the keyboard open and large text enabled.
- The layout is verified at the smallest supported viewport and tablet widths.

**Estimate:** 5 points · **Priority:** Normal · **Area:** Experience

## Later — turn learning into visible professional proof

### P1 · Attach evidence to completed work

**User story:** As a learner, I want to attach links, screenshots, notes, and outcomes to completed alignments so my portfolio proves application, not consumption.

**Acceptance criteria**

- Completed courses support structured evidence items and a reflection.
- Evidence supports links and safely stored images.
- Private evidence never appears publicly by default.
- Portfolio preview shows exactly what will be published.

**Estimate:** 8 points · **Priority:** High · **Area:** Portfolio

### P1 · Publish a shareable portfolio profile

**User story:** As a self-taught professional, I want a shareable public profile so employers and collaborators can understand my learning trajectory and proof of work.

**Acceptance criteria**

- Public profiles have stable username-based URLs.
- Only opted-in profile fields, completed courses, and public evidence are shown.
- Social metadata produces useful link previews.
- Owners can unpublish instantly and preview while private.

**Estimate:** 8 points · **Priority:** High · **Area:** Portfolio

### P2 · Create a weekly learning review

**User story:** As a learner, I want a concise weekly review so I can see momentum, notice drift, and choose the next week intentionally.

**Acceptance criteria**

- Review summarizes time learned, alignments shipped, courses advanced, and streak state.
- Users can record a reflection and select next week’s focus.
- Empty and low-activity weeks remain constructive rather than punitive.
- Review data is derived from persisted activity records.

**Estimate:** 8 points · **Priority:** Normal · **Area:** Insights

### P2 · Support resilient offline work and synchronization

**User story:** As a mobile learner, I want to capture and complete work during unreliable connectivity so the app remains dependable.

**Acceptance criteria**

- Reads use a durable local cache.
- Course and alignment mutations queue offline and synchronize when connectivity returns.
- Conflicts use a documented resolution strategy.
- Sync state is visible without interrupting normal use.

**Estimate:** 8 points · **Priority:** Normal · **Area:** Platform
