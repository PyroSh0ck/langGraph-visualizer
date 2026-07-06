"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/prompts", label: "Prompts" },
    { href: "/runs", label: "Runs" },
    { href: "/compare", label: "Compare" },
  ];

  return (
    <nav className="w-48 border-r flex flex-col gap-1 p-4">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={isActive ? "font-bold" : ""}
            aria-current={isActive ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
