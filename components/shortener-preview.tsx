"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Link2,
  ChartNoAxesCombined,
  Check,
  Sparkles,
  Globe,
  ScanLine,
  MousePointer2,
} from "lucide-react";
import { ActivityChart } from "@/components/activity-chart";
import { validateLink } from "@/lib/validation";

const exampleActivity = [12, 19, 15, 32, 24, 41, 35].map((clicks, i) => ({
  day: `2026-09-0${i + 1}`,
  clicks,
}));

export function ShortenerPreview() {
  const [tab, setTab] = useState<"shorten" | "analytics">("shorten");
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    slug: string;
    destination: string;
  } | null>(null);

  function shorten(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const data = new FormData();
      data.set("originalUrl", url);
      data.set("slug", slug);
      const validated = validateLink(data);
      const bytes = crypto.getRandomValues(new Uint8Array(3));
      setResult({
        slug:
          validated.slug ||
          Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
            "",
          ),
        destination: validated.originalUrl,
      });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div
      className="cl-product-preview"
      aria-label="Interactive ClickLens product preview"
    >
      <div className="cl-window-bar">
        <span className="cl-window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>
          <ScanLine size={12} /> clicklens / your workspace
        </span>
        <span className="cl-demo-badge">Interactive preview</span>
      </div>
      <div className="cl-preview-app">
        <aside className="cl-preview-sidebar">
          <div className="cl-preview-brand">
            <ScanLine size={21} />
            ClickLens.
          </div>
          <span className="cl-preview-label">YOUR WORKSPACE</span>
          <div className="cl-preview-tabs" aria-label="Preview views">
            <button
              type="button"
              aria-pressed={tab === "shorten"}
              onClick={() => setTab("shorten")}
            >
              <Link2 size={16} />
              Link shortener
            </button>
            <button
              type="button"
              aria-pressed={tab === "analytics"}
              onClick={() => setTab("analytics")}
            >
              <ChartNoAxesCombined size={16} />
              Click analytics
            </button>
          </div>
          <div className="cl-preview-sidebar-note">
            <Sparkles size={17} />
            <p>
              Big ideas.
              <br />
              Beautifully small links.
            </p>
          </div>
        </aside>
        <div className="cl-preview-main">
          {tab === "shorten" ? (
            <>
              <div className="cl-demo-heading">
                <div>
                  <span className="cl-eyebrow">A NEW CONNECTION</span>
                  <h2>Make a long story short.</h2>
                  <p>Your next great link starts right here.</p>
                </div>
                <span className="cl-demo-heading-icon">
                  <Link2 size={23} />
                </span>
              </div>
              <form onSubmit={shorten} className="cl-demo-form">
                <label htmlFor="preview-url">Destination URL</label>
                <div className="cl-demo-url">
                  <Globe size={18} />
                  <input
                    id="preview-url"
                    type="url"
                    value={url}
                    onChange={(event) => {
                      setUrl(event.target.value);
                      setResult(null);
                    }}
                    placeholder="https://your-next-big-idea.com/something-great"
                    required
                    maxLength={4096}
                  />
                </div>
                <div className="cl-demo-form-bottom">
                  <div>
                    <label htmlFor="preview-slug">
                      Custom ending <span>optional</span>
                    </label>
                    <div className="cl-demo-slug">
                      <span>clicklens.example/</span>
                      <input
                        id="preview-slug"
                        value={slug}
                        onChange={(event) => {
                          setSlug(event.target.value);
                          setResult(null);
                        }}
                        placeholder="your-link"
                        maxLength={48}
                      />
                    </div>
                  </div>
                  <button type="submit" className="cl-button">
                    Shorten link <ArrowRight size={16} />
                  </button>
                </div>
                {error && (
                  <p className="cl-preview-error" role="alert">
                    {error}
                  </p>
                )}
                {!result && (
                  <div className="cl-sample-hint">
                    Just looking around?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setUrl(
                          "https://example.com/your-next-big-idea?utm_source=newsletter",
                        );
                        setSlug("big-idea");
                        setError("");
                      }}
                    >
                      Try an example <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </form>
              {result ? (
                <div className="cl-demo-result" role="status">
                  <div>
                    <span className="cl-result-check">
                      <Check size={16} />
                    </span>
                    <div>
                      <span className="cl-result-label">
                        HERE’S HOW YOUR LINK COULD LOOK
                      </span>
                      <strong>clicklens.example/{result.slug}</strong>
                      <span className="cl-result-destination">
                        {result.destination}
                      </span>
                    </div>
                  </div>
                  <Link href="/register">
                    Create a real link <ArrowRight size={15} />
                  </Link>
                </div>
              ) : (
                <div className="cl-preview-tip">
                  <span>
                    <Link2 size={17} />
                  </span>
                  <p>
                    One small link. Endless places to take it.
                    <small>
                      Your newsletter, your bio, your next big launch.
                    </small>
                  </p>
                  <span className="cl-tip-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="cl-demo-heading">
                <div>
                  <span className="cl-eyebrow">THE STORY BEHIND THE CLICK</span>
                  <h2>A little insight goes a long way.</h2>
                  <p>Explore an example of your analytics view.</p>
                </div>
                <span className="cl-demo-heading-icon">
                  <ChartNoAxesCombined size={23} />
                </span>
              </div>
              <div className="cl-example-stats">
                <div>
                  <span>
                    Total clicks <MousePointer2 size={14} />
                  </span>
                  <strong>178</strong>
                </div>
                <div>
                  <span>
                    Links shared <Link2 size={14} />
                  </span>
                  <strong>3</strong>
                </div>
                <div>
                  <span>
                    Top referrer <Globe size={14} />
                  </span>
                  <strong className="cl-referrer-example">
                    newsletter.example
                  </strong>
                </div>
              </div>
              <div className="cl-example-chart">
                <div>
                  <strong>Click activity</strong>
                  <span>7 days · Example data</span>
                </div>
                <ActivityChart data={exampleActivity} />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="cl-preview-caption">
        <span>
          <span className="cl-caption-dot" />A little taste of your future
          workspace.
        </span>
        <span>
          {tab === "shorten"
            ? "Demo only · Preview links aren’t active or saved."
            : "Illustrative analytics · Not real click data."}
        </span>
      </div>
    </div>
  );
}
