import { expect, test } from "./fixtures";

test("protected routes return signed-out learners to welcome", async ({
  page,
}) => {
  await page.goto("/alignments");
  await expect(page.getByText("Learning is only")).toBeVisible();
  await expect(page.getByText("Explore with demo data →")).toBeVisible();
});

test("demo learner can create, edit, complete, and leave", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Explore with demo data →").click();
  await expect(page.getByText("Today,")).toBeVisible();

  await page.getByLabel("Add to learning shelf").click();
  await page.getByLabel("Course title").fill("Quality Engineering Foundations");
  await page.getByRole("button", { name: "Add to Shelf" }).click();
  await expect(page.getByText("Quality Engineering Foundations")).toBeVisible();

  await page.getByText("Shelf", { exact: true }).click();
  await page.getByLabel("Edit Quality Engineering Foundations").click();
  await page
    .locator(
      'input[aria-label="Course title"][value="Quality Engineering Foundations"]',
    )
    .fill("Quality Engineering Practice");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByText("Quality Engineering Practice").last(),
  ).toBeVisible();

  await page.getByText("Align", { exact: true }).click();
  await page.getByLabel("Add alignment").click();
  await page.getByLabel("Alignment title").fill("Write one regression test");
  await page.getByText("Quality Engineering Practice").last().click();
  await page.getByRole("button", { name: "Add alignment" }).click();
  await expect(
    page.getByText("Write one regression test").last(),
  ).toBeVisible();

  await page.getByText("Write one regression test").last().click();
  await page.getByLabel("Alignment title").fill("Ship one regression test");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Ship one regression test").last()).toBeVisible();

  await page
    .getByLabel("Ship one regression test: Mark complete")
    .last()
    .click();
  await expect(
    page.getByLabel("Ship one regression test: Mark incomplete").last(),
  ).toBeVisible();

  await page.getByText("Shelf", { exact: true }).click();
  await page.getByLabel("Open Quality Engineering Practice").click();
  const scrubber = page.getByRole("slider", { name: "Course progress" });
  const box = await scrubber.boundingBox();
  if (!box) throw new Error("Course progress scrubber was not rendered.");
  await page.mouse.click(box.x + box.width * 0.75, box.y + box.height / 2);
  await page.getByText("Save", { exact: true }).click();
  await expect(page.getByText("Progress saved")).toBeVisible();

  await page.getByLabel("Go back").click();
  await page.getByText("You", { exact: true }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByText("Leave demo", { exact: true }).click();
  await expect(page.getByText("Explore with demo data →")).toBeVisible();
});
