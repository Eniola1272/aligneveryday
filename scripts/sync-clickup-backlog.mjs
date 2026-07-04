import { readFile } from "node:fs/promises";

const workspaceId = "9012101586";
const listId = "901219202901";

const stories = [
  {
    name: "[P0] Ship and verify the production Supabase foundation",
    priority: 1,
    points: 5,
    area: "Platform",
    phase: "Now",
    story:
      "As a learner, I need my private learning data to remain available and isolated so I can trust Align Everyday as my system of record.",
    acceptance: [
      "All migrations run successfully in a clean Supabase project.",
      "Sign-up automatically creates exactly one profile.",
      "RLS tests prove users cannot read or mutate another user’s courses or todos.",
      "Public portfolio policies expose only public profiles and completed courses.",
      "A rollback and backup note exists for every production migration.",
    ],
  },
  {
    name: "[P0] Automate the critical learner journey",
    priority: 1,
    points: 8,
    area: "Quality",
    phase: "Now",
    story:
      "As the product team, we need automated coverage of the primary journey so improvements do not silently break activation.",
    acceptance: [
      "Tests cover sign-up/onboarding, demo entry, course creation, alignment creation, completion, and progress.",
      "Tests cover editing courses and alignments.",
      "Tests cover logout and protected-route redirects.",
      "The suite runs in CI on every pull request.",
    ],
  },
  {
    name: "[P0] Add production observability and actionable errors",
    priority: 1,
    points: 5,
    area: "Platform",
    phase: "Now",
    story:
      "As the product team, we need to see crashes and failed mutations so user problems can be fixed before trust is lost.",
    acceptance: [
      "Native and web crashes include release, route, and device context.",
      "Supabase failures are captured without credentials or personal content.",
      "Users receive retryable, human-readable failure states.",
      "A release health dashboard and alert threshold are documented.",
    ],
  },
  {
    name: "[P1] Complete device-level authentication QA",
    priority: 2,
    points: 5,
    area: "Authentication",
    phase: "Now",
    story:
      "As a returning learner, I need email confirmation and password recovery links to return me to the correct app screen.",
    acceptance: [
      "Confirmation and recovery links work on iOS, Android, and web.",
      "Expired and reused links show a recovery path.",
      "Sessions persist across restarts and refresh only while appropriate.",
      "No protected screen flashes before session resolution.",
    ],
  },
  {
    name: "[P1] Establish CI quality gates",
    priority: 2,
    points: 3,
    area: "Quality",
    phase: "Now",
    story:
      "As the product team, we need every change checked consistently so the main branch remains releasable.",
    acceptance: [
      "CI runs type-checking, formatting, tests, and Expo web export.",
      "Dependency compatibility is checked against the pinned Expo SDK.",
      "Failed checks block merging.",
      "Release notes and environment requirements are documented.",
    ],
  },
  {
    name: "[P1] Import course metadata from learning links",
    priority: 2,
    points: 8,
    area: "Learning Shelf",
    phase: "Next",
    story:
      "As a learner, I want a pasted YouTube, Udemy, or Coursera link to prefill useful details so capture feels effortless.",
    acceptance: [
      "Supported links detect platform and populate available title and duration metadata.",
      "Previewed metadata can be edited before saving.",
      "Unsupported or private links fall back to manual entry without losing input.",
      "Metadata retrieval happens server-side with safe timeouts and rate limits.",
    ],
  },
  {
    name: "[P1] Model chapters and learning milestones",
    priority: 2,
    points: 8,
    area: "Learning Shelf",
    phase: "Next",
    story:
      "As a learner, I want a course broken into real milestones so progress reflects what I have actually covered.",
    acceptance: [
      "A migration introduces ordered course milestones with duration and completion state.",
      "Users can add, edit, reorder, complete, and delete milestones.",
      "Course progress can be derived from milestone completion or elapsed time.",
      "Existing courses receive a safe default milestone without data loss.",
    ],
  },
  {
    name: "[P1] Build a focused daily planning flow",
    priority: 2,
    points: 8,
    area: "Alignments",
    phase: "Next",
    story:
      "As a learner, I want to choose and order today’s most important alignments so the dashboard tells me what to do next.",
    acceptance: [
      "Alignments support full date selection, optional time, and manual priority.",
      "Today’s list can be reordered with persisted ordering.",
      "Overdue work is visible without overwhelming the current day.",
      "Completing an action gives immediate feedback and an undo option.",
    ],
  },
  {
    name: "[P1] Calculate real consistency and learning metrics",
    priority: 2,
    points: 5,
    area: "Motivation",
    phase: "Next",
    story:
      "As a learner, I want streaks and progress metrics based on my activity so motivation feels earned rather than decorative.",
    acceptance: [
      "Daily activity records completed alignments and learning-time updates.",
      "Streak rules are documented and timezone-safe.",
      "Dashboard metrics use persisted activity instead of static values.",
      "Backfilled data does not create false streaks.",
    ],
  },
  {
    name: "[P2] Add course archive and safe deletion",
    priority: 3,
    points: 5,
    area: "Learning Shelf",
    phase: "Next",
    story:
      "As a learner, I want to remove abandoned or accidental courses without unintentionally losing useful work.",
    acceptance: [
      "Courses can be archived independently of backlog or completion status.",
      "Delete clearly explains what happens to linked alignments.",
      "Destructive actions require confirmation and support undo where feasible.",
      "Archived courses are restorable.",
    ],
  },
  {
    name: "[P2] Add recurring alignments and reminders",
    priority: 3,
    points: 8,
    area: "Alignments",
    phase: "Next",
    story:
      "As a learner, I want recurring learning habits and respectful reminders so consistency requires less remembering.",
    acceptance: [
      "Users can create daily, weekly, and selected-day recurrence rules.",
      "Notification permission is requested only after reminders are enabled.",
      "Reminder time respects local timezone and quiet hours.",
      "Completing one occurrence does not complete the recurring series.",
    ],
  },
  {
    name: "[P2] Complete accessibility and small-device QA",
    priority: 3,
    points: 5,
    area: "Experience",
    phase: "Next",
    story:
      "As a learner using assistive technology or a small device, I need every core flow to remain clear and operable.",
    acceptance: [
      "Core screens pass screen-reader navigation on iOS and Android.",
      "Touch targets, contrast, text scaling, and keyboard navigation meet agreed standards.",
      "Bottom sheets remain usable with the keyboard open and large text enabled.",
      "The layout is verified at the smallest supported viewport and tablet widths.",
    ],
  },
  {
    name: "[P1] Attach evidence to completed work",
    priority: 2,
    points: 8,
    area: "Portfolio",
    phase: "Later",
    story:
      "As a learner, I want to attach links, screenshots, notes, and outcomes to completed alignments so my portfolio proves application, not consumption.",
    acceptance: [
      "Completed courses support structured evidence items and a reflection.",
      "Evidence supports links and safely stored images.",
      "Private evidence never appears publicly by default.",
      "Portfolio preview shows exactly what will be published.",
    ],
  },
  {
    name: "[P1] Publish a shareable portfolio profile",
    priority: 2,
    points: 8,
    area: "Portfolio",
    phase: "Later",
    story:
      "As a self-taught professional, I want a shareable public profile so others can understand my learning trajectory and proof of work.",
    acceptance: [
      "Public profiles have stable username-based URLs.",
      "Only opted-in profile fields, completed courses, and public evidence are shown.",
      "Social metadata produces useful link previews.",
      "Owners can unpublish instantly and preview while private.",
    ],
  },
  {
    name: "[P2] Create a weekly learning review",
    priority: 3,
    points: 8,
    area: "Insights",
    phase: "Later",
    story:
      "As a learner, I want a concise weekly review so I can see momentum, notice drift, and choose the next week intentionally.",
    acceptance: [
      "Review summarizes time learned, alignments shipped, courses advanced, and streak state.",
      "Users can record a reflection and select next week’s focus.",
      "Empty and low-activity weeks remain constructive rather than punitive.",
      "Review data is derived from persisted activity records.",
    ],
  },
  {
    name: "[P2] Support resilient offline work and synchronization",
    priority: 3,
    points: 8,
    area: "Platform",
    phase: "Later",
    story:
      "As a mobile learner, I want to capture and complete work during unreliable connectivity so the app remains dependable.",
    acceptance: [
      "Reads use a durable local cache.",
      "Course and alignment mutations queue offline and synchronize later.",
      "Conflicts use a documented resolution strategy.",
      "Sync state is visible without interrupting normal use.",
    ],
  },
];

