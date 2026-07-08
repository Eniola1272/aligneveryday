# Production observability runbook

Align Everyday uses `@sentry/react-native` for native and web crash reporting. Monitoring is a
no-op unless `EXPO_PUBLIC_SENTRY_DSN` is configured, so local development and test builds do not
send events by default.

## Production configuration

1. Create one Sentry React Native project for Align Everyday.
2. Set `EXPO_PUBLIC_SENTRY_DSN` and `EXPO_PUBLIC_APP_ENV=production` in the Expo production
   environment.
3. Add `SENTRY_ORG`, `SENTRY_PROJECT`, and the secret `SENTRY_AUTH_TOKEN` to the EAS build
   environment. The token must use sensitive visibility and must never be committed or prefixed
   with `EXPO_PUBLIC_`.
4. Produce Android and iOS release builds and confirm source maps upload successfully.
5. Link the Sentry project to the EAS project so release issues are visible from EAS deployments.

The Metro configuration injects Sentry debug IDs into native EAS bundles and source maps. Web
exports intentionally bypass the Sentry Metro serializer because it currently conflicts with the
NativeWind serializer; runtime web errors are still reported, but web source-map upload must be
configured and verified separately before relying on symbolicated web stack traces. Events are
tagged with application version, environment, platform, route, operation, entity, and
recoverability. Authenticated users are represented only by their opaque Supabase UUID; demo users
are anonymous.

## Privacy contract

Do not attach task titles, course titles, URLs, bios, email addresses, access tokens, refresh tokens,
request bodies, query strings, cookies, or HTTP headers to telemetry.

Handled Supabase failures are converted to generic events such as `todo.update failed`. Only a safe
error code may be attached. The SDK is configured with `sendDefaultPii: false`, and `beforeSend`
removes request data and all user fields except an opaque ID. Breadcrumb payloads are removed,
dynamic course IDs are normalized from route tags, and sanitized operation errors retain only their
original stack frames—not their original messages.

## Release-health dashboard

Create a Sentry dashboard containing:

- Crash-free sessions and crash-free users by release and platform.
- New and regressed issues by release.
- Operation failures grouped by `entity`, `operation`, and `route`.
- A table of affected users and event count for recoverable mutations.
- Slow route transactions at p75 and p95 once traffic volume is meaningful.

## Alert thresholds

| Severity | Trigger                                                                                                                   | Response                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| P0       | Crash-free users below 99.5% over 15 minutes with at least 20 sessions, or one fatal issue affects 5 users in 10 minutes. | Pause rollout, assign an owner immediately, and rollback the release when possible.        |
| P1       | One mutation operation affects 5 users or emits 10 events within 15 minutes.                                              | Investigate within one hour; disable or communicate around the affected flow if necessary. |
| P2       | A new handled issue repeats 5 times in 24 hours.                                                                          | Triage into the product backlog within one business day.                                   |

Start with these thresholds and tune them after four weeks of real production traffic; early alert
rules should require a minimum event or user count to avoid noise from tiny samples.

## Triage procedure

1. Identify the release, platform, route, entity, and operation.
2. Check whether the issue is fatal, data-loss-adjacent, or a recoverable sync failure.
3. Reproduce against staging without copying production learner content.
4. Roll back when crash-free health breaches P0 or when writes may be unsafe.
5. Record the resolution and add a regression test before closing the incident.

## Verification checklist

- Confirm a staging release appears with the correct release and environment.
- Trigger a controlled staging-only exception on Android and iOS and verify its stack trace is
  symbolicated.
- Trigger a denied staging mutation and confirm no learner content or credentials appear.
- Verify route and platform tags are present.
- Confirm the crash recovery screen offers a working **Try again** action.
- Verify production alerts reach the designated owner.
