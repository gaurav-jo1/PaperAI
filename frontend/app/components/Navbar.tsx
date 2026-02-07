"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-10 py-[18px] border-b border-black/8 bg-white/80 backdrop-blur-[18px] shadow-sm">
      {/* Logo */}
      <Link
        href="/"
        className="font-display text-[1.25rem] font-extrabold text-[#0891b2] tracking-[-0.5px]"
      >
        PaperAI
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/chat"
          className="ml-2 px-[22px] py-[9px] rounded-lg bg-[#0891b2] text-white text-[0.85rem] font-semibold transition-all duration-200 hover:opacity-85 hover:-translate-y-px"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
