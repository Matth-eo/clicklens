import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  Link2,
  MousePointer2,
  ChartNoAxesCombined,
  Check,
  ScanLine,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ShortenerPreview } from "@/components/shortener-preview";
import "./landing.css";
export default async function Home() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <div className="cl-landing">
      <header className="cl-header">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="cl-header-actions">
          <Link href="/login">Log in</Link>
          <Link className="cl-button compact" href="/register">
            Get started <ArrowRight size={15} />
          </Link>
        </div>
      </header>
      <main>
        <section className="cl-hero">
          <div className="cl-hero-badge">
            <span />A little link. A whole new perspective.
          </div>
          <h1>
            Short links.
            <br />
            Long-lasting <em>connections.</em>
          </h1>
          <p className="cl-hero-description">
            Make your links a little simpler. Your impact a little clearer.
            <br className="cl-desktop-break" /> Shorten, share, and see the
            story behind every click.
          </p>
          <div className="cl-hero-actions">
            <Link className="cl-button" href="/register">
              Create your first link <ArrowRight size={17} />
            </Link>
            <a className="cl-button secondary" href="#preview">
              Try it out <ArrowDown size={16} />
            </a>
          </div>
          <div className="cl-hero-notes">
            <span>
              <Check size={13} />
              Easy to share
            </span>
            <span>
              <Check size={13} />
              Yours to customize
            </span>
            <span>
              <Check size={13} />
              Every click in focus
            </span>
          </div>
          <div className="cl-preview-wrap" id="preview">
            <div className="cl-preview-intro">
              <span className="cl-tiny-line" /> GO ON, GIVE IT A TRY{" "}
              <span className="cl-tiny-line" />
            </div>
            <ShortenerPreview />
          </div>
        </section>
        <section className="cl-features" id="features">
          <div className="cl-section-heading">
            <span className="cl-eyebrow">SMALL DETAILS. BIG DIFFERENCE.</span>
            <h2>
              Less link. <em>More possibility.</em>
            </h2>
            <p>Everything you need to make a connection worth clicking.</p>
          </div>
          <div className="cl-feature-grid">
            {[
              {
                icon: Link2,
                title: "Make it unmistakably yours.",
                text: "Turn a long, messy URL into a clean short link. Pick a memorable slug, or let us take care of it.",
                tag: "YOUR LINK, YOUR WAY",
                className: "violet",
              },
              {
                icon: MousePointer2,
                title: "Share it. See what happens.",
                text: "A newsletter, a launch, or your next big idea. Share your link anywhere and keep track of every click.",
                tag: "READY FOR EVERYWHERE",
                className: "peach",
              },
              {
                icon: ChartNoAxesCombined,
                title: "A clearer picture of your reach.",
                text: "See activity over time, discover your referral sources, and understand which links make a connection.",
                tag: "INSIGHT WITHOUT THE NOISE",
                className: "mint",
              },
            ].map(({ icon: Icon, title, text, tag, className }) => (
              <article className={`cl-feature ${className}`} key={title}>
                <span className="cl-feature-icon">
                  <Icon size={23} />
                </span>
                <span className="cl-feature-tag">{tag}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="cl-workflow" id="how-it-works">
          <div className="cl-section-heading">
            <span className="cl-eyebrow">FROM LONG URL TO NEXT BIG THING</span>
            <h2>
              Three steps. <em>One little link.</em>
            </h2>
            <p>Less setup. More getting your ideas out there.</p>
          </div>
          <ol>
            {[
              [
                "Paste your destination",
                "Drop in the URL you want to share. Give it a title and a custom ending, if you like.",
              ],
              [
                "Make the connection",
                "Copy your new short link and send it into the world. It’s ready for wherever you are.",
              ],
              [
                "Follow the story",
                "Open your dashboard to see the clicks, the referrers, and the impact as it unfolds.",
              ],
            ].map(([title, text], i) => (
              <li key={title}>
                <div className="cl-step">
                  <span>0{i + 1}</span>
                  <i />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="cl-cta">
          <span className="cl-cta-mark">
            <ScanLine size={30} />
          </span>
          <span className="cl-eyebrow">YOUR NEXT CONNECTION STARTS HERE</span>
          <h2>
            Good things come
            <br />
            in <em>short links.</em>
          </h2>
          <p>Give your next big idea a smaller URL.</p>
          <Link className="cl-button" href="/register">
            Let’s make a connection <ArrowRight size={17} />
          </Link>
        </section>
      </main>
      <footer className="cl-footer">
        <Brand />
        <p>A clearer view of every click.</p>
        <div>
          <Link href="/login">Log in</Link>
          <Link href="/register">
            Create an account <ArrowRight size={13} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
