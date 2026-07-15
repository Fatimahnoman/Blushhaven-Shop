import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, RotateCcw, Palette } from "lucide-react";

type SkinTone = "fair" | "light" | "medium" | "tan" | "deep";
type Undertone = "warm" | "cool" | "neutral";
type Coverage = "sheer" | "medium" | "full";
type Finish = "natural" | "matte" | "satin" | "glowy";

type Step = {
  id: string;
  question: string;
  subtitle: string;
};

const STEPS: Step[] = [
  { id: "tone", question: "What's your skin tone?", subtitle: "Select the shade closest to your complexion" },
  { id: "undertone", question: "What's your undertone?", subtitle: "Look at your veins — do they appear greenish or bluish?" },
  { id: "coverage", question: "What coverage do you prefer?", subtitle: "How much skin do you want visible underneath?" },
  { id: "finish", question: "What finish do you prefer?", subtitle: "The final look you're drawn to" },
];

const TONE_OPTIONS: { value: SkinTone; label: string; hex: string }[] = [
  { value: "fair", label: "Fair", hex: "#FDEBD3" },
  { value: "light", label: "Light", hex: "#F5D6B8" },
  { value: "medium", label: "Medium", hex: "#D4A574" },
  { value: "tan", label: "Tan", hex: "#C68642" },
  { value: "deep", label: "Deep", hex: "#8D5524" },
];

const UNDERTONE_OPTIONS: { value: Undertone; label: string; description: string; swatch: string }[] = [
  { value: "warm", label: "Warm", description: "Golden, peachy, yellow hues", swatch: "linear-gradient(135deg, #F6D365, #FDA085)" },
  { value: "cool", label: "Cool", description: "Pink, red, blue hues", swatch: "linear-gradient(135deg, #A1C4FD, #C2E9FB)" },
  { value: "neutral", label: "Neutral", description: "Mix of warm and cool", swatch: "linear-gradient(135deg, #E8D5B7, #C9B8A8)" },
];

const COVERAGE_OPTIONS: { value: Coverage; label: string; opacity: number }[] = [
  { value: "sheer", label: "Sheer", opacity: 0.35 },
  { value: "medium", label: "Medium", opacity: 0.65 },
  { value: "full", label: "Full", opacity: 1 },
];

const FINISH_OPTIONS: { value: Finish; label: string; icon: string }[] = [
  { value: "natural", label: "Natural", icon: "✨" },
  { value: "matte", label: "Matte", icon: "🪞" },
  { value: "satin", label: "Satin", icon: "🌙" },
  { value: "glowy", label: "Glowy", icon: "💫" },
];

type ShadeResult = {
  foundation: { name: string; hex: string };
  concealer: { name: string; hex: string };
  lipsticks: { name: string; hex: string }[];
  blush: { name: string; hex: string };
};

