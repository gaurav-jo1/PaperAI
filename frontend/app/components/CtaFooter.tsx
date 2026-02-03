"use client";

import Link from "next/link";

export default function CtaFooter() {
  return (
    <>
      {/* CTA */}
      <section className="px-10 py-[100px]">
        <div className="relative mx-auto max-w-[680px] overflow-hidden rounded-3xl border border-white/[0.06] bg-[#11131a] px-12 py-16 text-center">
          {/* Overhead glow */}
          <div className="pointer-events-none absolute -top-[60px] left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#22d3ee] opacity-[0.12] blur-[100px]" />

          <h2 className="relative z-10 font-display text-[2rem] font-extrabold tracking-[-1px]">
            Ready to stop searching<br />and start asking?
          </h2>
          <p className="relative z-10 mt-[14px] text-[0.95rem] font-light text-[#9ca3af]">
            Join 2,400+ teams already using PaperAI to get answers faster.
          </p>
          <Link
            href="/chat"
            className="relative z-10 inline-block mt-[30px] rounded-[10px] bg-[#22d3ee] px-8 py-[14px] text-[0.95rem] font-semibold text-[#0a0b0e] shadow-[0_0_28px_rgba(34,211,238,0.3)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_0_40px_rgba(34,211,238,0.45)]"
          >
            Start for free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-white/[0.06] px-10 py-7">
        <span className="text-[0.8rem] text-[#6b7280]">
          © 2026 PaperAI. All rights reserved.
        </span>
        <span className="text-[0.78rem] text-[#6b7280]">
          Built with ♥ for document lovers
        </span>
      </footer>
    </>
  );
}
