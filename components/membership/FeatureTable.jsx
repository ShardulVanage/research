import React from "react";
import { Tag } from "./Tag";
import { featureCategories } from "./data";

export function FeatureTable() {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-[.4rem]">
        Everything included in your membership
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">
        A full breakdown of every feature and benefit you unlock with the annual plan.
      </p>

      <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-gray-900/60">
              <th className="text-left px-4 py-[10px] text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider border-b border-slate-200 dark:border-gray-700 w-[55%]">
                FEATURE
              </th>
              <th className="text-left px-4 py-[10px] text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider border-b border-slate-200 dark:border-gray-700">
                DETAILS
              </th>
              <th className="text-center px-4 py-[10px] text-xs font-semibold text-cyan-600 dark:text-cyan-400 tracking-wider border-b border-slate-200 dark:border-gray-700 w-[100px]">
                ANNUAL
              </th>
            </tr>
          </thead>
          <tbody>
            {featureCategories.map((cat) => (
              <React.Fragment key={cat.name}>
                <tr className="bg-cyan-50/70 dark:bg-cyan-900/20">
                  <td
                    colSpan={3}
                    className="px-4 py-[7px] text-[11px] font-bold text-cyan-600 dark:text-cyan-400 tracking-widest uppercase border-b border-t border-cyan-200/60 dark:border-cyan-800/60"
                  >
                    {cat.name}
                  </td>
                </tr>
                {cat.features.map((feature) => (
                  <tr
                    key={feature.name}
                    className="border-b border-slate-100 dark:border-gray-700/60 hover:bg-slate-50 dark:hover:bg-gray-700/40 transition-colors duration-150"
                  >
                    <td className="px-4 py-[11px] align-middle">
                      <span className="text-[13.5px] font-medium text-slate-800 dark:text-slate-200">
                        {feature.name}
                      </span>
                      {feature.tag && <Tag label={feature.tag} />}
                      <div className="text-[11.5px] text-slate-400 dark:text-slate-500 mt-[2px]">
                        {feature.note}
                      </div>
                    </td>
                    <td className="px-4 py-[11px] text-xs text-slate-500 dark:text-slate-400 align-middle">
                      {feature.note.split("—")[0].trim()}
                    </td>
                    <td className="text-center px-4 py-[11px] align-middle">
                      <span className="text-cyan-500 dark:text-cyan-400 text-xl font-semibold">✓</span>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}