function computeShades(tone: SkinTone, undertone: Undertone): ShadeResult {
  const foundationMap: Record<SkinTone, Record<Undertone, { name: string; hex: string }>> = {
    fair: {
      warm: { name: "Porcelain Warm", hex: "#FDE8D0" },
      cool: { name: "Porcelain Cool", hex: "#F8E0DE" },
      neutral: { name: "Ivory", hex: "#F5E3D6" },
    },
    light: {
      warm: { name: "Vanilla", hex: "#F0D2B5" },
      cool: { name: "Rose Ivory", hex: "#F2D5CE" },
      neutral: { name: "Shell", hex: "#EEDAC8" },
    },
    medium: {
      warm: { name: "Honey Beige", hex: "#D4A87C" },
      cool: { name: "Medium Beige", hex: "#D1A898" },
      neutral: { name: "Sand", hex: "#CCAA88" },
    },
    tan: {
      warm: { name: "Caramel", hex: "#C08850" },
      cool: { name: "Toffee", hex: "#B87E6A" },
      neutral: { name: "Golden Toffee", hex: "#BA8A5E" },
    },
    deep: {
      warm: { name: "Mahogany", hex: "#8B5E3C" },
      cool: { name: "Espresso Cool", hex: "#7A5048" },
      neutral: { name: "Cocoa", hex: "#835A3C" },
    },
  };

  const concealerMap: Record<SkinTone, Record<Undertone, { name: string; hex: string }>> = {
    fair: {
      warm: { name: "Light Peach", hex: "#FDE5C8" },
      cool: { name: "Light Pink", hex: "#F8DAD4" },
      neutral: { name: "Light Bisque", hex: "#F6DDD0" },
    },
    light: {
      warm: { name: "Medium Peach", hex: "#F2D0A8" },
      cool: { name: "Medium Pink", hex: "#F0CFC8" },
      neutral: { name: "Medium Bisque", hex: "#ECCFBF" },
    },
    medium: {
      warm: { name: "Tan Peach", hex: "#D8AD7E" },
      cool: { name: "Tan Rose", hex: "#D2A89A" },
      neutral: { name: "Tan Bisque", hex: "#CFAC90" },
    },
    tan: {
      warm: { name: "Deep Peach", hex: "#C48A58" },
      cool: { name: "Deep Rose", hex: "#B8826E" },
      neutral: { name: "Deep Bisque", hex: "#BC8C5C" },
    },
    deep: {
      warm: { name: "Rich Peach", hex: "#9A6840" },
      cool: { name: "Rich Rose", hex: "#8A5E50" },
      neutral: { name: "Rich Bisque", hex: "#926242" },
    },
  };

  const lipstickMap: Record<Undertone, { name: string; hex: string }[]> = {
    warm: [
      { name: "Coral Sunset", hex: "#E8725A" },
      { name: "Warm Nude", hex: "#C4907A" },
      { name: "Terracotta Rose", hex: "#B85C4A" },
    ],
    cool: [
      { name: "Berry Crush", hex: "#9B3B5E" },
      { name: "Rose Petal", hex: "#C87090" },
      { name: "Plum Velvet", hex: "#7A3060" },
    ],
    neutral: [
      { name: "Dusty Rose", hex: "#C48888" },
      { name: "Mauve Blush", hex: "#B07878" },
      { name: "Rosy Nude", hex: "#BE9090" },
    ],
  };

  const blushMap: Record<SkinTone, Record<Undertone, { name: string; hex: string }>> = {
    fair: {
      warm: { name: "Peach Glow", hex: "#F8B8A0" },
      cool: { name: "Pink Petal", hex: "#F2A8B8" },
      neutral: { name: "Soft Apricot", hex: "#F0B8A8" },
    },
    light: {
      warm: { name: "Warm Peach", hex: "#E8A088" },
      cool: { name: "Rose Blush", hex: "#E098A8" },
      neutral: { name: "Petal Pink", hex: "#E0A0A0" },
    },
    medium: {
      warm: { name: "Tropical Coral", hex: "#D08870" },
      cool: { name: "Berry Rose", hex: "#C07888" },
      neutral: { name: "Warm Rose", hex: "#C88080" },
    },
    tan: {
      warm: { name: "Sunset Coral", hex: "#B87058" },
      cool: { name: "Deep Rose", hex: "#A86070" },
      neutral: { name: "Warm Berry", hex: "#B06868" },
    },
    deep: {
      warm: { name: "Rich Berry", hex: "#985040" },
      cool: { name: "Plum Blush", hex: "#884058" },
      neutral: { name: "Warm Plum", hex: "#904848" },
    },
  };

  return {
    foundation: foundationMap[tone][undertone],
    concealer: concealerMap[tone][undertone],
    lipsticks: lipstickMap[undertone],
    blush: blushMap[tone][undertone],
  };
}

function SwatchCircle({ hex, size = 48, label }: { hex: string; size?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="rounded-full shadow-glass border border-white/20 shrink-0"
        style={{ width: size, height: size, background: hex }}
      />
      {label && <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>}
    </div>
  );
}

