"use server";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { createSession, deleteCurrentSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import type { FormState } from "@/lib/validation";

async function authenticate(
  data: FormData,
  registering: boolean,
): Promise<FormState> {
  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(data.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    return { error: "Enter a valid email address." };
  if (password.length < 8 || password.length > 128)
    return { error: "Use a password between 8 and 128 characters." };
  if (registering && (name.length < 2 || name.length > 60))
    return { error: "Enter a name between 2 and 60 characters." };
  try {
    let user;
    if (registering) {
      user = await prisma.user.create({
        data: { name, email, passwordHash: await hashPassword(password) },
      });
    } else {
      user = await prisma.user.findUnique({ where: { email } });
      // Do the same expensive password work for unknown accounts.
      const valid = await verifyPassword(
        password,
        user?.passwordHash ?? `${"0".repeat(32)}:${"0".repeat(128)}`,
      );
      if (!user || !valid) return { error: "Invalid email or password." };
    }
    await createSession(user.id);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return {
        error: "An account with this email already exists. Try signing in.",
      };
    console.error(
      "Authentication failed",
      error instanceof Error ? error.name : "Unknown error",
    );
    return { error: "We couldn't sign you in. Please try again shortly." };
  }
  redirect("/dashboard");
}
export async function register(_: FormState, data: FormData) {
  return authenticate(data, true);
}
export async function login(_: FormState, data: FormData) {
  return authenticate(data, false);
}
export async function logout() {
  await deleteCurrentSession();
  redirect("/login");
}
