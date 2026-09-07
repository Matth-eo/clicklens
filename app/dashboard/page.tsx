import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAnalytics } from "@/lib/analytics";
import { appUrl } from "@/lib/format";
import { PageHeading, Stats, LinksTable } from "@/components/dashboard-ui";
import { ActivityChart } from "@/components/activity-chart";
export default async function Dashboard() {
  const user = await requireUser();
  const [totalLinks, links, analytics] = await Promise.all([
    prisma.link.count({ where: { userId: user.id } }),
    prisma.link.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { clicks: true } } },
    }),
    getAnalytics(user.id, 7),
  ]);
  return (
    <>
      <PageHeading
        eyebrow="YOUR WORKSPACE, AT A GLANCE"
        title={`Welcome back, ${user.name.split(" ")[0]}.`}
        description="A little clarity on every link you share."
      />
      <Stats
        items={[
          {
            label: "Total links",
            value: totalLinks,
            caption: "All your connections in one place",
          },
          {
            label: "Total clicks",
            value: analytics.total,
            caption: "Across all your links, all time",
          },
          {
            label: "Clicks this week",
            value: analytics.seven,
            caption: "Last 7 calendar days · UTC",
          },
        ]}
      />
      <div className="overview-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Click activity</h2>
              <p>See your connections in motion.</p>
            </div>
            <span className="period-badge">Last 7 days</span>
          </div>
          <ActivityChart data={analytics.chart} />
          <div className="chart-footer">
            <span>
              <i className="chart-dot" />
              Total clicks
            </span>
            <Link href="/dashboard/analytics">
              Explore analytics <ArrowRight size={14} />
            </Link>
          </div>
        </section>
        <aside className="insight-card">
          <span className="insight-icon">
            <Sparkles size={22} />
          </span>
          <span className="eyebrow">LESS LENGTH. MORE IMPACT.</span>
          <h2>
            Good things come
            <br />
            in short links.
          </h2>
          <p>
            Turn that long URL into a memorable connection. Your next click
            starts here.
          </p>
          <Link className="button" href="/dashboard/links/new">
            Make a new connection <ArrowRight size={16} />
          </Link>
          <div className="decorative-orbits" aria-hidden="true" />
        </aside>
      </div>
      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <h2>
              Recent links <span className="count-badge">{totalLinks}</span>
            </h2>
            <p>Your latest links, ready to go places.</p>
          </div>
          <Link className="text-link" href="/dashboard/links">
            View all links <ArrowRight size={15} />
          </Link>
        </div>
        <LinksTable links={links} baseUrl={appUrl()} />
      </section>
    </>
  );
}
