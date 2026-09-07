import Link from "next/link";
import { ScanLine } from "lucide-react";
export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link className="brand" href={href}>
      <span className="brand-icon">
        <ScanLine size={23} strokeWidth={2.5} />
      </span>
      ClickLens<span className="brand-period">.</span>
    </Link>
  );
}
