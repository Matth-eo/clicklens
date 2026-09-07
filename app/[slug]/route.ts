import { prisma } from "@/lib/prisma";
import { referrerFrom } from "@/lib/validation";

export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex",
};
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const destination = await prisma.$transaction(async (db) => {
      const link = await db.link.findUnique({
        where: { slug },
        select: { id: true, originalUrl: true },
      });
      if (!link) return null;
      await db.click.create({
        data: {
          linkId: link.id,
          referrer: referrerFrom(request.headers.get("referer")),
        },
      });
      return link.originalUrl;
    });
    if (!destination)
      return new Response(
        "This short link does not exist or has been deleted.",
        { status: 404, headers },
      );
    return new Response(null, {
      status: 302,
      headers: { ...headers, Location: destination },
    });
  } catch {
    return new Response(
      "This link is temporarily unavailable. Please try again.",
      { status: 503, headers: { ...headers, "Retry-After": "10" } },
    );
  }
}
// Explicitly avoid recording HEAD requests as clicks.
export async function HEAD() {
  return new Response(null, {
    status: 405,
    headers: { ...headers, Allow: "GET" },
  });
}
