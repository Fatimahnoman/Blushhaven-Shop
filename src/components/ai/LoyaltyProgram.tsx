import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Gift,
  Share2,
  Copy,
  Check,
  Trophy,
  Crown,
  Sparkles,
  Calendar,
  TrendingUp,
} from "lucide-react";

type Tier = "Bronze" | "Silver" | "Gold" | "Platinum";

type TierInfo = {
  name: string;
  min: number;
  max: number;
  color: string;
  gradient: string;
  icon: React.ReactNode;
};

const TIERS: TierInfo[] = [
  { name: "Bronze", min: 0, max: 499, color: "text-amber-700 dark:text-amber-400", gradient: "from-amber-700/20 to-amber-700/5", icon: <Star className="w-4 h-4" /> },
  { name: "Silver", min: 500, max: 1499, color: "text-slate-500 dark:text-slate-300", gradient: "from-slate-500/20 to-slate-500/5", icon: <Trophy className="w-4 h-4" /> },
  { name: "Gold", min: 1500, max: 2999, color: "text-yellow-600 dark:text-yellow-400", gradient: "from-yellow-600/20 to-yellow-600/5", icon: <Crown className="w-4 h-4" /> },
  { name: "Platinum", min: 3000, max: Infinity, color: "text-violet-600 dark:text-violet-400", gradient: "from-violet-600/20 to-violet-600/5", icon: <Sparkles className="w-4 h-4" /> },
];

type EarnMethod = {
  icon: React.ReactNode;
  label: string;
  points: string;
  description: string;
};

const EARN_METHODS: EarnMethod[] = [
  { icon: <Star className="w-4 h-4" />, label: "Purchase", points: "$1 = 1pt", description: "Every dollar spent earns a point" },
  { icon: <Gift className="w-4 h-4" />, label: "Review", points: "50 pts", description: "Write a product review" },
  { icon: <Share2 className="w-4 h-4" />, label: "Referral", points: "200 pts", description: "Refer a friend who purchases" },
  { icon: <Calendar className="w-4 h-4" />, label: "Birthday", points: "100 pts", description: "Annual birthday bonus" },
  { icon: <Sparkles className="w-4 h-4" />, label: "Social Share", points: "25 pts", description: "Share on social media" },
];

type ActivityItem = {
  id: string;
  label: string;
  points: number;
  date: string;
  type: "earned" | "redeemed";
};

const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "1", label: "Purchased Vitamin C Serum", points: 68, date: "2 days ago", type: "earned" },
  { id: "2", label: "Wrote a review", points: 50, date: "5 days ago", type: "earned" },
  { id: "3", label: "Redeemed: Free Mini Set", points: -200, date: "1 week ago", type: "redeemed" },
  { id: "4", label: "Referred Sarah M.", points: 200, date: "2 weeks ago", type: "earned" },
  { id: "5", label: "Social share bonus", points: 25, date: "2 weeks ago", type: "earned" },
];

type Benefit = {
  feature: string;
  bronze: boolean | string;
  silver: boolean | string;
  gold: boolean | string;
  platinum: boolean | string;
};

const BENEFITS: Benefit[] = [
  { feature: "Free shipping", bronze: "75+", silver: "50+", gold: "Free", platinum: "Free" },
  { feature: "Birthday gift", bronze: false, silver: true, gold: true, platinum: true },
  { feature: "Early access to sales", bronze: false, silver: true, gold: true, platinum: true },
  { feature: "Exclusive products", bronze: false, silver: false, gold: true, platinum: true },
  { feature: "Personal beauty advisor", bronze: false, silver: false, gold: true, platinum: true },
  { feature: "Quarterly gift box", bronze: false, silver: false, gold: false, platinum: true },
  { feature: "VIP event access", bronze: false, silver: false, gold: false, platinum: true },
  { feature: "Points multiplier", bronze: "1x", silver: "1.25x", gold: "1.5x", platinum: "2x" },
];

