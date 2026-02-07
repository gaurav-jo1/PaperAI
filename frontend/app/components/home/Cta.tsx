"use client";

import Link from "next/link";

export default function Cta() {
  return (
    <section className="px-10 py-[100px]">
      <div className="relative mx-auto max-w-[680px] overflow-hidden rounded-3xl border border-black/8 bg-[#f8f9fa] px-12 py-16 text-center shadow-lg">
        {/* Overhead glow */}
        <div className="pointer-events-none absolute -top-[60px] left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#0891b2] opacity-[0.08] blur-[100px]" />

        <h2 className="relative z-10 font-display text-[2rem] font-extrabold tracking-[-1px] text-[#111827]">
          Ready to stop searching
          <br />
          and start asking?
        </h2>
        <p className="relative z-10 mt-[14px] text-[0.95rem] font-light text-[#6b7280]">
          Join 2,400+ teams already using PaperAI to get answers faster.
        </p>
        <Link
          href="/chat"
          className="relative z-10 inline-block mt-[30px] rounded-[10px] bg-[#0891b2] px-8 py-[14px] text-[0.95rem] font-semibold text-white shadow-[0_0_28px_rgba(8,145,178,0.25)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_0_40px_rgba(8,145,178,0.35)]"
        >
          Start for free →
        </Link>
      </div>
    </section>
  );
}
