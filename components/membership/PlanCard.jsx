"use client";

import { useState } from "react";
import { plans } from "./data";
import { SavingsBreakdown } from "./SavingsBreakdown";

// ─── Toggle ───────────────────────────────────────────────────────────────────

function PlanToggle({ active, onChange }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      <span
        className={`text-sm font-semibold cursor-pointer transition-colors duration-200 ${
          active === "yearly"
            ? "text-slate-900 dark:text-white"
            : "text-slate-400 dark:text-slate-500"
        }`}
        onClick={() => onChange("yearly")}
      >
        Yearly
      </span>

      {/* pill toggle */}
      <button
        onClick={() => onChange(active === "yearly" ? "lifetime" : "yearly")}
        aria-label="Toggle billing period"
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
          active === "lifetime"
            ? "bg-cyan-600 dark:bg-cyan-500"
            : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-300 ${
            active === "lifetime" ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>

      <span
        className={`text-sm font-semibold cursor-pointer transition-colors duration-200 ${
          active === "lifetime"
            ? "text-slate-900 dark:text-white"
            : "text-slate-400 dark:text-slate-500"
        }`}
        onClick={() => onChange("lifetime")}
      >
        Lifetime
        <span className="ml-1.5 text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded-full tracking-wide">
          SAVE 60%
        </span>
      </span>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function PlanCard() {
  const [billing, setBilling] = useState("yearly");
  const plan = plans[billing];

  return (
    <div className="w-full max-w-sm mx-auto">
      <PlanToggle active={billing} onChange={setBilling} />

      <div
        key={billing}
        className="bg-white dark:bg-gray-800 border-2 border-cyan-400 dark:border-cyan-600 rounded-2xl p-[1.6rem] relative"
      >
        {/* badge */}
        <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-cyan-600 dark:bg-cyan-500 text-white text-[10px] px-[18px] py-[3px] rounded-full whitespace-nowrap tracking-wider font-semibold">
          {plan.badge}
        </div>

        {/* label */}
        <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold tracking-widest mb-[6px]">
          {plan.label}
        </p>

        {/* price */}
        <div className="flex items-baseline gap-[6px] mb-[6px]">
          <span className="text-[44px] font-bold text-slate-900 dark:text-white leading-none">
            {plan.price}
          </span>
          <span className="text-[15px] text-slate-400 dark:text-slate-500">{plan.period}</span>
        </div>

        {/* description */}
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-5">
          {plan.description}
        </p>

        {/* perks */}
        <ul className="list-none p-0 flex flex-col gap-2 mb-6">
          {plan.perks.map((perk) => (
            <li
              key={perk}
              className="flex items-center gap-[9px] text-[13px] text-slate-800 dark:text-slate-200"
            >
              <span className="text-cyan-500 dark:text-cyan-400 text-base flex-shrink-0">✓</span>
              {perk}
            </li>
          ))}
        </ul>

        {/* savings breakdown */}
        <SavingsBreakdown savings={plan.savings} />

        {/* cta */}
        <button className="mt-5 block w-full py-[.8rem] bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white border-none rounded-[10px] text-[15px] font-semibold cursor-pointer tracking-wide transition-colors duration-200">
          {plan.cta}
        </button>
      </div>
    </div>
  );
}