function parseEnv(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [
          line.slice(0, index),
          line.slice(index + 1).replace(/^['"]|['"]$/g, ""),
        ];
      }),
  );
}

const env = parseEnv(
  await readFile(new URL("../.env", import.meta.url), "utf8"),
);
const token = env.CLICKUP_API_TOKEN;

if (!token) throw new Error("CLICKUP_API_TOKEN is missing from .env");

async function clickUp(path, options = {}) {
  const response = await fetch(`https://api.clickup.com/api/v2${path}`, {
    ...options,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`ClickUp ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

const existingResponse = await clickUp(
  `/list/${listId}/task?archived=false&include_closed=true`,
);
const existingNames = new Set(existingResponse.tasks.map((task) => task.name));
let created = 0;
let skipped = 0;

for (const item of stories) {
  if (existingNames.has(item.name)) {
    skipped += 1;
    continue;
  }

  const markdownDescription = [
    `## User story`,
    item.story,
    "",
    "## Acceptance criteria",
    ...item.acceptance.map((criterion) => `- [ ] ${criterion}`),
    "",
    `**Phase:** ${item.phase}`,
    `**Product area:** ${item.area}`,
    `**Estimate:** ${item.points} story points`,
    `**Workspace:** ${workspaceId}`,
  ].join("\n");

  await clickUp(`/list/${listId}/task`, {
    method: "POST",
    body: JSON.stringify({
      name: item.name,
      markdown_description: markdownDescription,
      priority: item.priority,
      time_estimate: item.points * 4 * 60 * 60 * 1000,
      notify_all: false,
    }),
  });
  created += 1;
}

console.log(
  JSON.stringify({ listId, total: stories.length, created, skipped }, null, 2),
);
