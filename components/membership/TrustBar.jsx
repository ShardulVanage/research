import { trustItems } from "./data";

export function TrustBar() {
  return (
    <div className="flex gap-8 flex-wrap justify-center">
      {trustItems.map((item) => (
        <div key={item.label} className="flex items-center gap-[6px] text-xs text-slate-500 dark:text-slate-400">
          <span>{item.icon}</span>
          {item.label}
        </div>
      ))}
    </div>
  );
}