"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Zap, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { checkUserMembership } from "@/lib/pocketbase";

function useDaysLeft(endDate) {
  if (!endDate) return null;
  const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function BannerShell({ gradientClass, borderClass, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className={`w-full bg-gradient-to-r ${gradientClass} border ${borderClass} rounded-xl px-4 py-3 flex items-center justify-between gap-3`}
    >
      {children}
    </motion.div>
  );
}

function BannerLeft({ icon: Icon, iconClass, title, titleClass, subtitle }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className={`text-[12px] font-bold tracking-wide ${titleClass}`}>{title}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
      </div>
    </div>
  );
}

function BannerButton({ href, label, colorClass }) {
  return (
    <Link href={href} className="flex-shrink-0">
      <button className={`flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 text-white shadow-sm ${colorClass}`}>
        {label}
        <ArrowRight className="w-3 h-3" />
      </button>
    </Link>
  );
}

// ── Individual banner variants ────────────────────────────────────────────────

function TrialBanner({ daysLeft }) {
  const urgency =
    daysLeft <= 5  ? "red"   :
    daysLeft <= 10 ? "amber" :
    "cyan";

  const config = {
    red: {
      gradient: "from-red-500/15 via-rose-500/10 to-red-500/5",
      border:   "border-red-300 dark:border-red-700",
      icon:     "bg-red-100 dark:bg-red-900/40 text-red-500",
      title:    "text-red-600 dark:text-red-400",
      btn:      "bg-red-500 hover:bg-red-600 shadow-red-500/30",
    },
    amber: {
      gradient: "from-amber-500/15 via-yellow-500/10 to-amber-500/5",
      border:   "border-amber-300 dark:border-amber-700",
      icon:     "bg-amber-100 dark:bg-amber-900/40 text-amber-500",
      title:    "text-amber-600 dark:text-amber-400",
      btn:      "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30",
    },
    cyan: {
      gradient: "from-cyan-500/15 via-sky-500/10 to-cyan-500/5",
      border:   "border-cyan-300 dark:border-cyan-700",
      icon:     "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-500",
      title:    "text-cyan-600 dark:text-cyan-400",
      btn:      "bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/30",
    },
  }[urgency];

  return (
    <BannerShell gradientClass={config.gradient} borderClass={config.border}>
      <BannerLeft
        icon={Clock}
        iconClass={config.icon}
        title={
          daysLeft === 0
            ? "Your free trial expires today!"
            : `Free trial expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
        }
        titleClass={config.title}
        subtitle=""
      />
      <BannerButton href="/membership" label="See Benefits" colorClass={config.btn} />
    </BannerShell>
  );
}

function ActiveBanner({ membership }) {
  const isLifetime = membership?.plan === "lifetime";
  return (
    <BannerShell
      gradientClass="from-green-500/10 via-emerald-500/8 to-green-500/5"
      borderClass="border-green-200 dark:border-green-800"
    >
      <BannerLeft
        icon={Zap}
        iconClass="bg-green-100 dark:bg-green-900/40 text-green-500"
        title={isLifetime ? "Lifetime Access Active" : "Membership Active"}
        titleClass="text-green-600 dark:text-green-400"
        subtitle={
          isLifetime
            ? "You have permanent access to all features"
            : `Valid until ${new Date(membership.end_date).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              })}`
        }
      />
      <BannerButton
        href="/membership"
        label="View Benefits"
        colorClass="bg-green-500 hover:bg-green-600 shadow-green-500/30"
      />
    </BannerShell>
  );
}

function ExpiredBanner({ membership }) {
  return (
    <BannerShell
      gradientClass="from-red-500/10 via-rose-500/8 to-red-500/5"
      borderClass="border-red-200 dark:border-red-800"
    >
      <BannerLeft
        icon={AlertTriangle}
        iconClass="bg-red-100 dark:bg-red-900/40 text-red-500"
        title="Your membership has expired"
        titleClass="text-red-600 dark:text-red-400"
        subtitle={`Expired on ${new Date(membership.end_date).toLocaleDateString("en-US", {
          month: "long", day: "numeric", year: "numeric",
        })}`}
      />
      <BannerButton
        href="/membership"
        label="Renew Now"
        colorClass="bg-red-500 hover:bg-red-600 shadow-red-500/30"
      />
    </BannerShell>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function MembershipBanner() {
  const { user, loading } = useAuth();
  const [membership, setMembership] = useState(null);
  const [isMember,   setIsMember]   = useState(false);
  const [isExpired,  setIsExpired]  = useState(false);
  const [checking,   setChecking]   = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) { setChecking(false); return; }
      try {
        const result = await checkUserMembership(user.id);
        if (result.success) {
          setIsMember(result.isMember);
          setIsExpired(result.isExpired || false);
          setMembership(result.data);
        }
      } catch (e) {
        console.error("MembershipBanner fetch error:", e);
      } finally {
        setChecking(false);
      }
    };
    if (!loading) fetch();
  }, [user, loading]);

  // Don't render anything while checking or if not logged in
  if (checking || !user) return null;

  const daysLeft = useDaysLeft(membership?.end_date);
  const isTrial  = membership?.plan === "trial";

  return (
    <AnimatePresence>
      {isMember && isTrial  && <TrialBanner   key="trial"   daysLeft={daysLeft} />}
      {isMember && !isTrial && <ActiveBanner  key="active"  membership={membership} />}
      {isExpired            && <ExpiredBanner key="expired" membership={membership} />}
    </AnimatePresence>
  );
}

// ── Also export a hook for hiding the promo card ──────────────────────────────

export function useMembershipStatus() {
  const { user, loading } = useAuth();
  const [isMember,  setIsMember]  = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [checking,  setChecking]  = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) { setChecking(false); return; }
      try {
        const result = await checkUserMembership(user.id);
        if (result.success) {
          setIsMember(result.isMember);
          setIsExpired(result.isExpired || false);
        }
      } catch (e) {
        console.error("useMembershipStatus error:", e);
      } finally {
        setChecking(false);
      }
    };
    if (!loading) fetch();
  }, [user, loading]);

  return { isMember, isExpired, checking };
}