export function ShadeFinder() {
  const [step, setStep] = useState(0);
  const [tone, setTone] = useState<SkinTone | null>(null);
  const [undertone, setUndertone] = useState<Undertone | null>(null);
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [finish, setFinish] = useState<Finish | null>(null);
  const [complete, setComplete] = useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;
  const current = STEPS[step];

  const canAdvance =
    (step === 0 && tone) ||
    (step === 1 && undertone) ||
    (step === 2 && coverage) ||
    (step === 3 && finish);

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else setComplete(true);
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const restart = () => {
    setStep(0);
    setTone(null);
    setUndertone(null);
    setCoverage(null);
    setFinish(null);
    setComplete(false);
  };

  const shades = tone && undertone ? computeShades(tone, undertone) : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {!complete ? (
          <>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
                <span>Step {step + 1} of {STEPS.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="h-1 rounded-full bg-muted/60 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="font-display text-3xl md:text-4xl mb-2">{current.question}</h2>
                <p className="text-sm text-muted-foreground mb-8">{current.subtitle}</p>

                {/* Step 0: Skin Tone */}
                {step === 0 && (
                  <div className="flex flex-wrap justify-center gap-5">
                    {TONE_OPTIONS.map((opt) => (
                      <motion.button
                        key={opt.value}
                        onClick={() => setTone(opt.value)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                          tone === opt.value
                            ? "border-primary/40 bg-primary/8 shadow-glow"
                            : "border-border/40 bg-muted/20 hover:border-border/60"
                        }`}
                      >
                        <div className="relative">
                          <div
                            className="w-16 h-16 rounded-full border-2 border-white/30 shadow-soft"
                            style={{ background: opt.hex }}
                          />
                          {tone === opt.value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0 rounded-full bg-primary/20 grid place-items-center"
                            >
                              <Check className="w-5 h-5 text-primary" />
                            </motion.div>
                          )}
                        </div>
                        <span className="text-sm font-medium">{opt.label}</span>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Step 1: Undertone */}
                {step === 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {UNDERTONE_OPTIONS.map((opt) => (
                      <motion.button
                        key={opt.value}
                        onClick={() => setUndertone(opt.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex flex-col items-center gap-4 p-6 rounded-2xl border text-center transition-all duration-300 ${
                          undertone === opt.value
                            ? "border-primary/40 bg-primary/8 shadow-glow"
                            : "border-border/40 bg-muted/20 hover:border-border/60"
                        }`}
                      >
                        <div className="w-20 h-8 rounded-full shadow-soft" style={{ background: opt.swatch }} />
                        <div>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-semibold">{opt.label}</span>
                            {undertone === opt.value && <Check className="w-4 h-4 text-primary" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Step 2: Coverage */}
                {step === 2 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {COVERAGE_OPTIONS.map((opt) => (
                      <motion.button
                        key={opt.value}
                        onClick={() => setCoverage(opt.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all duration-300 ${
                          coverage === opt.value
                            ? "border-primary/40 bg-primary/8 shadow-glow"
                            : "border-border/40 bg-muted/20 hover:border-border/60"
                        }`}
                      >
                        <div className="w-16 h-16 rounded-full bg-blush-soft relative overflow-hidden">
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{ background: "oklch(0.58 0.13 18)", opacity: opt.opacity }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold capitalize">{opt.label}</span>
                          {coverage === opt.value && <Check className="w-4 h-4 text-primary" />}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Step 3: Finish */}
                {step === 3 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {FINISH_OPTIONS.map((opt) => (
                      <motion.button
                        key={opt.value}
                        onClick={() => setFinish(opt.value)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 ${
                          finish === opt.value
                            ? "border-primary/40 bg-primary/8 shadow-glow"
                            : "border-border/40 bg-muted/20 hover:border-border/60"
                        }`}
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold">{opt.label}</span>
                          {finish === opt.value && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-10">
                  <button
                    onClick={back}
                    disabled={step === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={next}
                    disabled={!canAdvance}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm btn-primary disabled:opacity-30"
                  >
                    {step === STEPS.length - 1 ? "Find my shades" : "Continue"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          /* Results */
          shades && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 grid place-items-center mx-auto mb-6"
                >
                  <Palette className="w-8 h-8 text-primary" />
                </motion.div>
                <h1 className="font-display text-4xl md:text-5xl mb-3">Your Perfect Shades</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Curated for your {tone} skin with {undertone} undertones
                </p>
                <button onClick={restart} className="mt-4 text-xs text-primary hover:underline inline-flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" /> Retake quiz
                </button>
              </div>

              <div className="grid gap-6">
                {/* Foundation */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex items-center gap-4">
                    <SwatchCircle hex={shades.foundation.hex} size={56} />
                    <div>
                      <p className="section-label">Foundation</p>
                      <p className="font-display text-lg mt-1">{shades.foundation.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {coverage?.charAt(0).toUpperCase()}{coverage?.slice(1)} coverage · {finish?.charAt(0).toUpperCase()}{finish?.slice(1)} finish
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Concealer */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex items-center gap-4">
                    <SwatchCircle hex={shades.concealer.hex} size={56} />
                    <div>
                      <p className="section-label">Concealer</p>
                      <p className="font-display text-lg mt-1">{shades.concealer.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">One shade lighter than foundation</p>
                    </div>
                  </div>
                </motion.div>

                {/* Lipsticks */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <p className="section-label mb-4">Lipstick Shades</p>
                  <div className="grid grid-cols-3 gap-6">
                    {shades.lipsticks.map((lip) => (
                      <SwatchCircle key={lip.name} hex={lip.hex} size={52} label={lip.name} />
                    ))}
                  </div>
                </motion.div>

                {/* Blush */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex items-center gap-4">
                    <SwatchCircle hex={shades.blush.hex} size={56} />
                    <div>
                      <p className="section-label">Blush</p>
                      <p className="font-display text-lg mt-1">{shades.blush.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Complements your {undertone} tones</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}
