'use client';
import { CardSection } from "@/components/membership/CardSection";
import { FeatureTable } from "@/components/membership/FeatureTable";
import { MembershipHero } from "@/components/membership/MembershipHero";
import { PlanCard } from "@/components/membership/PlanCard";
import { SavingsBreakdown } from "@/components/membership/SavingsBreakdown";
import { TrustBar } from "@/components/membership/TrustBar";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";


export default function MembershipPage() {

  return (
  <ProtectedRoute>

<div className="font-sans bg-slate-50 dark:bg-gray-900 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <div className="max-w-[960px] mx-auto px-6 py-12">

        <MembershipHero />

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

      </div>
    </div>
  </ProtectedRoute>
  );
}