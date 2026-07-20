# Align Everyday AI Integration Roadmap

This roadmap defines how AI should be added to Align Everyday without turning the product into a generic chatbot. The principle is simple: AI should reduce friction, protect momentum, and help learners turn scattered self-education into visible proof.

## Product principle

AI in Align Everyday should feel like an intelligent learning operations assistant.

It should help users:

- start faster;
- plan realistic daily work;
- recover from missed deadlines;
- reflect on completed learning;
- turn private progress into portfolio-ready proof.

It should not:

- replace user agency;
- expose private tasks publicly;
- make large data changes without confirmation;
- require users to learn prompting before getting value.

## Target AI features

### 1. Smart Add to Shelf

When a user pastes a course/video URL, AI should help create a complete learning path.

Inputs:

- pasted URL;
- optional manual title;
- selected platform;
- optional total duration;
- user’s current active courses.

Outputs:

- cleaned course title;
- platform detection;
- estimated runtime if available;
- course summary;
- suggested milestones;
- suggested first alignments;
- recommended schedule.

User experience:

1. User opens Add to Shelf.
2. User pastes a link.
3. App shows “Generate learning plan.”
4. AI returns editable suggestions.
5. User accepts, edits, or skips.
6. Accepted suggestions create course, milestones, and optional tasks.

MVP scope:

- Generate title, summary, 5 milestones, and 3 starter alignments from user-provided title/link/platform.
- Do not scrape paid course content.
- Do not promise exact runtime unless the user enters it.

### 2. AI Daily Plan

Each day, AI should suggest a realistic focus plan.

Inputs:

- active courses;
- today’s alignments;
- overdue alignments;
- upcoming due dates;
- streak state;
- optional available time.

Outputs:

- one primary learning focus;
- two or three suggested alignments;
- reason for the plan;
- streak protection note;
- optional reschedule suggestion.

User experience:

1. Dashboard shows a small AI planning card.
2. User taps “Plan my day.”
3. AI suggests a plan.
4. User can accept generated alignments or dismiss.

MVP scope:

- Generate suggestions only.
- Require user confirmation before creating tasks.

### 3. Smart Reschedule for Overdue Alignments

Overdue work should not create shame. AI should help users recover.

Inputs:

- overdue tasks;
- current week schedule;
- active courses;
- user-selected recovery intensity: gentle, balanced, aggressive.

Outputs:

- revised dates;
- suggested task splits;
- tasks that should be dropped or deferred;
- short encouragement copy.

User experience:

1. Overdue card says “Want help reorganizing this?”
2. User chooses recovery pace.
3. AI proposes a new schedule.
4. User accepts all, accepts some, or cancels.

MVP scope:

- Reschedule overdue tasks across the next 7 days.
- Do not auto-update without confirmation.

### 4. AI Trophy Summary

When a course is completed, AI should help turn it into public proof.

Inputs:

- completed course;
- completed linked alignments;
- total learning time;
- optional user notes;
- platform/source;
- portfolio identity/bio.

Outputs:

- trophy summary;
- skills learned;
- proof statement;
- short reflection;
- optional LinkedIn-style post.

User experience:

1. User completes a course.
2. App asks: “Generate trophy summary?”
3. AI drafts the summary.
4. User edits before publishing to Trophy Room.

MVP scope:

- Store generated summary as a draft.
- Never publish automatically.

### 5. AI Reflection Coach

After meaningful progress, AI should help users capture what they learned.

Inputs:

- messy user notes;
- completed task/course;
- course context.

Outputs:

- cleaned reflection;
- bullets of lessons learned;
- portfolio-friendly proof sentence;
- next-step suggestion.

MVP scope:

- User manually opens reflection from completed task/course.

### 6. Ask My Learning History

This is a later feature. It should let users ask questions about their own learning record.

Example questions:

- What did I learn this month?
- Which course is getting the most momentum?
- What should I finish next?
- What can I add to my portfolio?
- Write a weekly learning recap.

MVP scope:

- Do not build this first.
- It needs stronger activity history and semantic search.

## Technical architecture

### Client

The Expo app should never call AI providers directly.

