const features = [
  {
    icon: "🔗",
    title: "Cross-document reasoning",
    desc: "PaperAI doesn't just search one file — it synthesizes information across your entire collection, surfacing connections you'd otherwise miss.",
  },
  {
    icon: "📌",
    title: "Source citations",
    desc: "Every answer is tagged with the exact source file and passage. Full transparency, zero hallucination guessing.",
  },
  {
    icon: "⚡",
    title: "Sub-second retrieval",
    desc: "Powered by advanced vector search, answers surface in under a second — no matter how large your corpus.",
  },
  {
    icon: "🔒",
    title: "Enterprise-grade security",
    desc: "SOC 2 compliant. Your documents never leave your environment. AES-256 encryption at rest and in transit.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-[1100px] px-10 pb-[100px]">
      <p className="text-[0.78rem] uppercase tracking-[2px] text-[#22d3ee] font-semibold">
        Why PaperAI
      </p>
      <h2 className="mt-3 max-w-[520px] font-display text-[clamp(2rem,4vw,2.8rem)] font-extrabold leading-[1.15] tracking-[-1.5px]">
        Built for teams who live in documents
      </h2>

      <div className="mt-14 grid grid-cols-2 gap-5">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-[14px] border border-white/[0.06] bg-[#11131a] p-9 transition-border duration-300 hover:border-white/[0.14]"
          >
            <div className="text-[1.8rem]">{f.icon}</div>
            <h3 className="mt-[18px] font-display text-[1.1rem] font-bold">
              {f.title}
            </h3>
            <p className="mt-[10px] text-[0.88rem] font-light leading-[1.65] text-[#9ca3af]">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
