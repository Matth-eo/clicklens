export type FormState = { error?: string; success?: string };
export const reservedSlugs = new Set([
  "dashboard",
  "login",
  "register",
  "logout",
  "api",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "not-found",
]);
export function validateLink(data: FormData) {
  const title = String(data.get("title") ?? "").trim();
  const originalUrl = String(data.get("originalUrl") ?? "").trim();
  const slug = String(data.get("slug") ?? "")
    .trim()
    .toLowerCase();
  if (title.length > 100)
    throw new Error("Keep the title under 100 characters.");
  if (originalUrl.length > 4096)
    throw new Error("The destination URL is too long.");
  let url: URL;
  try {
    url = new URL(originalUrl);
  } catch {
    throw new Error("Enter a complete URL starting with https:// or http://.");
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Use an HTTP or HTTPS URL without embedded credentials.");
  if (
    slug &&
    (!/^[a-z0-9][a-z0-9_-]{2,47}$/.test(slug) || reservedSlugs.has(slug))
  )
    throw new Error(
      "Choose an available slug with 3–48 letters, numbers, hyphens, or underscores.",
    );
  return { title: title || url.hostname, originalUrl: url.href, slug };
}
export function referrerFrom(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.origin : null;
  } catch {
    return null;
  }
}
