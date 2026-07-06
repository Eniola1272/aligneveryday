import { expect, test as base } from "@playwright/test";

const root = `${process.cwd()}/dist`;
const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("http://127.0.0.1:4173/**", async (route) => {
      const pathname = decodeURIComponent(
        new URL(route.request().url()).pathname,
      );
      const safePath = pathname
        .split("/")
        .filter((segment) => segment && segment !== "." && segment !== "..")
        .join("/");
      const isAsset = safePath.includes(".");
      const file = isAsset ? `${root}/${safePath}` : `${root}/index.html`;
      const extension = file.slice(file.lastIndexOf("."));
      await route.fulfill({
        path: file,
        contentType: contentTypes[extension] ?? "application/octet-stream",
        headers: { "Cache-Control": "no-store" },
      });
    });
    await use(page);
  },
});

export { expect };
