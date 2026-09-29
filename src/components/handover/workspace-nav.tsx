"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function WorkspaceNav({ links }: { links: { label: string; href: string }[] }) {
  const pathname = usePathname();
  return <nav aria-label="Navigasi workspace" className="space-y-1">
    {links.map(({ label, href }) => {
      const active = pathname === href || pathname.startsWith(`${href}/`);
      return <Link key={href} href={href} aria-current={active ? "page" : undefined}
        className={`block min-h-11 rounded-lg px-3 py-3 text-sm font-medium ${active ? "bg-accent text-primary" : "text-foreground hover:bg-background"}`}>
        {label}
      </Link>;
    })}
  </nav>;
}
