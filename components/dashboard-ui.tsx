import Link from "next/link";
import {
  ArrowUpRight,
  Link2,
  MousePointer2,
  ChartNoAxesCombined,
  Plus,
  Pencil,
} from "lucide-react";
import { CopyButton } from "@/components/link-controls";
import { date, number } from "@/lib/format";
export function PageHeading({
  eyebrow,
  title,
  description,
  action = true,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: boolean;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {action && (
        <Link className="button primary" href="/dashboard/links/new">
          <Plus size={17} />
          Create link
        </Link>
      )}
    </div>
  );
}
export function Stats({
  items,
}: {
  items: { label: string; value: number; caption: string }[];
}) {
  const icons = [Link2, MousePointer2, ChartNoAxesCombined];
  return (
    <div className="stats-grid">
      {items.map((item, i) => {
        const Icon = icons[i % icons.length];
        return (
          <div className="stat-card" key={item.label}>
            <div className="stat-top">
              <span>{item.label}</span>
              <span className={`stat-icon tone-${i}`}>
                <Icon size={19} />
              </span>
            </div>
            <strong>{number(item.value)}</strong>
            <span className="stat-caption">{item.caption}</span>
          </div>
        );
      })}
    </div>
  );
}
export function Empty({
  title = "Your next connection starts here.",
  description = "Create your first short link, share it anywhere, and watch the clicks come in.",
  create = true,
}: {
  title?: string;
  description?: string;
  create?: boolean;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Link2 size={25} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {create && (
        <Link href="/dashboard/links/new" className="button primary">
          <Plus size={16} />
          Create your first link
        </Link>
      )}
    </div>
  );
}
type LinkRow = {
  id: string;
  title: string;
  originalUrl: string;
  slug: string;
  createdAt: Date;
  _count: { clicks: number };
};
export function LinksTable({
  links,
  baseUrl,
}: {
  links: LinkRow[];
  baseUrl: string;
}) {
  if (!links.length) return <Empty />;
  return (
    <div className="table-scroll">
      <table className="links-table">
        <thead>
          <tr>
            <th>LINK</th>
            <th>SHORT URL</th>
            <th>CLICKS</th>
            <th>CREATED</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id}>
              <td>
                <div className="link-title-cell">
                  <span className="link-icon">
                    <Link2 size={18} />
                  </span>
                  <div>
                    <Link
                      className="link-title"
                      href={`/dashboard/analytics/${link.id}`}
                    >
                      {link.title}
                    </Link>
                    <span className="destination" title={link.originalUrl}>
                      {link.originalUrl}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <div className="short-url">
                  <a
                    href={`${baseUrl}/${link.slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {new URL(baseUrl).host}/{link.slug}
                  </a>
                  <CopyButton url={`${baseUrl}/${link.slug}`} />
                </div>
              </td>
              <td>
                <span className="click-count">
                  {number(link._count.clicks)}
                </span>
              </td>
              <td className="table-date">{date(link.createdAt)}</td>
              <td>
                <div className="row-actions">
                  <Link
                    className="icon-button"
                    href={`/dashboard/links/${link.id}`}
                    title="Edit link"
                    aria-label={`Edit ${link.title}`}
                  >
                    <Pencil size={16} />
                  </Link>
                  <Link
                    className="icon-button"
                    href={`/dashboard/analytics/${link.id}`}
                    title="View analytics"
                    aria-label={`Analytics for ${link.title}`}
                  >
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
