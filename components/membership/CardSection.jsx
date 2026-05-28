import CreditCard, { FlippableMembershipCard } from "./FlippableMembershipCard";
import { paymentMethods } from "./data";

export function CardSection() {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-[11px] text-slate-400 dark:text-slate-500 tracking-widest">CLICK TO FLIP</p>

       <CreditCard />

      <p className="text-xs text-slate-400 dark:text-slate-500 text-center leading-relaxed">
        Your membership card — valid for 12 months
        <br />from date of purchase
      </p>

      <div className="bg-slate-100 dark:bg-gray-800 rounded-xl p-4 w-full max-w-[340px]">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 tracking-widest mb-2">
          RENEWAL REMINDER
        </p>
        <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
          🔔 Auto-renews on your anniversary date. Cancel anytime from your dashboard.
        </p>
      </div>

      {/* <div className="bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 rounded-xl p-4 w-full max-w-[340px]">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 tracking-widest mb-[10px]">
          ACCEPTED PAYMENTS
        </p>
        <div className="flex gap-2 flex-wrap">
          {paymentMethods.map((method) => (
            <span
              key={method}
              className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-[6px] text-[11px] px-[10px] py-[3px] text-slate-600 dark:text-slate-300 font-medium"
            >
              {method}
            </span>
          ))}
        </div>
      </div> */}
    </div>
  );
}