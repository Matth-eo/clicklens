"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="error-state">
      <h1>We couldn’t load this page.</h1>
      <p>Your workspace is temporarily unavailable. Please try again.</p>
      <div className="button-row">
        <button className="button primary" onClick={reset}>
          Try again
        </button>
        <Link className="button" href="/dashboard">
          Back to workspace
        </Link>
      </div>
    </div>
  );
}
