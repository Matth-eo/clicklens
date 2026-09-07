import { test, expect, type Page, type Request } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
const db = new PrismaClient();
const suffix = Date.now().toString(36);
const ownerEmail = `owner-${suffix}@clicklens.test`;
const otherEmail = `other-${suffix}@clicklens.test`;
const password = "Only-for-automated-tests-123!";

async function register(page: Page, name: string, email: string) {
  await page.goto("/register");
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create your account" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
test.afterAll(async () => {
  await db.user.deleteMany({
    where: { email: { in: [ownerEmail, otherEmail] } },
  });
  await db.$disconnect();
});

test("real PostgreSQL flow, tenant isolation, redirects, analytics and responsive UI", async ({
  page,
  browser,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await page.screenshot({
    path: ".local/login-desktop.png",
    fullPage: true,
    caret: "initial",
  });
  await register(page, "Alex Morgan", ownerEmail);
  await expect(
    page.getByText("Your next connection starts here."),
  ).toBeVisible();
  await page.screenshot({
    path: ".local/dashboard-empty.png",
    fullPage: true,
    caret: "initial",
  });
  await page.goto("/dashboard/links/new");
  await page
    .getByLabel("Destination URL")
    .fill("https://example.com/launch?source=clicklens");
  await page.getByLabel("Link title").fill("Product launch");
  const slug = `launch-${suffix}`;
  await page.getByLabel("Custom slug").fill(slug);
  await page.getByRole("button", { name: "Create short link" }).click();
  await expect(page.getByRole("status")).toContainText("ready to share");
  const owner = await db.user.findUniqueOrThrow({
    where: { email: ownerEmail },
  });
  const link = await db.link.findUniqueOrThrow({ where: { slug } });
  expect(link.userId).toBe(owner.id);
  expect(owner.passwordHash).not.toContain(password);
  // A custom slug collision should be an inline error, not an exception.
  await page
    .getByLabel("Destination URL")
    .fill("https://example.com/duplicate");
  await page.getByLabel("Custom slug").fill(slug);
  await page.getByRole("button", { name: "Create short link" }).click();
  await expect(page.locator(".notice.error")).toContainText("already in use");
  await page.getByLabel("Custom slug").fill("");
  await page.getByLabel("Link title").fill("Automatically generated");
  await page.getByRole("button", { name: "Create short link" }).click();
  await expect(page.getByRole("status")).toContainText("ready to share");
  expect(await db.link.count({ where: { userId: owner.id } })).toBe(2);
  // Redirects are uncached, preserve the destination, and persist each click.
  for (let i = 0; i < 3; i++) {
    const response = await request.get(`/${slug}`, {
      maxRedirects: 0,
      headers:
        i === 0
          ? { referer: "https://newsletter.example.com/article?private=value" }
          : {},
    });
    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe(link.originalUrl);
    expect(response.headers()["cache-control"]).toContain("no-store");
  }
  expect((await request.head(`/${slug}`)).status()).toBe(405);
  expect(await db.click.count({ where: { linkId: link.id } })).toBe(3);
  expect(
    (
      await db.click.findFirstOrThrow({
        where: { linkId: link.id, referrer: { not: null } },
      })
    ).referrer,
  ).toBe("https://newsletter.example.com");
  expect((await request.get(`/missing-${suffix}`)).status()).toBe(404);
  // Historical fixtures only belong to this test account and are cleaned up.
  const now = new Date();
  const day = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  await db.click.createMany({
    data: [
      { linkId: link.id, timestamp: new Date(day.getTime() - 10 * 86400000) },
      { linkId: link.id, timestamp: new Date(day.getTime() - 40 * 86400000) },
    ],
  });
  await page.goto(`/dashboard/analytics/${link.id}`);
  const stats = page.locator(".stat-card > strong");
  await expect(stats).toHaveText(["5", "3", "4"]);
  await expect(
    page.getByText("newsletter.example.com", { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("link", { name: "30 days", exact: true }).click();
  await expect(
    page.getByRole("img", {
      name: /Daily click activity: 4 clicks across 30 days/,
    }),
  ).toBeVisible();
  await page.screenshot({
    path: ".local/analytics-desktop.png",
    fullPage: true,
    caret: "initial",
  });
  await page.goto("/dashboard/links");
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Copy short link" }).first().click();
  await expect(page.getByRole("status")).toHaveText("Copied!");
  await page
    .getByRole("textbox", { name: "Search links" })
    .fill("Product launch");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  // Create an independent second account.
  const otherContext = await browser.newContext();
  const other = await otherContext.newPage();
  await register(other, "Taylor Reed", otherEmail);
  await other.goto(`/dashboard/links/${link.id}`);
  await expect(
    other.getByRole("heading", { name: "This link isn’t here." }),
  ).toBeVisible();
  await other.goto(`/dashboard/analytics/${link.id}`);
  await expect(
    other.getByRole("heading", { name: "This link isn’t here." }),
  ).toBeVisible();
  await other.goto("/dashboard/analytics");
  await expect(other.locator(".stat-card > strong")).toHaveText([
    "0",
    "0",
    "0",
  ]);
  // Replay genuine action payloads with a different session after the owner request.
  async function replayAsOther(actionRequest: Request) {
    const headers = { ...actionRequest.headers() };
    delete headers.cookie;
    delete headers["content-length"];
    const body = actionRequest
      .postDataBuffer()!
      .toString()
      .replace("https://example.org/updated", "https://example.net/blocked");
    const response = await otherContext.request.post(actionRequest.url(), {
      headers,
      data: Buffer.from(body),
      maxRedirects: 0,
    });
    expect(await response.text()).toContain("This link was not found.");
  }
  await page.goto(`/dashboard/links/${link.id}`);
  const editRequestPromise = page.waitForRequest(
    (req) =>
      req.method() === "POST" &&
      req.url().endsWith(`/dashboard/links/${link.id}`),
  );
  await page.getByLabel("Destination URL").fill("https://example.org/updated");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toContainText("Link updated");
  const editRequest = await editRequestPromise;
  await replayAsOther(editRequest);
  expect(
    (await db.link.findUniqueOrThrow({ where: { id: link.id } })).originalUrl,
  ).toBe("https://example.org/updated");
  expect(
    (await request.get(`/${slug}`, { maxRedirects: 0 })).headers().location,
  ).toBe("https://example.org/updated");
  await page.goto("/dashboard");
  await page.screenshot({
    path: ".local/dashboard-desktop.png",
    fullPage: true,
    caret: "initial",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: ".local/dashboard-mobile.png",
    fullPage: true,
    caret: "initial",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto(`/dashboard/analytics/${link.id}`);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: ".local/analytics-mobile.png",
    fullPage: true,
    caret: "initial",
  });
  await page.goto(`/dashboard/links/${link.id}`);
  await page.getByRole("button", { name: "Delete link", exact: true }).click();
  const deleteRequestPromise = page.waitForRequest(
    (req) =>
      req.method() === "POST" &&
      req.url().endsWith(`/dashboard/links/${link.id}`),
  );
  await page.getByRole("button", { name: "Permanently delete" }).click();
  await expect
    .poll(() => db.link.findUnique({ where: { id: link.id } }))
    .toBeNull();
  const deleteRequest = await deleteRequestPromise;
  expect(await db.click.count({ where: { linkId: link.id } })).toBe(0);
  expect((await request.get(`/${slug}`)).status()).toBe(404);
  await expect(page).toHaveURL(/\/dashboard\/links\?deleted=1$/);
  await expect(page.getByRole("status")).toContainText("click history deleted");
  // Restore only this test-owned fixture to test the captured delete payload.
  await db.link.create({
    data: {
      id: link.id,
      userId: owner.id,
      title: link.title,
      originalUrl: link.originalUrl,
      slug,
    },
  });
  await replayAsOther(deleteRequest);
  expect(await db.link.findUnique({ where: { id: link.id } })).not.toBeNull();
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await db.session.count({ where: { userId: owner.id } })).toBe(0);
  await page.getByLabel("Email address").fill(ownerEmail);
  await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator(".notice.error")).toContainText(
    "Invalid email or password",
  );
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  // Expired database sessions must not grant access.
  await db.session.updateMany({
    where: { userId: owner.id },
    data: { expiresAt: new Date(0) },
  });
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await otherContext.close();
  expect(errors).toEqual([]);
});