const DISCOUNTS = [
  { code: "GOLD15", discount: "15% off", tier: "Gold+", expires: "Jul 31, 2026" },
  { code: "PLATINUM20", discount: "20% off", tier: "Platinum", expires: "Aug 15, 2026" },
  { code: "SUMMER25", discount: "25% off", tier: "All Members", expires: "Aug 1, 2026" },
];

const SAMPLE_POINTS = 1850;

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        ref.current = requestAnimationFrame(tick);
      }
    }

    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [target]);

  return <span>{count.toLocaleString()}</span>;
}

function getCurrentTier(points: number): TierInfo {
  return TIERS.find((t) => points >= t.min && points <= t.max) ?? TIERS[0];
}

function getNextTier(points: number): TierInfo | null {
  const currentIdx = TIERS.findIndex((t) => points >= t.min && points <= t.max);
  return currentIdx < TIERS.length - 1 ? TIERS[currentIdx + 1] : null;
}

function renderBenefitValue(val: boolean | string) {
  if (val === true) return <Check className="w-4 h-4 text-emerald-500 mx-auto" />;
  if (val === false) return <span className="text-muted-foreground/30">—</span>;
  return <span className="text-xs font-medium">{val}</span>;
}

const sectionAnim = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function LoyaltyProgram() {
  const [copied, setCopied] = useState(false);
  const [birthdayClaimed, setBirthdayClaimed] = useState(false);

  const currentTier = getCurrentTier(SAMPLE_POINTS);
  const nextTier = getNextTier(SAMPLE_POINTS);
  const progressPercent = nextTier
    ? ((SAMPLE_POINTS - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;
  const pointsToNext = nextTier ? nextTier.min - SAMPLE_POINTS : 0;

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText("BH-8A3X-JK2L");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen px-4 py-10 md:py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-medium">Loyalty Program</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl mb-2">Lumière Rewards</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Earn points, unlock exclusive tiers, and enjoy luxurious perks
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-8">
            {/* Tier Card */}
            <motion.div
              custom={0}
              variants={sectionAnim}
              initial="hidden"
              animate="visible"
              className={`glass-card rounded-2xl p-6 md:p-8 border border-border/30 bg-gradient-to-br ${currentTier.gradient}`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentTier.gradient} grid place-items-center ${currentTier.color}`}>
                    {currentTier.icon}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Current Tier</p>
                    <h2 className={`font-display text-xl ${currentTier.color}`}>{currentTier.name}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Points Balance</p>
                  <p className="font-display text-2xl font-semibold">
                    <AnimatedCounter target={SAMPLE_POINTS} />
                  </p>
                </div>
              </div>

              {/* Progress to next tier */}
              {nextTier && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">{currentTier.name}</span>
                    <span className={`font-medium ${nextTier.color}`}>{nextTier.name}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 text-center">
                    <span className="font-medium text-foreground">{pointsToNext.toLocaleString()}</span> points to {nextTier.name}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Ways to Earn */}
            <motion.div
              custom={1}
              variants={sectionAnim}
              initial="hidden"
              animate="visible"
              className="glass-card rounded-2xl p-6 border border-border/30"
            >
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-display text-lg">Ways to Earn</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {EARN_METHODS.map((method) => (
                  <motion.div
                    key={method.label}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-muted/20 border border-border/20 hover:border-primary/20 transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 grid place-items-center text-primary shrink-0">
                      {method.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{method.label}</p>
                        <span className="text-[10px] font-semibold text-primary">{method.points}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{method.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Tier Benefits Comparison */}
            <motion.div
              custom={2}
              variants={sectionAnim}
              initial="hidden"
              animate="visible"
              className="glass-card rounded-2xl p-6 border border-border/30"
            >
              <div className="flex items-center gap-2 mb-5">
                <Crown className="w-4 h-4 text-primary" />
                <h3 className="font-display text-lg">Tier Benefits</h3>
              </div>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr>
                      <th className="text-left p-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium" />
                      {TIERS.map((tier) => (
                        <th key={tier.name} className={`p-2 text-center text-[10px] uppercase tracking-[0.15em] font-medium ${tier.color}`}>
                          <div className="flex flex-col items-center gap-1">
                            {tier.icon}
                            {tier.name}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {BENEFITS.map((benefit, i) => (
                      <tr key={benefit.feature} className={i % 2 === 0 ? "bg-muted/15" : ""}>
                        <td className="p-2.5 text-xs font-medium">{benefit.feature}</td>
                        <td className="p-2.5 text-center">{renderBenefitValue(benefit.bronze)}</td>
                        <td className="p-2.5 text-center">{renderBenefitValue(benefit.silver)}</td>
                        <td className="p-2.5 text-center">{renderBenefitValue(benefit.gold)}</td>
                        <td className="p-2.5 text-center">{renderBenefitValue(benefit.platinum)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              custom={3}
              variants={sectionAnim}
              initial="hidden"
              animate="visible"
              className="glass-card rounded-2xl p-6 border border-border/30"
            >
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="font-display text-lg">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                {RECENT_ACTIVITY.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/15">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg grid place-items-center ${
                        item.type === "earned" ? "bg-emerald-500/10" : "bg-rose-500/10"
                      }`}>
                        {item.type === "earned" ? (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Gift className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold ${item.type === "earned" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {item.points > 0 ? "+" : ""}{item.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Referral Code */}
            <motion.div
              custom={0}
              variants={sectionAnim}
              initial="hidden"
              animate="visible"
              className="glass-card rounded-2xl p-6 border border-border/30"
            >
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="w-4 h-4 text-primary" />
                <h3 className="font-display text-base">Your Referral Code</h3>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30">
                <code className="flex-1 text-center text-sm font-mono font-semibold tracking-wider">BH-8A3X-JK2L</code>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Copy className="w-4 h-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-3">
                Share with friends — both earn 200 points on their first purchase
              </p>
            </motion.div>

            {/* Birthday Gift */}
            <motion.div
              custom={1}
              variants={sectionAnim}
              initial="hidden"
              animate="visible"
              className="glass-card rounded-2xl p-6 border border-border/30 bg-gradient-to-br from-pink-500/5 to-violet-500/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4 text-pink-500" />
                <h3 className="font-display text-base">Birthday Gift</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Claim your exclusive birthday gift — a special treat just for you!
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setBirthdayClaimed(true)}
                disabled={birthdayClaimed}
                className={`w-full py-2.5 rounded-xl text-xs font-medium transition-all ${
                  birthdayClaimed
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "btn-primary"
                }`}
              >
                {birthdayClaimed ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-3.5 h-3.5" /> Gift Claimed!
                  </span>
                ) : (
                  "Claim Birthday Gift"
                )}
              </motion.button>
            </motion.div>

            {/* Member Discounts */}
            <motion.div
              custom={2}
              variants={sectionAnim}
              initial="hidden"
              animate="visible"
              className="glass-card rounded-2xl p-6 border border-border/30"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-display text-base">Exclusive Discounts</h3>
              </div>
              <div className="space-y-2">
                {DISCOUNTS.map((d) => (
                  <div key={d.code} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/20">
                    <div>
                      <p className="text-xs font-semibold">{d.discount}</p>
                      <p className="text-[10px] text-muted-foreground">{d.tier} · Expires {d.expires}</p>
                    </div>
                    <code className="text-[10px] font-mono bg-primary/8 text-primary px-2 py-1 rounded-md">{d.code}</code>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              custom={3}
              variants={sectionAnim}
              initial="hidden"
              animate="visible"
              className="glass-card rounded-2xl p-6 border border-border/30"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-muted/20">
                  <p className="font-display text-lg font-semibold">1,850</p>
                  <p className="text-[10px] text-muted-foreground">Total Earned</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/20">
                  <p className="font-display text-lg font-semibold">1,200</p>
                  <p className="text-[10px] text-muted-foreground">Redeemed</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/20">
                  <p className="font-display text-lg font-semibold">3</p>
                  <p className="text-[10px] text-muted-foreground">Referrals</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/20">
                  <p className="font-display text-lg font-semibold">12</p>
                  <p className="text-[10px] text-muted-foreground">Months Active</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
