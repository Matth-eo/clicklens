import { requireUser } from "@/lib/auth";
import { AnalyticsView } from "@/components/analytics-view";
export default async function Analytics({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const user = await requireUser();
  return (
    <AnalyticsView
      userId={user.id}
      days={(await searchParams).days === "30" ? 30 : 7}
    />
  );
}
