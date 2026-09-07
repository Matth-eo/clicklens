import Link from "next/link";
import { ArrowLeft, Link2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { appUrl } from "@/lib/format";
import { PageHeading } from "@/components/dashboard-ui";
import { LinkForm } from "@/components/link-form";
export default async function NewLink() {
  await requireUser();
  return (
    <>
      <Link href="/dashboard/links" className="back-link">
        <ArrowLeft size={16} />
        Back to my links
      </Link>
      <PageHeading
        eyebrow="A NEW CONNECTION"
        title="Make a long story short."
        description="A clean link, a clear destination, and every click accounted for."
        action={false}
      />
      <section className="panel form-panel">
        <div className="panel-heading">
          <h2>
            <Link2 size={19} />
            Create a short link
          </h2>
        </div>
        <LinkForm baseUrl={appUrl()} />
      </section>
    </>
  );
}
