const tagStyles = {
  "HIGH VALUE": "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700",
  PRIORITY:    "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
  EXCLUSIVE:   "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-700",
  UNLIMITED:   "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
};

export function Tag({ label }) {
  const cls = tagStyles[label] ?? tagStyles["HIGH VALUE"];
  return (
    <span className={`inline-block border text-[9px] px-2 py-[2px] rounded-full ml-2 font-semibold tracking-wider align-middle ${cls}`}>
      {label}
    </span>
  );
}