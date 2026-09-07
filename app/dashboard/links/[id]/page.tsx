import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/format";
import { PageHeading } from "@/components/dashboard-ui";
import { LinkForm } from "@/components/link-form";
import { DeleteButton } from "@/components/link-controls";
export default async function EditLink({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const link = await prisma.link.findFirst({ where: { id, userId: user.id } });
  if (!link) notFound();
  return (
    <>
      <Link href="/dashboard/links" className="back-link">
        <ArrowLeft size={16} />
        Back to my links
      </Link>
      <PageHeading
        eyebrow="FINE-TUNE YOUR CONNECTION"
        title="Edit link"
        description="Update the destination or give your link a new name."
        action={false}
      />
      <section className="panel form-panel">
        <LinkForm
          link={{
            id: link.id,
            title: link.title,
            originalUrl: link.originalUrl,
            slug: link.slug,
          }}
          baseUrl={appUrl()}
        />
      </section>
      <section className="panel danger-panel">
        <div>
          <h2>Delete this link</h2>
          <p className="muted">
            Remove the short URL and its analytics permanently.
          </p>
        </div>
        <DeleteButton id={id} />
      </section>
    </>
  );
}
