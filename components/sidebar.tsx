"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Link2,
  ChartNoAxesCombined,
  ArrowUpRight,
} from "lucide-react";
export function SidebarNav() {
  const path = usePathname();
  return (
    <nav className="sidebar-nav" aria-label="Main navigation">
      {[
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/links", label: "My links", icon: Link2 },
        {
          href: "/dashboard/analytics",
          label: "Analytics",
          icon: ChartNoAxesCombined,
        },
      ].map(({ href, label, icon: Icon }) => {
        const active =
          href === "/dashboard" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={active ? "active" : ""}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={19} />
            {label}
            {active && <ArrowUpRight size={15} className="nav-arrow" />}
          </Link>
        );
      })}
    </nav>
  );
}
