import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";

const userId = "40000000-0000-0000-0000-000000000004";

function jwt(payload: Record<string, unknown>) {
  const encode = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.e2e-signature`;
}

async function mockSupabase(page: Page) {
  const accessToken = jwt({
    aud: "authenticated",
    exp: Math.floor(Date.now() / 1000) + 3600,
    role: "authenticated",
    sub: userId,
  });
  let profile = {
    id: userId,
    full_name: "Journey Tester",
    username: null as string | null,
    avatar_url: null,
    bio: null as string | null,
    portfolio_public: false,
  };

  await page.route("http://127.0.0.1:54321/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === "/auth/v1/signup") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: "e2e-refresh-token",
          expires_in: 3600,
          token_type: "bearer",
          user: {
            id: userId,
            aud: "authenticated",
            role: "authenticated",
            email: "journey@aligneveryday.app",
            app_metadata: { provider: "email", providers: ["email"] },
            user_metadata: { full_name: "Journey Tester" },
            created_at: new Date().toISOString(),
          },
        }),
      });
      return;
    }

    if (url.pathname === "/rest/v1/profiles") {
      if (request.method() === "POST") {
        profile = { ...profile, ...(request.postDataJSON() as typeof profile) };
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          headers: { "content-range": "0-0/*" },
          body: JSON.stringify([profile]),
        });
        return;
      }
      await route.fulfill({
        contentType: "application/json",
        headers: { "content-range": "0-0/*" },
        body: JSON.stringify([profile]),
      });
      return;
    }

    if (
      url.pathname === "/rest/v1/courses" ||
      url.pathname === "/rest/v1/todos"
    ) {
      await route.fulfill({
        contentType: "application/json",
        headers: { "content-range": "*/0" },
        body: "[]",
      });
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: "{}",
    });
  });
}

test("email signup requires an address and completes onboarding", async ({
  page,
}) => {
  await mockSupabase(page);
  await page.goto("/sign-up");

  await page.getByLabel("Full name").fill("Journey Tester");
  await page.getByLabel("Email").fill("not-an-email");
  await page.locator('input[aria-label="Password"]').fill("strong-password");
  await page.getByRole("button", { name: "Create workspace" }).click();
  await expect(
    page.getByText("A valid email address is required."),
  ).toBeVisible();

  await page.getByLabel("Email").fill("journey@aligneveryday.app");
  await page.getByRole("button", { name: "Create workspace" }).click();
  await expect(page.getByText("Make the workspace yours.")).toBeVisible();

  await page.getByLabel("Portfolio username").fill("journey_tester");
  await page
    .getByLabel("What are you becoming?")
    .fill("Building dependable learning systems.");
  await page.getByRole("button", { name: "Enter my workspace" }).click();
  await expect(page.getByText("Align, Journey.")).toBeVisible();
});
