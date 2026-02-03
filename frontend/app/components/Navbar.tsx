"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-10 py-[18px] border-b border-white/[0.06] bg-[#0a0b0e]/70 backdrop-blur-[18px]">
      {/* Logo */}
      <Link
        href="/"
        className="font-display text-[1.25rem] font-extrabold text-[#22d3ee] tracking-[-0.5px]"
      >
        PaperAI
      </Link>

      {/* Links + CTA */}
      <div className="flex items-center gap-2">
        {links.map((l) => {
          const isActive = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={[
                "px-4 py-2 rounded-lg text-[0.88rem] font-medium transition-all duration-250",
                isActive
                  ? "text-[#22d3ee] bg-[rgba(34,211,238,0.12)]"
                  : "text-[#9ca3af] hover:text-white hover:bg-white/[0.05]",
              ].join(" ")}
            >
              {l.label}
            </Link>
          );
        })}

        <Link
          href="/chat"
          className="ml-2 px-[22px] py-[9px] rounded-lg bg-[#22d3ee] text-[#0a0b0e] text-[0.85rem] font-semibold transition-all duration-200 hover:opacity-85 hover:-translate-y-[1px]"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
