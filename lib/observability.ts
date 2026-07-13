import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { Platform } from "react-native";

type Entity =
  | "auth"
  | "course"
  | "portfolio_invitation"
  | "profile"
  | "todo"
  | "trophy_room"
  | "workspace";

interface OperationContext {
  entity: Entity;
  operation: string;
  recoverable?: boolean;
}

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
const environment =
  process.env.EXPO_PUBLIC_APP_ENV?.trim() ||
  (__DEV__ ? "development" : "production");
const version = Constants.expoConfig?.version ?? "0.0.0";
const release = `align-everyday@${version}`;

export const navigationIntegration = Sentry.reactNavigationIntegration({
  useFullPathsForNavigationRoutes: true,
});

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment,
  release,
  sendDefaultPii: false,
  tracesSampleRate: environment === "production" ? 0.1 : 1,
  integrations: [navigationIntegration],
  beforeBreadcrumb(breadcrumb) {
    // Breadcrumb payloads can contain form values, URLs, or learner-authored text.
    delete breadcrumb.data;
    delete breadcrumb.message;
    return breadcrumb;
  },
  beforeSend(event) {
    if (event.user) {
      event.user = event.user.id ? { id: event.user.id } : undefined;
    }
    if (event.request) {
      delete event.request.cookies;
      delete event.request.data;
      delete event.request.headers;
      delete event.request.query_string;
    }
    return event;
  },
  initialScope: {
    tags: {
      app: "align-everyday",
      platform: Platform.OS,
      release,
    },
  },
});

function safeErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("code" in error))
    return undefined;
  const code = String(error.code);
  return /^[a-zA-Z0-9_-]{1,64}$/.test(code) ? code : undefined;
}

function userMessageFor(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("invalid login credentials"))
    return "Email or password is incorrect.";
  if (message.includes("user already registered"))
    return "An account already exists for this email.";
  if (message.includes("rate limit"))
    return "Too many attempts. Wait a moment, then try again.";
  if (
    message.includes("username") &&
    (message.includes("unique") || message.includes("duplicate"))
  ) {
    return "That username is already taken.";
  }
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("offline")
  ) {
    return "You appear to be offline. Check your connection and try again.";
  }
  if (
    message.includes("jwt") ||
    message.includes("session") ||
    message.includes("refresh token")
  ) {
    return "Your session has expired. Sign in again to continue.";
  }
  return fallback;
}

export function captureOperationError(
  error: unknown,
  context: OperationContext,
): void {
  Sentry.withScope((scope) => {
    scope.setTag("error.kind", "operation");
    scope.setTag("operation", context.operation);
    scope.setTag("entity", context.entity);
    scope.setTag("recoverable", String(context.recoverable ?? true));
    const code = safeErrorCode(error);
    if (code) scope.setContext("supabase", { code });
    scope.setFingerprint([
      "operation",
      context.entity,
      context.operation,
      code ?? "unknown",
    ]);
    const sanitizedError = new Error(
      `${context.entity}.${context.operation} failed`,
    );
    if (error instanceof Error && error.stack) {
      sanitizedError.stack = [
        `${sanitizedError.name}: ${sanitizedError.message}`,
        ...error.stack.split("\n").slice(1),
      ].join("\n");
    }
    Sentry.captureException(sanitizedError);
  });
}

export function createActionError(
  error: unknown,
  context: OperationContext,
  fallbackMessage: string,
): Error {
  captureOperationError(error, context);
  return new Error(userMessageFor(error, fallbackMessage));
}

export function identifyObservabilityUser(userId: string | null): void {
  Sentry.setUser(userId ? { id: userId } : null);
}

export function setObservabilityRoute(route: string): void {
  const sanitizedRoute = (route || "/").replace(
    /^\/course\/[^/]+/,
    "/course/[id]",
  );
  Sentry.setTag("route", sanitizedRoute);
}

export { Sentry };
