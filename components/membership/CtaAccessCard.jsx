"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Lock,
  ArrowRight,
  CalendarCheck,
  FileText,
  BedDouble,
  Headphones,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const benefits = [
  {
    icon: CalendarCheck,
    title: "Conference Registration",
    desc: "Priority access & free registrations for partner conferences worldwide.",
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    border: "border-cyan-100 dark:border-cyan-800/40",
  },
  {
    icon: FileText,
    title: "Publication Support",
    desc: "50% off submission fees + expedited peer-review queue.",
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    border: "border-cyan-100 dark:border-cyan-800/40",
  },
  {
    icon: BedDouble,
    title: "Accommodation",
    desc: "Exclusive partner hotel rates at all supported research events.",
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    border: "border-cyan-100 dark:border-cyan-800/40",
  },
  {
    icon: Headphones,
    title: "Contact Coordinator",
    desc: "Direct line to your personal research coordinator for any query.",
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    border: "border-cyan-100 dark:border-cyan-800/40",
  },
];

// ── Locked overlay ────────────────────────────────────────────────────────────
function LockedOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/70 dark:bg-gray-900/75 backdrop-blur-[3px]">
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-sm">
          <Lock className="w-5 h-5 text-slate-400 dark:text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-0.5">
            Members Only
          </p>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 leading-snug max-w-[200px]">
            Start your free 30-day trial or buy a membership to unlock all member benefits
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function CtaAccessCard({ isMember = false }) {
  return (
    <div className="relative">
      {/* Ambient glow */}
      <div
        className={`absolute -inset-1 rounded-2xl transition-opacity duration-500 ${
          isMember
            ? "bg-gradient-to-br from-cyan-400/20 via-cyan-400/10 to-cyan-400/15 opacity-100"
            : "opacity-0"
        }`}
      />

      <div
        className={`relative rounded-xl border shadow-sm overflow-hidden transition-all duration-300 ${
          isMember
            ? "bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-700"
            : "bg-white/80 dark:bg-gray-900/80 border-slate-200 dark:border-gray-700"
        }`}
      >
        {/* Top accent bar */}
        <div
          className={`h-0.5 w-full shrink-0 transition-all duration-300 ${
            isMember
              ? "bg-gradient-to-r from-cyan-400 via-cyan-400 to-cyan-400"
              : "bg-slate-200 dark:bg-gray-700"
          }`}
        />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            {isMember ? (
              <>
                <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0" />
                <span className="text-[11px] font-bold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">
                  Member Benefits
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-[11px] font-bold tracking-widest text-slate-400 dark:text-gray-500 uppercase">
                  Member Benefits
                </span>
              </>
            )}
          </div>

          {/* Benefit tiles — blurred when locked */}
          <div className={`relative ${!isMember ? "select-none" : ""}`}>
            {!isMember && <LockedOverlay />}

            <div
              className={`grid grid-cols-1 gap-2.5 transition-all duration-300 ${
                !isMember ? "blur-[1.5px] pointer-events-none" : ""
              }`}
            >
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: isMember ? 0.1 + i * 0.07 : 0, duration: 0.4 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${b.bg} ${b.border}`}
                >
                  <div className={`mt-0.5 shrink-0 ${b.color}`}>
                    <b.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 leading-tight mb-0.5">
                      {b.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {b.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-4">
            {isMember ? (
              <Link href="/membership/benefits">
                <button className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-500 to-cyan-500 hover:from-cyan-400 hover:to-cyan-400 text-white font-semibold text-xs py-2.5 rounded-lg shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all duration-200 group">
                  Explore All Benefits
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-600 font-semibold text-xs py-2.5 rounded-lg cursor-not-allowed border border-slate-200 dark:border-gray-700"
              >
                <Lock className="w-3.5 h-3.5" />
                Unlock with Membership
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}