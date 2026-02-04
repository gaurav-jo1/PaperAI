const steps = [
  {
    num: "01",
    icon: "📂",
    title: "Upload your files",
    desc: "Drag & drop PDFs, Word docs, CSVs, or any supported format. No limits on quantity.",
  },
  {
    num: "02",
    icon: "🎯",
    title: "Select & scope",
    desc: "Pick exactly which documents you want in the conversation. Toggle any time, mid-chat.",
  },
  {
    num: "03",
    icon: "💬",
    title: "Ask & discover",
    desc: "Get cited, cross-referenced answers that span your entire document set instantly.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-[1100px] px-10 py-[100px]">
      <p className="text-[0.78rem] uppercase tracking-[2px] text-[#22d3ee] font-semibold">
        How it works
      </p>
      <h2 className="mt-3 max-w-[520px] font-display text-[clamp(2rem,4vw,2.8rem)] font-extrabold leading-[1.15] tracking-[-1.5px]">
        Three steps to total document clarity
      </h2>

      <div className="mt-14 grid grid-cols-3 gap-5">
        {steps.map((s) => (
          <div
            key={s.num}
            className="group relative overflow-hidden rounded-[14px] border border-white/6 bg-[#11131a] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-white/14"
          >
            {/* Top-edge glow */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-linear-to-r from-transparent via-[#22d3ee] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="font-display text-[2.2rem] font-extrabold leading-none text-[rgba(34,211,238,0.15)]">
              {s.num}
            </div>
            <div className="mt-4 text-[1.6rem]">{s.icon}</div>
            <h3 className="mt-[14px] font-display text-[1.05rem] font-bold">
              {s.title}
            </h3>
            <p className="mt-2 text-[0.88rem] font-light leading-relaxed text-[#9ca3af]">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
