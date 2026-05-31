'use client';
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { CreditCard, FlippableMembershipCard } from "./FlippableMembershipCard";
import { FreeTrial } from "./FreeTrial";
import { ProfileCompletionGate } from "./ProfileCompletionGate";
import { checkUserMembership } from "@/lib/pocketbase";

export function CardSection() {
  const { user } = useAuth();
  const [membership, setMembership] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const checkMembership = async () => {
      if (!user) return;
      try {
        const result = await checkUserMembership(user.id);
        if (result.success) {
          setIsMember(result.isMember);
          setIsExpired(result.isExpired || false);
          setMembership(result.data);
        }
      } catch (error) {
        console.error('Error checking membership:', error);
      }
    };
    checkMembership();
  }, [user]);

  const getPlanLabel = (plan) => {
    const planMap = {
      trial: 'Free Trial',
      yearly: 'Annual Pro',
      lifetime: 'Lifetime',
    };
    return planMap[plan] || plan;
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });

  const hasActive  = isMember && membership;
  const hasExpired = isExpired && membership;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-[11px] text-slate-400 dark:text-slate-500 tracking-widest">
        CLICK TO FLIP
      </p>

      {/* Membership card */}
      {hasActive ? (
        <FlippableMembershipCard
          memberName={user?.name || user?.username || 'Member'}
          memberId={membership.membership_id || 'MEM-0000000'}
          orcid={user?.orcid_id || '0000-0000-0000-0000000000000'}
          hIndex="24"
          plan={getPlanLabel(membership.plan)}
          startDate={membership.start_date}
          endDate={membership.end_date}
          membershipStatus={membership.plan}
        />
      ) : (
        <CreditCard />
      )}

      {/* Expiry / validity line */}
      <p className="text-xs text-slate-400 dark:text-slate-500 text-center leading-relaxed">
        {hasActive ? (
          <>
            Your {getPlanLabel(membership.plan)} membership
            <br />expires on {formatDate(membership.end_date)}
          </>
        ) : hasExpired ? (
          <>
            Your {getPlanLabel(membership.plan)} expired on{' '}
            <span className="text-red-400 font-medium">
              {formatDate(membership.end_date)}
            </span>
            <br />Renew to restore access.
          </>
        ) : (
          <>
            Your membership card — valid for 12 months
            <br />from date of purchase
          </>
        )}
      </p>

      {/* Status box */}
      <div className={`rounded-xl p-4 w-full max-w-[340px] ${
        hasExpired
          ? 'bg-red-50 dark:bg-red-900/20'
          : 'bg-slate-100 dark:bg-gray-800'
      }`}>
        <p className={`text-[11px] tracking-widest mb-2 font-semibold ${
          hasExpired
            ? 'text-red-400 dark:text-red-400'
            : 'text-slate-400 dark:text-slate-500'
        }`}>
          {hasActive ? 'MEMBERSHIP STATUS' : hasExpired ? 'MEMBERSHIP EXPIRED' : 'RENEWAL REMINDER'}
        </p>
        <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
          {hasActive  ? <>✓ Your membership is active and valid. Enjoy all premium features!</> :
           hasExpired ? <>⚠️ Your free trial has expired. Upgrade now to restore full access.</> :
                        <>🔔 Auto-renews on your anniversary date. Cancel anytime from your dashboard.</>}
        </p>
      </div>

      {/* FreeTrial — gated behind profile completion */}
      {!hasActive && !hasExpired && (
        <ProfileCompletionGate>
          <FreeTrial />
        </ProfileCompletionGate>
      )}
    </div>
  );
}