The app should call Supabase Edge Functions, and those functions should call the AI provider.

Reasons:

- protects API keys;
- centralizes rate limits;
- lets us log AI usage;
- makes prompt/version changes possible without app releases;
- keeps privacy controls enforceable server-side.

### Server

Recommended Supabase Edge Functions:

- `ai-generate-course-plan`
- `ai-generate-daily-plan`
- `ai-reschedule-alignments`
- `ai-generate-trophy-summary`
- `ai-generate-reflection`

Each function should:

- authenticate the user;
- fetch only the user-owned records needed;
- validate inputs;
- call the AI provider;
- validate returned JSON;
- store suggestions as drafts;
- return safe structured output to the app.

### AI response format

Prefer structured JSON responses over plain prose.

Example course plan response:

```json
{
  "title": "Java Go for Beginners Full Course",
  "summary": "A beginner-friendly path through Java fundamentals.",
  "milestones": [
    {
      "title": "Setup and first program",
      "target_percentage": 0,
      "encouragement": "You have started the path."
    }
  ],
  "suggested_alignments": [
    {
      "title": "Install Java and run Hello World",
      "day_offset": 0
    }
  ]
}
```

## Data model

### Phase 1 migration

Add AI suggestion storage.

Suggested table:

```sql
create type public.ai_suggestion_status as enum (
  'draft',
  'accepted',
  'dismissed',
  'failed'
);

create type public.ai_suggestion_kind as enum (
  'course_plan',
  'daily_plan',
  'reschedule',
  'trophy_summary',
  'reflection'
);

create table public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.ai_suggestion_kind not null,
  status public.ai_suggestion_status not null default 'draft',
  source_course_id uuid references public.courses (id) on delete cascade,
  source_todo_id uuid references public.todos (id) on delete cascade,
  prompt_version text not null,
  input_snapshot jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  dismissed_at timestamptz
);
```

RLS:

- users can select their own suggestions;
- users can insert/update/delete only their own suggestions;
- no public access.

### Phase 2 migration

Add trophy summaries.

Suggested table:

```sql
create table public.trophy_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  summary text not null,
  skills text[] not null default '{}',
  proof_statement text,
  reflection text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id)
);
```

RLS:

- owner can manage;
- public can view only if summary is public, course is completed, and profile is public;
- accepted Trophy Room invitees can view public summary drafts that the owner has marked shareable.

### Phase 3 migration

Add learning activity history.

This is needed if we want streaks to count more than completed alignments.

Suggested table:

```sql
create type public.learning_activity_kind as enum (
  'alignment_completed',
  'course_progress_updated',
  'course_completed',
  'reflection_created',
  'trophy_published'
);

create table public.learning_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid references public.courses (id) on delete cascade,
  todo_id uuid references public.todos (id) on delete cascade,
  kind public.learning_activity_kind not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
```

This table becomes the source of truth for:

- daily streaks;
- weekly recaps;
- learning history questions;
- activity analytics.

## Privacy and safety rules

AI should never receive more user data than needed.

Rules:

- Do not send private todos when generating a public portfolio page unless the user explicitly asks to use them for a trophy summary.
- Do not include email addresses in prompts unless the email is directly required.
- Do not send invitation data to AI for unrelated tasks.
- Do not publish AI output automatically.
- Always show AI-generated public copy for user review.
- Store prompt version with every output.
- Keep input snapshots minimal and useful for debugging.

## UX surfaces

### Dashboard

Add:

- “Plan my day” AI card;
- “Protect your streak” copy;
- overdue recovery CTA.

### Add to Shelf

Add:

- “Generate learning plan” button after link/title input;
- editable AI suggestions before save.

### Alignments

Add:

- “Reschedule overdue” CTA;
- AI proposal preview;
- accept selected changes.

### Course Workspace

Add:

- generated milestone suggestions;
- reflection prompt after progress save;
- trophy summary CTA at course completion.

### Trophy Room

Add:

- AI-generated trophy draft;
- edit/publish workflow;
- public summary card.

## Build sequence

### Phase 0: Foundations

Goal: prepare the app for AI safely.

Tasks:

