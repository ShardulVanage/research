// SavingsBreakdown now accepts `savings` as a prop so each plan
// can supply its own breakdown data from PlanCard.

export function SavingsBreakdown({ savings }) {
  if (!savings?.length) return null;

  return (
    <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-[1.1rem_1.25rem]">
      <p className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-400 tracking-widest mb-3">
        WHAT YOU SAVE
      </p>
      {savings.map((item) => (
        <div
          key={item.label}
          className={`flex justify-between text-[13px] py-[5px] ${
            item.highlight
              ? "border-t border-cyan-200 dark:border-cyan-700 mt-[6px] pt-[10px]"
              : "border-b border-cyan-100 dark:border-cyan-800/50"
          }`}
        >
          <span
            className={
              item.highlight
                ? "text-slate-900 dark:text-white font-semibold"
                : "text-slate-500 dark:text-slate-400"
            }
          >
            {item.label}
          </span>
          <span
            className={`text-cyan-600 dark:text-cyan-400 font-semibold ${
              item.highlight ? "text-[15px]" : "text-[13px]"
            }`}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}