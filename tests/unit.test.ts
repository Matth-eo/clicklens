import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../lib/password";
import { validateLink, referrerFrom } from "../lib/validation";

test("scrypt uses unique salts and verifies passwords safely", async () => {
  const a = await hashPassword("a secure test password");
  const b = await hashPassword("a secure test password");
  assert.notEqual(a, b);
  assert.equal(await verifyPassword("a secure test password", a), true);
  assert.equal(await verifyPassword("wrong password", a), false);
  assert.equal(await verifyPassword("anything", "invalid:hash"), false);
  assert.equal(await verifyPassword("anything", ":"), false);
});
function form(url: string, slug = "") {
  const data = new FormData();
  data.set("originalUrl", url);
  data.set("slug", slug);
  return data;
}
test("URL validation prevents unsafe protocols, credentials, reserved and malformed slugs", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,test",
    "ftp://example.com",
    "https://user:pass@example.com",
    "not a URL",
  ])
    assert.throws(() => validateLink(form(url)));
  for (const slug of [
    "dashboard",
    "login",
    "register",
    "api",
    "a",
    "bad slug",
    "../bad",
    "a".repeat(49),
  ])
    assert.throws(() => validateLink(form("https://example.com", slug)));
  const valid = validateLink(
    form("https://example.com/path?x=1#heading", "Launch-2026"),
  );
  assert.equal(valid.slug, "launch-2026");
  assert.equal(valid.title, "example.com");
  assert.equal(valid.originalUrl, "https://example.com/path?x=1#heading");
});
test("referrers retain source origins without credentials, paths or query values", () => {
  assert.equal(
    referrerFrom("https://user:pass@example.com/private?token=secret"),
    "https://example.com",
  );
  assert.equal(referrerFrom(null), null);
  assert.equal(referrerFrom("nonsense"), null);
  assert.equal(referrerFrom("javascript:alert(1)"), null);
});
