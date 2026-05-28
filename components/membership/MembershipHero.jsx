export function MembershipHero() {
  return (
    <div className="text-center mb-14">
      <span className="inline-block bg-cyan-50 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-700 text-[11px] px-4 py-1 rounded-full mb-4 font-semibold tracking-widest">
        ANNUAL MEMBERSHIP
      </span>
      <h1 className="text-[38px] font-bold leading-tight mb-3 text-slate-900 dark:text-white">
        One membership.{" "}
        <span className="text-cyan-500 dark:text-cyan-400">Everything you need</span>
        <br />
        to publish & grow.
      </h1>
      <p className="text-base text-slate-500 dark:text-slate-400 max-w-[520px] mx-auto">
        Access peer review, journal indexing, conference hosting, and full
        publishing tools — all under one annual plan.
      </p>
    </div>
  );
}