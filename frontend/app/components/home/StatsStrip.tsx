const stats = [
  { num: "50+", label: "File formats" },
  { num: "2.4s", label: "Avg response" },
  { num: "98%", label: "Accuracy rate" },
  { num: "∞", label: "Context window" },
];

export default function StatsStrip() {
  return (
    <div className="flex justify-center gap-16 border-y border-black/8 px-10 py-12">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <div className="font-display text-[2rem] font-extrabold text-[#0891b2]">
            {s.num}
          </div>
          <div className="mt-1 text-[0.8rem] uppercase tracking-[0.8px] text-[#6b7280]">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
