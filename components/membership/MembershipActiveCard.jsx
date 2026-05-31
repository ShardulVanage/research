'use client';

export function MembershipActiveCard({ membership }) {
  if (!membership) return null;

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'trial':
        return {
          bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
          border: 'border-blue-200 dark:border-blue-700',
          badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
          text: 'text-blue-900 dark:text-blue-100',
        };
      case 'yearly':
        return {
          bg: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
          border: 'border-purple-200 dark:border-purple-700',
          badge: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
          text: 'text-purple-900 dark:text-purple-100',
        };
      case 'lifetime':
        return {
          bg: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
          border: 'border-amber-200 dark:border-amber-700',
          badge: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
          text: 'text-amber-900 dark:text-amber-100',
        };
      default:
        return {
          bg: 'from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-700',
          border: 'border-slate-200 dark:border-gray-700',
          badge: 'bg-slate-200 dark:bg-gray-600 text-slate-700 dark:text-gray-300',
          text: 'text-slate-900 dark:text-slate-100',
        };
    }
  };

  const colors = getPlanColor(membership.plan);
  const daysLeft = Math.ceil(
    (new Date(membership.end_date) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const getPlanLabel = (plan) => {
    switch (plan) {
      case 'trial':
        return 'Free Trial';
      case 'yearly':
        return 'Annual Membership';
      case 'lifetime':
        return 'Lifetime Membership';
      default:
        return 'Member';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-xl p-6 w-full max-w-[340px] space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      {/* Header with Plan Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <div>
            <p className={`text-[11px] font-bold tracking-widest ${colors.text}`}>
              MEMBER
            </p>
            <p className={`text-[13px] font-bold ${colors.text}`}>
              {getPlanLabel(membership.plan)}
            </p>
          </div>
        </div>
        <span className={`${colors.badge} text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap`}>
          {daysLeft} days left
        </span>
      </div>

      {/* Dates */}
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-600 dark:text-slate-400">Started:</span>
          <span className={`font-medium ${colors.text}`}>{formatDate(membership.start_date)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-600 dark:text-slate-400">Expires:</span>
          <span className={`font-medium ${colors.text}`}>{formatDate(membership.end_date)}</span>
        </div>
      </div>

      {/* Membership ID */}
      {membership.membership_id && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">MEMBERSHIP ID</p>
          <p className="font-mono text-[12px] font-bold text-slate-700 dark:text-slate-300 break-all">
            {membership.membership_id}
          </p>
        </div>
      )}

      {/* Status Message */}
      <div className={`pt-2 text-[12px] font-medium ${colors.text}`}>
        {daysLeft > 0 ? (
          <span>✓ Your membership is active dddand valid</span>
        ) : (
          <span>⚠ Your membership has expired</span>
        )}
      </div>
    </div>
  );
}
