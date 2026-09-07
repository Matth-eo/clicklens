"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { saveLink } from "@/app/dashboard/actions";
export function LinkForm({
  link,
  baseUrl,
}: {
  link?: { id: string; title: string; originalUrl: string; slug: string };
  baseUrl: string;
}) {
  const [originalUrl, setOriginalUrl] = useState(link?.originalUrl ?? "");
  const [title, setTitle] = useState(link?.title ?? "");
  const [slug, setSlug] = useState(link?.slug ?? "");
  const [state, action, pending] = useActionState(
    saveLink.bind(null, link?.id ?? null),
    {},
  );
  return (
    <form action={action} className="link-form">
      <label>
        Destination URL <span className="required">*</span>
        <input
          name="originalUrl"
          type="url"
          required
          maxLength={4096}
          placeholder="https://example.com/your-next-big-idea"
          value={originalUrl}
          onChange={(event) => setOriginalUrl(event.target.value)}
        />
        <span className="field-hint">The original link you want to share.</span>
      </label>
      <div className="form-grid">
        <label>
          Link title <span className="optional">optional</span>
          <input
            name="title"
            maxLength={100}
            placeholder="e.g. Summer launch"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label>
          Custom slug{" "}
          <span className="optional">{link ? "required" : "optional"}</span>
          <div className="slug-input">
            <span>{new URL(baseUrl).host}/</span>
            <input
              name="slug"
              placeholder="your-link"
              minLength={3}
              maxLength={48}
              pattern={"[a-z0-9][a-z0-9_\\-]{2,47}"}
              required={!!link}
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              aria-describedby="slug-hint"
            />
          </div>
        </label>
      </div>
      <p className="field-hint" id="slug-hint">
        {link
          ? "Changing the slug means the previous short URL will stop working."
          : "Leave the slug blank and we’ll create one for you. Custom slugs use lowercase letters, numbers, hyphens, or underscores."}
      </p>
      {state.error && (
        <p className="notice error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="notice success" role="status">
          {state.success} <Link href="/dashboard/links">View your links →</Link>
        </p>
      )}
      <div className="form-footer">
        <span className="muted">
          {link
            ? "Your click history stays with this link."
            : "Small link. Ready for anywhere."}
        </span>
        <button className="button primary" disabled={pending}>
          {pending && <LoaderCircle size={17} className="spin" />}
          {pending ? "Saving…" : link ? "Save changes" : "Create short link"}
          <ArrowRight size={17} />
        </button>
      </div>
    </form>
  );
}
