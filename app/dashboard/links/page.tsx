import Link from "next/link";
import { Search } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/format";
import { Empty, LinksTable, PageHeading } from "@/components/dashboard-ui";
export default async function Links({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; deleted?: string }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const q = (typeof query.q === "string" ? query.q : "").trim().slice(0, 100);
  const requestedPage = Math.max(1, Math.min(100000, Number(query.page) || 1));
  const where = {
    userId: user.id,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
            { originalUrl: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const total = await prisma.link.count({ where });
  const pages = Math.max(1, Math.ceil(total / 20));
  const page = Math.min(pages, Math.floor(requestedPage));
  const links = await prisma.link.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * 20,
    take: 20,
    include: { _count: { select: { clicks: true } } },
  });
  return (
    <>
      <PageHeading
        eyebrow="YOUR LINK LIBRARY"
        title="My links"
        description="Every destination. One tidy place."
      />
      {query.deleted === "1" && (
        <p className="notice success mb-5" role="status">
          Link and its click history deleted.
        </p>
      )}
      <section className="panel">
        <div className="panel-heading">
          <h2>
            All links <span className="count-badge">{total}</span>
          </h2>
          <form className="search-form">
            <Search size={17} />
            <input
              name="q"
              aria-label="Search links"
              placeholder="Search your links…"
              defaultValue={q}
            />
            <button className="button" type="submit">
              Search
            </button>
          </form>
        </div>
        {!links.length && q ? (
          <Empty
            title="No matching links."
            description="Try a different title, destination, or slug."
            create={false}
          />
        ) : (
          <LinksTable links={links} baseUrl={appUrl()} />
        )}
        <div className="pagination">
          <span>
            {total} links · Page {page} of {pages}
          </span>
          <div className="button-row">
            {page > 1 && (
              <Link
                className="button"
                href={`?q=${encodeURIComponent(q)}&page=${page - 1}`}
              >
                Previous
              </Link>
            )}
            {page < pages && (
              <Link
                className="button"
                href={`?q=${encodeURIComponent(q)}&page=${page + 1}`}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