1. Create AI environment variables.
2. Add Supabase Edge Function structure.
3. Add `ai_suggestions` migration.
4. Add TypeScript types for AI suggestions.
5. Add shared AI client helper in the app.
6. Add server-side JSON schema validation.
7. Add observability tags for AI operations.

Definition of done:

- app can request a mock AI suggestion from an Edge Function;
- suggestion is stored for the authenticated user;
- RLS prevents cross-user access.

### Phase 1: Smart Add to Shelf

Goal: make course setup easier.

Tasks:

1. Build `ai-generate-course-plan` Edge Function.
2. Add “Generate learning plan” CTA to Add Shelf modal.
3. Render AI-generated title, summary, milestones, and tasks.
4. Let users accept/edit suggestions before creating records.
5. Store accepted suggestion status.

Definition of done:

- user can paste a course link/title;
- AI suggests a course plan;
- user can create course and first alignments from suggestions.

### Phase 2: AI Daily Plan

Goal: make the Today screen smarter.

Tasks:

1. Build `ai-generate-daily-plan` Edge Function.
2. Add dashboard AI planning card.
3. Include active courses, overdue tasks, today tasks, and streak state.
4. Show suggested plan as editable actions.
5. Create accepted alignments.

Definition of done:

- user can generate a realistic daily plan;
- accepted suggestions become tasks;
- no task is created without confirmation.

### Phase 3: Smart Reschedule

Goal: help users recover from overdue work.

Tasks:

1. Build `ai-reschedule-alignments` Edge Function.
2. Add recovery CTA to overdue dashboard card and Alignments screen.
3. Let user choose gentle, balanced, or aggressive recovery.
4. Show proposed new dates.
5. Update selected tasks after confirmation.

Definition of done:

- overdue tasks can be redistributed across future dates;
- user approves changes before updates.

### Phase 4: Trophy Summary

Goal: turn completed courses into marketable proof.

Tasks:

1. Add `trophy_summaries` migration.
2. Build `ai-generate-trophy-summary` Edge Function.
3. Add trophy summary CTA after course completion.
4. Add edit/publish UI in Trophy Room.
5. Show published trophy summary on public portfolio.

Definition of done:

- completing a course can generate a portfolio-ready trophy;
- user can edit before publishing;
- public viewers see only published trophy summaries.

### Phase 5: Reflection Coach

Goal: help users capture learning while it is fresh.

Tasks:

1. Build `ai-generate-reflection` Edge Function.
2. Add reflection CTA to completed alignment/course moments.
3. Store reflection draft.
4. Let user attach reflection to trophy summary.

Definition of done:

- user can turn messy notes into a clean learning reflection.

### Phase 6: Learning Activity and Better Streaks

Goal: make streaks and analytics stronger.

Tasks:

1. Add `learning_activity` migration.
2. Write events when tasks are completed.
3. Write events when course progress is saved.
4. Write events when courses are completed.
5. Update streak logic to use learning activity.

Definition of done:

- streaks count actual learning activity, not only completed tasks;
- weekly/monthly recaps have reliable data.

### Phase 7: Ask My Learning History

Goal: create a personal learning intelligence layer.

Tasks:

1. Add searchable learning history endpoint.
2. Build prompt context from completed courses, trophies, reflections, and activity.
3. Add question UI.
4. Add suggested questions.
5. Add weekly recap generation.

Definition of done:

- user can ask meaningful questions about their own learning record.

## Recommended first ticket

Start with Phase 0.

First implementation ticket:

> Create AI foundation: Supabase Edge Function scaffold, `ai_suggestions` migration, app-side AI request helper, and a mock “generate course plan” response.

This gives us the rails for every AI feature without overcommitting to one UI too early.

## Monetization implications

AI features can support a paid tier.

Possible free tier:

- limited AI course plans per month;
- manual productivity and portfolio features;
- public Trophy Room.

Possible paid tier:

- unlimited or higher AI usage;
- AI daily planning;
- AI rescheduling;
- trophy summary generation;
- weekly learning recaps;
- “Ask my learning history.”

The strongest paid value is not “AI chat.” It is:

> AI that turns scattered learning into daily execution and portfolio-ready proof.
