'use client';
import { useEffect, useState } from 'react';
import { CardSection } from "@/components/membership/CardSection";
import { FeatureTable } from "@/components/membership/FeatureTable";
import { MembershipHero } from "@/components/membership/MembershipHero";
import { PlanCard } from "@/components/membership/PlanCard";
import { SavingsBreakdown } from "@/components/membership/SavingsBreakdown";
import { TrustBar } from "@/components/membership/TrustBar";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { checkUserMembership } from "@/lib/pocketbase";
import { useAuth } from "@/contexts/auth-context";

export default function MembershipPage() {
  const { user, loading } = useAuth();
  const [membership, setMembership] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkMembership = async () => {
      if (!user) {
        setChecking(false);
        return;
      }
      try {
        const result = await checkUserMembership(user.id);
        if (result.success) {
          setIsMember(result.isMember);
          setIsExpired(result.isExpired || false);
          setMembership(result.data);
        }
      } catch (error) {
        console.error('Error checking membership:', error);
      } finally {
        setChecking(false);
      }
    };

    if (!loading) checkMembership();
  }, [user, loading]);

  return (
    <ProtectedRoute>
      <div className="font-sans bg-slate-50 dark:bg-gray-900 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Navbar />

        <div className="max-w-[960px] mx-auto px-6 py-12">
          <MembershipHero />

          {checking ? (
            // ── Loading ──────────────────────────────────────────
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
            </div>

          ) : isMember ? (
            // ── Active member ────────────────────────────────────
            <>
              <div className="grid grid-cols-2 gap-8 mb-14 items-start">
                <div className="flex flex-col gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
                    <p className="text-[11px] text-green-600 dark:text-green-400 tracking-widest font-bold mb-2">
                      ✓ MEMBERSHIP ACTIVE
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      You have full access to all premium features and content.
                    </p>
                  </div>
                </div>
                <CardSection />
              </div>

              <div className="h-px bg-slate-200 dark:bg-gray-700 mb-12" />
              <FeatureTable />
              <div className="h-px bg-slate-200 dark:bg-gray-700 mb-8" />
              <TrustBar />
            </>

          ) : isExpired ? (
            // ── Expired member ───────────────────────────────────
            <>
              <div className="grid grid-cols-2 gap-8 mb-14 items-start">
                <div className="flex flex-col gap-4">

                  {/* Red expired banner */}
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
                    <p className="text-[11px] text-red-500 dark:text-red-400 tracking-widest font-bold mb-2">
                      ✕ MEMBERSHIP EXPIRED
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Your free trial has ended. Upgrade to keep access to all
                      premium features and content.
                    </p>
                  </div>

                  {/* Plan card to renew */}
                  <PlanCard />

                </div>

                {/* CardSection stays exactly the same */}
                <CardSection />
              </div>

              <div className="h-px bg-slate-200 dark:bg-gray-700 mb-12" />
              <FeatureTable />
              <div className="h-px bg-slate-200 dark:bg-gray-700 mb-8" />
              <TrustBar />
            </>

          ) : (
            // ── No membership at all ─────────────────────────────
            <>
              <div className="grid grid-cols-2 gap-8 mb-14 items-start">
                <div className="flex flex-col gap-4">
                  <PlanCard />
                  <SavingsBreakdown />
                </div>
                <CardSection />
              </div>

              <div className="h-px bg-slate-200 dark:bg-gray-700 mb-12" />
              <FeatureTable />
              <div className="h-px bg-slate-200 dark:bg-gray-700 mb-8" />
              <TrustBar />
            </>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}