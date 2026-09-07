import Link from "next/link";
import { Globe, ArrowLeft } from "lucide-react";
import { getAnalytics } from "@/lib/analytics";
import { date, number, appUrl } from "@/lib/format";
import { ActivityChart } from "@/components/activity-chart";
import { Empty, PageHeading, Stats } from "@/components/dashboard-ui";
import { CopyButton } from "@/components/link-controls";
export async function AnalyticsView({
  userId,
  days,
  link,
}: {
  userId: string;
  days: 7 | 30;
  link?: { id: string; title: string; slug: string; originalUrl: string };
}) {
  const data = await getAnalytics(userId, days, link?.id);
  const periodTotal = data.chart.reduce((sum, day) => sum + day.clicks, 0);
  return (
    <>
      {link && (
        <Link href="/dashboard/links" className="back-link">
          <ArrowLeft size={16} />
          Back to my links
        </Link>
      )}
      <PageHeading
        eyebrow="LOOK A LITTLE CLOSER"
        title={link ? link.title : "Your clicks, in focus."}
        description={
          link
            ? "A closer look at this link’s journey."
            : "Understand the impact of every link you share."
        }
        action={false}
      />
      {link && (
        <div className="analytics-link">
          <span className="short-url">
            <a
              href={`${appUrl()}/${link.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              {appUrl()}/{link.slug}
            </a>
            <CopyButton url={`${appUrl()}/${link.slug}`} />
          </span>
          <span className="destination">{link.originalUrl}</span>
          <Link href={`/dashboard/links/${link.id}`} className="text-link">
            Edit link →
          </Link>
        </div>
      )}
      <Stats
        items={[
          { label: "Total clicks", value: data.total, caption: "All time" },
          {
            label: "Last 7 days",
            value: data.seven,
            caption: "Today and the previous 6 days · UTC",
          },
          {
            label: "Last 30 days",
            value: data.thirty,
            caption: "Today and the previous 29 days · UTC",
          },
        ]}
      />
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Click activity</h2>
            <p>{number(periodTotal)} clicks in this period · UTC</p>
          </div>
          <div className="segmented" aria-label="Analytics date range">
            <Link
              href="?days=7"
              className={days === 7 ? "selected" : ""}
              aria-current={days === 7 ? "page" : undefined}
            >
              7 days
            </Link>
            <Link
              href="?days=30"
              className={days === 30 ? "selected" : ""}
              aria-current={days === 30 ? "page" : undefined}
            >
              30 days
            </Link>
          </div>
        </div>
        <ActivityChart data={data.chart} />
        {periodTotal === 0 && (
          <p className="chart-empty">
            No clicks in this period yet. Share your links to start seeing
            activity.
          </p>
        )}
      </section>
      <div className="analytics-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Top referrers</h2>
              <p>Where your clicks come from · Last {days} days</p>
            </div>
            <Globe size={19} className="muted" />
          </div>
          {data.referrers.length ? (
            <div className="referrers">
              {data.referrers.slice(0, 10).map((row) => (
                <div key={row.referrer ?? "direct"} className="referrer">
                  <div>
                    <span>
                      {row.referrer
                        ? new URL(row.referrer).hostname
                        : "Direct / Unknown"}
                    </span>
                    <strong>{number(row._count._all)}</strong>
                  </div>
                  <div className="referrer-track">
                    <span
                      style={{
                        width: `${(row._count._all / periodTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              <p className="field-hint">
                Direct / Unknown means no referrer was provided.
              </p>
            </div>
          ) : (
            <Empty
              title="No referrers yet"
              description="Referral sources will appear as clicks arrive."
              create={false}
            />
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent clicks</h2>
              <p>Latest 15 in the selected period · UTC</p>
            </div>
          </div>
          {data.recent.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>LINK / REFERRER</th>
                    <th>TIME (UTC)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((click) => (
                    <tr key={click.id}>
                      <td>
                        <strong className="recent-click-title">
                          {click.link.title}
                        </strong>
                        <span className="destination">
                          {click.referrer
                            ? new URL(click.referrer).hostname
                            : "Direct / Unknown"}
                        </span>
                      </td>
                      <td className="table-date">
                        {date(click.timestamp)}
                        <span className="destination">
                          {click.timestamp.toISOString().slice(11, 19)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="Your first click is on its way."
              description="Each visit to a short link will show up here."
              create={false}
            />
          )}
        </section>
      </div>
    </>
  );
}
