"use server";
import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateLink, type FormState } from "@/lib/validation";
import { appUrl } from "@/lib/format";

export async function saveLink(
  id: string | null,
  _: FormState,
  data: FormData,
): Promise<FormState> {
  const user = await requireUser();
  let input;
  try {
    input = validateLink(data);
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (new URL(input.originalUrl).origin === new URL(appUrl()).origin)
    return { error: "Use an external destination to avoid redirect loops." };
  try {
    if (id) {
      if (!input.slug)
        return { error: "A slug is required when editing a link." };
      const result = await prisma.link.updateMany({
        where: { id, userId: user.id },
        data: input,
      });
      if (!result.count) return { error: "This link was not found." };
    } else {
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          await prisma.link.create({
            data: {
              ...input,
              slug: input.slug || randomBytes(6).toString("hex"),
              userId: user.id,
            },
          });
          break;
        } catch (error) {
          if (
            !input.slug &&
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002" &&
            attempt < 4
          )
            continue;
          throw error;
        }
      }
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return { error: "That slug is already in use. Try another one." };
    return { error: "Couldn't save your link. Please try again." };
  }
  revalidatePath("/dashboard", "layout");
  return {
    success: id ? "Link updated." : "Your short link is ready to share.",
  };
}
export async function deleteLink(id: string, _: FormState): Promise<FormState> {
  void _;
  const user = await requireUser();
  try {
    const result = await prisma.link.deleteMany({
      where: { id, userId: user.id },
    });
    if (!result.count) return { error: "This link was not found." };
  } catch {
    return { error: "Couldn't delete this link. Please try again." };
  }
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/links?deleted=1");
}
