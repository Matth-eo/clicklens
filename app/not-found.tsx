import Link from "next/link";
export default function NotFound() {
  return (
    <div className="error-state">
      <span className="eyebrow">404 · OUT OF FOCUS</span>
      <h1>This link isn’t here.</h1>
      <p>It may have been deleted, or you may not have access.</p>
      <Link href="/dashboard" className="button primary">
        Back to workspace
      </Link>
    </div>
  );
}
