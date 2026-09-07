import { Brand } from "@/components/brand";
import {
  ArrowUpRight,
  Link2,
  MousePointer2,
  ChartNoAxesCombined,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Brand />
        <div className="story-content">
          <span className="eyebrow">SMALL LINKS. BIG POSSIBILITIES.</span>
          <h1>
            Every click
            <br />
            tells a story<span>.</span>
          </h1>
          <p>
            Make your links easier to share.
            <br />
            Understand where they take you.
          </p>
          <div className="story-visual" aria-hidden="true">
            <div className="visual-line">
              <span>
                <Link2 size={20} /> Your next big idea
              </span>
              <ArrowUpRight size={20} />
            </div>
            <div className="visual-path">
              <span />
              <span />
              <span />
            </div>
            <div className="visual-icons">
              <span>
                <MousePointer2 />
              </span>
              <span>
                <ChartNoAxesCombined />
              </span>
            </div>
          </div>
        </div>
        <p className="story-footer">A clearer view of every connection.</p>
      </aside>
      <main className="auth-main">
        <div className="mobile-brand">
          <Brand />
        </div>
        <div className="auth-card">{children}</div>
        <p className="auth-footer">Shorten. Share. See the impact.</p>
      </main>
    </div>
  );
}
