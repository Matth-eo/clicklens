import { Brand } from "@/components/brand";
import { SidebarNav } from "@/components/sidebar";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/(auth)/actions";
import { LogOut, ScanLine } from "lucide-react";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <div className="workspace">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">
        <Brand href="/dashboard" />
        <div className="workspace-picker">
          <span className="workspace-avatar">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            Personal workspace<small>Your links, all together</small>
          </div>
        </div>
        <span className="nav-label">WORKSPACE</span>
        <SidebarNav />
        <div className="sidebar-note">
          <ScanLine size={22} />
          <strong>A little link. A lot of insight.</strong>
          <p>
            Share something great.
            <br />
            We’ll keep track of the clicks.
          </p>
        </div>
        <div className="sidebar-bottom">
          <span className="status-dot" />
          All connections start with a link
        </div>
      </aside>
      <div className="workspace-body">
        <header className="topbar">
          <span className="topbar-label">
            Workspace <span>/</span> <strong>ClickLens</strong>
          </span>
          <div className="account">
            <span className="account-avatar">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="account-name">{user.name}</span>
            <form action={logout}>
              <button
                className="icon-button"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </header>
        <main id="main-content" className="page-content">
          {children}
        </main>
        <footer className="workspace-footer">
          <span>
            ClickLens{" "}
            <span className="muted">/ A clearer view of every click</span>
          </span>
          <span>Made for meaningful connections.</span>
        </footer>
      </div>
    </div>
  );
}
