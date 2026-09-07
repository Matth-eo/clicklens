import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsView } from "@/components/analytics-view";
export default async function LinkAnalytics({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ days?: string }>;
}) {
  const user = await requireUser();
  const link = await prisma.link.findFirst({
    where: { id: (await params).id, userId: user.id },
  });
  if (!link) notFound();
  return (
    <AnalyticsView
      userId={user.id}
      link={link}
      days={(await searchParams).days === "30" ? 30 : 7}
    />
  );
}
