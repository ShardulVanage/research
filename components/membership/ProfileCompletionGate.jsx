'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

// Fields to check and their weights
const PROFILE_CHECKS = [
  { key: 'name',            label: 'Full name',         weight: 20 },
  { key: 'headline',        label: 'Headline',           weight: 15 },
  { key: 'bio',             label: 'Bio',                weight: 15 },
  { key: 'researcher_type', label: 'Researcher type',    weight: 15 },
  { key: 'avatar',          label: 'Profile photo',      weight: 10 },
  { key: 'institution',     label: 'Institution',        weight: 10 }, // checked with company fallback
  { key: 'orcid_id',        label: 'ORCID iD',           weight: 10 },
  { key: 'location',        label: 'Location',           weight:  5 },
];

// Minimum % required to activate free trial
const MINIMUM_COMPLETION = 60;

export function useProfileCompletion() {
  const { user } = useAuth();

  if (!user) return { percentage: 0, missing: [], canActivate: false };

  let earned = 0;
  const missing = [];

  for (const check of PROFILE_CHECKS) {
    let value;

    // institution OR company counts for the same slot
    if (check.key === 'institution') {
      value = user.institution || user.company;
    } else {
      value = user[check.key];
    }

    const filled = value && String(value).trim() !== '';

    if (filled) {
      earned += check.weight;
    } else {
      missing.push(check.label);
    }
  }

  return {
    percentage: earned,
    missing,
    canActivate: earned >= MINIMUM_COMPLETION,
  };
}

// ─── Visual bar ──────────────────────────────────────────────────────────────

function CompletionBar({ percentage }) {
  const color =
    percentage >= 80 ? 'bg-green-500' :
    percentage >= 60 ? 'bg-cyan-500'  :
    percentage >= 40 ? 'bg-amber-500' :
    'bg-red-400';

  return (
    <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// ─── Gate component ───────────────────────────────────────────────────────────

export function ProfileCompletionGate({ children }) {
  const router = useRouter();
  const { percentage, missing, canActivate } = useProfileCompletion();

  if (canActivate) return children;

  return (
    <div className="w-full max-w-[340px] bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5 flex flex-col gap-4">

      {/* Header */}
      <div>
        <p className="text-[11px] text-amber-600 dark:text-amber-400 tracking-widest font-bold mb-1">
          ⚠ COMPLETE YOUR PROFILE FIRST
        </p>
        <p className="text-[13px] text-amber-800 dark:text-amber-300 leading-relaxed">
          You need at least {MINIMUM_COMPLETION}% profile completion to activate
          your free trial.
        </p>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-[12px] text-slate-500 dark:text-slate-400">
            Profile completion
          </span>
          <span className={`text-[13px] font-bold ${
            percentage >= 60
              ? 'text-cyan-600 dark:text-cyan-400'
              : 'text-amber-600 dark:text-amber-400'
          }`}>
            {percentage}%
          </span>
        </div>
        <CompletionBar percentage={percentage} />
      </div>

      {/* Missing fields */}
      {missing.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 tracking-wider mb-1">
            STILL NEEDED
          </p>
          <div className="flex flex-wrap gap-[6px]">
            {missing.map((field) => (
              <span
                key={field}
                className="text-[11px] bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 rounded-full px-[10px] py-[3px]"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => router.push('/profile')}
        className="w-full py-[.75rem] bg-amber-500 hover:bg-amber-600 text-white rounded-[10px] text-[13px] font-semibold tracking-wide transition-colors duration-200"
      >
        Complete My Profile →
      </button>
    </div>
  );
}