"use client"
import * as React from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const PERSPECTIVE = 1000
const CARD_ANIMATION_DURATION = 0.6
const INITIAL_DELAY = 0.2

export default function MembershipCard({
  memberName = "DR. A. SHARMA",
  memberId = "IAS-2024-DR-8821",
  orcid = "0000-0002-1825-0097",
  hIndex = "24",
  validThrough = "12/25",
  plan = "Scholar Pro",
  variant = "gradient",
}) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isFlipped, setIsFlipped] = React.useState(false)
  const [isClicked, setIsClicked] = React.useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [10, -10])
  const rotateY = useTransform(x, [-100, 100], [-10, 10])

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(event.clientX - (rect.left + rect.width / 2))
    y.set(event.clientY - (rect.top + rect.height / 2))
  }

  const handleMouseLeave = () => { x.set(0); y.set(0) }

  const getMaskedId = (id) => {
    const parts = id.split("-")
    return `${parts[0]} · •••• · •••• · ${parts[parts.length - 1]}`
  }

  const variantStyles = {
    gradient: "bg-gradient-to-br from-[#0f4c81] via-[#1a6fad] to-[#0e7490]",
    dark: "bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900",
    glass: "bg-white/15 backdrop-blur-xl border border-white/20",
  }

  return (
    <div className="flex items-center justify-center relative overflow-hidden w-full p-4">
      <div className="relative">
        <motion.div
          className="relative w-96 h-56"
          style={{ perspective: PERSPECTIVE }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: CARD_ANIMATION_DURATION }}
        >
          <motion.div
            className="relative w-full h-full cursor-pointer"
            style={{
              transformStyle: "preserve-3d",
              rotateX,
              rotateY: isFlipped ? 180 : rotateY,
            }}
            animate={{ scale: isClicked ? 0.95 : 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
              setIsClicked(true)
              setTimeout(() => setIsClicked(false), 200)
              setTimeout(() => setIsFlipped(!isFlipped), 100)
            }}
          >
            {/* ── FRONT ── */}
            <motion.div
              className={cn("absolute inset-0 rounded-2xl p-8", variantStyles[variant])}
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 3, ease: "linear" }}
                />
              </div>

              <div className="relative h-full flex flex-col justify-between text-white">
                {/* Top */}
                <div className="flex justify-between items-start">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: INITIAL_DELAY }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-18 h-12 rounded bg-white shadow-inner" >
                      <Image src={"/favicon.png"} alt="Logo" width={36} height={36} className="mx-auto mt-1.5" />
                    </div>
                    <span className="text-[11px] tracking-[0.14em] opacity-85 font-medium">
                      MEMBERSHIP CARD
                    </span>
                  </motion.div>
                  <motion.button
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
                    onClick={(e) => { e.stopPropagation(); setIsVisible(!isVisible) }}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  >
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </div>

                {/* Member ID */}
                {/* <motion.div
                  className="text-lg font-mono tracking-widest opacity-90"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {isVisible
                    ? memberId.replace(/-/g, " · ")
                    : getMaskedId(memberId)}
                </motion.div> */}

                {/* Bottom */}
                <div className="flex justify-between items-end">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="text-xs opacity-70 mb-1">MEMBER</div>
                    <div className="font-medium text-sm tracking-wide">{memberName}</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="text-xs opacity-70 mb-1">VALID THROUGH</div>
                    <div className="font-medium text-center text-sm font-mono">
                      {(() => {
                        const today = new Date()
                        const currentMonth = String(today.getMonth() + 1).padStart(2, '0')
                        const currentYear = String(today.getFullYear()).slice(-2)
                        
                        const nextDate = new Date(today.getFullYear(), today.getMonth() + 1, 1)
                        const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0')
                        const nextYear = String(nextDate.getFullYear()).slice(-2)
                        
                        return `  ${nextMonth}/${nextYear}`
                      })()}
                    </div>
                  </motion.div>
                  <motion.div
                    className="bg-white/20 border border-white/30 rounded-md px-3 py-1 text-xs font-medium tracking-wide"
                    initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  >
                    {plan}
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* ── BACK ── */}
            <motion.div
              className={cn("absolute inset-0 rounded-2xl", variantStyles[variant])}
              style={{
                backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}
            >
              {/* Magnetic strip */}
              <div className="absolute top-8 left-0 right-0 h-11 bg-black/75" />

              {/* Signature / ID panel */}
              <div className="absolute top-24 left-6 right-6 bg-white/90 h-10 rounded flex items-center justify-between px-3">
                <span className="text-[9px] text-slate-500 tracking-widest">MEMBER ID</span>
                <span className="text-black font-mono font-bold text-sm">{memberId}</span>
              </div>

              {/* Credential info */}
              <div className="absolute bottom-5 left-8 right-8 text-white text-xs space-y-2">
                <div className="flex justify-between">
                  <div>
                    <div className="opacity-60 text-[9px] tracking-widest mb-0.5">ORCID</div>
                    <div className="font-mono opacity-85">
                      {isVisible ? orcid : "••••-••••-1825-••••"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="opacity-60 text-[9px] tracking-widest mb-0.5">H-INDEX</div>
                    <div className="font-mono opacity-85">{isVisible ? hIndex : "••"}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] bg-green-500/25 border border-green-300/40 rounded px-2 py-1">
                    ✓ Verified
                  </div>
                </div>
                <p className="opacity-50 text-[9px] leading-relaxed">
                  50,000+ indexed journals · DOI Access · Peer Review · Preprint Submission
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating orbs */}
          <motion.div
            className="absolute -top-4 -right-4 w-20 h-20 bg-violet-400/30 rounded-full blur-2xl"
            animate={{ scale: isClicked ? [1,1.5,1] : [1,1.2,1], opacity: isClicked ? [.2,.6,.2] : [.2,.4,.2] }}
            transition={{ duration: isClicked ? 0.3 : 3, repeat: isClicked ? 0 : Infinity }}
          />
          <motion.div
            className="absolute -bottom-4 -left-4 w-24 h-24 bg-pink-400/30 rounded-full blur-2xl"
            animate={{ scale: isClicked ? [1,1.6,1] : [1,1.3,1], opacity: isClicked ? [.2,.6,.2] : [.2,.4,.2] }}
            transition={{ duration: isClicked ? 0.3 : 4, repeat: isClicked ? 0 : Infinity }}
          />

          {/* Click ripple */}
          {isClicked && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-full w-full rounded-2xl border-2 border-white/50" />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}