"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Users, TrendingUp, Star, Award, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MembershipBanner, useMembershipStatus  } from "@/components/MembershipBanner";

// ── BackgroundPaths shader ────────────────────────────────────────────────────

function FloatingPaths({ position }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full text-slate-950 dark:text-white" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{ pathLength: 1, opacity: [0.3, 0.6, 0.3], pathOffset: [0, 1, 0] }}
            transition={{ duration: 20 + Math.random() * 10, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </svg>
    </div>
  );
}

// ── Membership CTA Card ───────────────────────────────────────────────────────

function MembershipCard() {
  const perks = [
    "5% off paper submission fees",
    "Conference registrations discounts",
    "Early access to publications",
    "Priority peer-review queue",
    "Exclusive researcher network",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.6, delay: 0.35, type: "spring", stiffness: 110 }}
      className="relative flex flex-col h-full"
    >
      <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-red-400/25 via-violet-400/15 to-emerald-400/15" />
      <div className="relative flex flex-col h-full bg-white/92 dark:bg-gray-900/92 backdrop-blur-xl rounded-xl border border-white/60 dark:border-gray-700/60 shadow-xl overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-red-400 via-rose-500 to-orange-400 shrink-0" />
        <div className="flex flex-col flex-1 p-4 gap-3 min-h-0">

          {/* Header badges */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
              <Star className="w-2.5 h-2.5 fill-current" />
              RESEARCHER PRO
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
              FREE TRIAL
            </span>
          </div>

          {/* Trial headline */}
          <div className="shrink-0">
            <div className="flex items-end gap-1 leading-none">
              <span className="text-4xl font-semibold text-gray-900 dark:text-white tracking-tight">30 Days</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">free</span>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              No credit card required · 
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent shrink-0" />

          {/* Perks list */}
          <ul className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-hidden">
            {perks.map((perk, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="text-[11px] text-gray-700 dark:text-gray-300 leading-tight">{perk}</span>
              </motion.li>
            ))}
          </ul>

          {/* CTA */}
          <div className="shrink-0">
            <Link href="/membership">
              <button className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-500 to-orange-400 hover:from-red-400 hover:to-red-400 text-white font-semibold text-xs py-2 rounded-lg shadow-md shadow-red-500/20 hover:shadow-red-500/35 transition-all duration-200 group">
                Claim Free Trial
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
            <Award className="w-3 h-3" />
            <span>Trusted by 1,200+ researchers</span>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

// ── Hero Section ─────────────────────────────────────────────────────────────

export function HeroSection({ publications = [] }) {
  // Hide promo card once user has any membership record (active or expired)
  const { isMember, isExpired, checking } = useMembershipStatus();
  const showMembershipCard = !checking && !isMember && !isExpired;

  const stats = [
    { icon: BookOpen,   value: `${publications.length || 0}+`, label: "Publications" },
    { icon: Users,      value: "1K+",                          label: "Researchers"  },
    { icon: TrendingUp, value: "10K+",                         label: "Citations"    },
  ];

  return (
    <div className="relative w-full md:h-[400px] overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">

      <div className="absolute inset-0 opacity-90 dark:opacity-90">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>
      <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60" />

      <div className="relative z-10 h-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-stretch">
        <div className="flex flex-col md:flex-row items-stretch gap-8 w-full">

          {/* Left */}
          <div className="flex-[6] flex flex-col justify-center min-w-0 gap-3">

            {/* ↓ Drop the banner anywhere in the left column */}
            <MembershipBanner />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="flex flex-col gap-3"
            >
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-cyan-600 dark:text-cyan-400">
                Open Research Platform
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
                Discover{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-500 to-cyan-400 dark:to-cyan-300">
                  Research
                </span>{" "}
                Publications
              </h1>

              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                Connect with researchers worldwide, share your work, and advance scientific knowledge — all in one collaborative space.
              </p>

              <div className="grid grid-cols-3 gap-3 max-w-sm mt-1">
                {stats.map(({ icon: Icon, value, label }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="bg-white/75 dark:bg-gray-800/75 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2.5 text-center shadow-sm"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-md mx-auto mb-1.5 bg-cyan-300/60 dark:bg-cyan-500/60">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-base font-bold text-gray-900 dark:text-white leading-none">{value}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — promo card hidden once user has membership */}
          <AnimatePresence>
            {showMembershipCard && (
              <div className="flex-[3] min-w-0 flex flex-col">
                <MembershipCard />
              </div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}