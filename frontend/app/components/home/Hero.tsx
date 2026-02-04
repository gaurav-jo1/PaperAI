"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-10 pt-36 pb-20 text-center">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute rounded-full blur-[120px]">
        {/* Cyan left */}
        <div className="absolute -left-32 top-[10%] h-[500px] w-[500px] rounded-full bg-[#22d3ee] opacity-35 blur-[120px]" />
        {/* Purple right */}
        <div className="absolute -right-24 top-[30%] h-[400px] w-[400px] rounded-full bg-[#a78bfa] opacity-20 blur-[120px]" />
        {/* Cyan bottom-right */}
        <div className="absolute bottom-[5%] right-[20%] h-[300px] w-[300px] rounded-full bg-[#22d3ee] opacity-15 blur-[120px]" />
      </div>

      {/* Badge */}
      <div className="relative z-10 inline-flex items-center gap-2 rounded-full border border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.12)] px-[14px] py-[6px] mb-7">
        <span className="animate-pulse-dot h-[7px] w-[7px] rounded-full bg-[#22d3ee]" />
        <span className="text-[0.82rem] font-medium text-[#22d3ee]">
          Now with multi-document RAG
        </span>
      </div>

      {/* Headline */}
      <h1 className="relative z-10 max-w-[780px] font-display text-[clamp(3rem,7vw,5.2rem)] font-extrabold leading-[1.05] tracking-[-2.5px]">
        Ask anything.<br />
        Across <span className="text-[#22d3ee]">all</span> your docs.
      </h1>

      {/* Sub */}
      <p className="relative z-10 mt-6 max-w-[540px] text-[1.15rem] font-light leading-relaxed text-[#9ca3af]">
        Upload PDFs, reports, contracts — then have a single conversation that
        pulls answers from every file at once.
      </p>

      {/* CTAs */}
      <div className="relative z-10 mt-11 flex gap-[14px]">
        <Link
          href="/chat"
          className="rounded-[10px] bg-[#22d3ee] px-8 py-[14px] text-[0.95rem] font-semibold text-[#0a0b0e] shadow-[0_0_28px_rgba(34,211,238,0.3)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_0_40px_rgba(34,211,238,0.45)]"
        >
          Try it free →
        </Link>
        <a
          href="#how"
          className="rounded-[10px] border border-white/[0.14] px-7 py-[14px] text-[0.95rem] font-medium text-white transition-all duration-200 hover:border-[#22d3ee] hover:bg-[rgba(34,211,238,0.12)]"
        >
          See how it works
        </a>
      </div>
    </section>
  );
}
