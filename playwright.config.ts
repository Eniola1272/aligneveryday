import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["github"]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run web -- --port 4173",
    env: {
      ...process.env,
      CI: "1",
      EXPO_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      EXPO_PUBLIC_SUPABASE_ANON_KEY: "e2e-anon-key",
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
