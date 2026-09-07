import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
export async function getAnalytics(
  userId: string,
  days: 7 | 30,
  linkId?: string,
) {
  const now = new Date();
  const midnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const since = new Date(midnight.getTime() - (days - 1) * 86400000);
  const sevenSince = new Date(midnight.getTime() - 6 * 86400000);
  const thirtySince = new Date(midnight.getTime() - 29 * 86400000);
  const where = { link: { userId, ...(linkId ? { id: linkId } : {}) } };
  const [total, seven, thirty, recent, referrers, buckets] = await Promise.all([
    prisma.click.count({ where }),
    prisma.click.count({
      where: { ...where, timestamp: { gte: sevenSince, lte: now } },
    }),
    prisma.click.count({
      where: { ...where, timestamp: { gte: thirtySince, lte: now } },
    }),
    prisma.click.findMany({
      where: { ...where, timestamp: { gte: since, lte: now } },
      take: 15,
      orderBy: { timestamp: "desc" },
      include: { link: { select: { title: true, slug: true } } },
    }),
    prisma.click.groupBy({
      by: ["referrer"],
      where: { ...where, timestamp: { gte: since, lte: now } },
      _count: { _all: true },
    }),
    prisma.$queryRaw<{ day: string; clicks: bigint }[]>(
      Prisma.sql`SELECT to_char(c."timestamp", 'YYYY-MM-DD') as day, count(*) as clicks FROM "Click" c JOIN "Link" l ON l.id = c."linkId" WHERE l."userId" = ${userId} AND c."timestamp" >= ${since} AND c."timestamp" <= ${now} ${linkId ? Prisma.sql`AND l.id = ${linkId}` : Prisma.empty} GROUP BY day ORDER BY day`,
    ),
  ]);
  const counts = new Map(buckets.map((row) => [row.day, Number(row.clicks)]));
  const chart = Array.from({ length: days }, (_, i) => {
    const day = new Date(since.getTime() + i * 86400000)
      .toISOString()
      .slice(0, 10);
    return { day, clicks: counts.get(day) ?? 0 };
  });
  return {
    total,
    seven,
    thirty,
    recent,
    referrers: referrers.sort((a, b) => b._count._all - a._count._all),
    chart,
  };
}
