import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

const cookieName = "clicklens_session";
function digest(value: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("Set a dedicated AUTH_SECRET of at least 32 characters.");
  return createHmac("sha256", secret).update(value).digest("hex");
}
function readToken(value?: string) {
  if (!value || !/^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(value)) return null;
  const [token, signature] = value.split(".");
  return timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(digest(token), "hex"),
  )
    ? token
    : null;
}
export async function createSession(userId: string) {
  const store = await cookies();
  const oldToken = readToken(store.get(cookieName)?.value);
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  await prisma.$transaction(async (db) => {
    if (oldToken)
      await db.session.deleteMany({
        where: { tokenHash: digest(`session:${oldToken}`) },
      });
    await db.session.deleteMany({
      where: { userId, expiresAt: { lte: new Date() } },
    });
    await db.session.create({
      data: { userId, tokenHash: digest(`session:${token}`), expiresAt },
    });
  });
  store.set(cookieName, `${token}.${digest(token)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}
export const getCurrentUser = cache(async () => {
  const token = readToken((await cookies()).get(cookieName)?.value);
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: digest(`session:${token}`) },
    select: {
      expiresAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return session && session.expiresAt > new Date() ? session.user : null;
});
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
export async function deleteCurrentSession() {
  const store = await cookies();
  const token = readToken(store.get(cookieName)?.value);
  if (token)
    await prisma.session.deleteMany({
      where: { tokenHash: digest(`session:${token}`) },
    });
  store.delete(cookieName);
}
