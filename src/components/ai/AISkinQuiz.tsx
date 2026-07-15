import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, ChevronLeft, Check, RotateCcw, ShoppingBag, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { productImage } from "@/lib/product-images";
import { useCart } from "@/store/cart";
import { toast } from "sonner";
import type { Product } from "@/components/ProductCard";

type QuizStep = {
  id: string;
  question: string;
  subtitle: string;
  options: { label: string; value: string; icon?: string; description?: string }[];
};

const QUIZ_STEPS: QuizStep[] = [
  {
    id: "skin_type",
    question: "What's your skin type?",
    subtitle: "This helps us recommend the right textures and formulas",
    options: [
      { label: "Oily", value: "oily", icon: "💧", description: "Shiny T-zone, enlarged pores" },
      { label: "Dry", value: "dry", icon: "🏜️", description: "Tight, flaky, rough texture" },
      { label: "Combination", value: "combination", icon: "🔄", description: "Oily T-zone, dry cheeks" },
      { label: "Normal", value: "normal", icon: "✨", description: "Balanced, minimal issues" },
      { label: "Sensitive", value: "sensitive", icon: "🌸", description: "Easily irritated, reactive" },
    ],
  },
  {
    id: "skin_tone",
    question: "What's your skin tone?",
    subtitle: "For perfect shade matching across foundation, concealer & more",
    options: [
      { label: "Fair", value: "fair", icon: "🤍", description: "Lightest shades, burns easily" },
      { label: "Light", value: "light", icon: "🩷", description: "Light-medium, some warmth" },
      { label: "Medium", value: "medium", icon: "🫶", description: "Golden or olive undertones" },
      { label: "Tan", value: "tan", icon: "🤎", description: "Warm, sun-kissed complexion" },
      { label: "Deep", value: "deep", icon: "🍫", description: "Rich, deep complexion" },
    ],
  },
  {
    id: "concerns",
    question: "What are your main skin concerns?",
    subtitle: "Select all that apply — we'll prioritize these",
    options: [
      { label: "Acne & Breakouts", value: "acne", icon: "🩹" },
      { label: "Fine Lines & Wrinkles", value: "aging", icon: "⏳" },
      { label: "Dark Spots & Hyperpigmentation", value: "dark_spots", icon: "🟤" },
      { label: "Redness & Rosacea", value: "redness", icon: "🔴" },
      { label: "Dryness & Dehydration", value: "dryness", icon: "💧" },
      { label: "Large Pores", value: "pores", icon: "🔍" },
      { label: "Dullness", value: "dullness", icon: "🌟" },
      { label: "Uneven Texture", value: "texture", icon: "🪄" },
    ],
  },
  {
    id: "age",
    question: "What's your age group?",
    subtitle: "We'll recommend age-appropriate formulations",
    options: [
      { label: "Under 20", value: "under_20", icon: "🌱" },
      { label: "20-29", value: "20s", icon: "🌿" },
      { label: "30-39", value: "30s", icon: "🍃" },
      { label: "40-49", value: "40s", icon: "🍂" },
      { label: "50+", value: "50s", icon: "🌳" },
    ],
  },
  {
    id: "makeup_experience",
    question: "What's your makeup experience?",
    subtitle: "So we can tailor complexity of recommendations",
    options: [
      { label: "Beginner", value: "beginner", icon: "🆕", description: "Just starting out" },
      { label: "Intermediate", value: "intermediate", icon: "💄", description: "Know the basics" },
      { label: "Advanced", value: "advanced", icon: "🎨", description: "Full glam ready" },
      { label: "Minimalist", value: "minimalist", icon: "🌿", description: "Less is more" },
    ],
  },
  {
    id: "budget",
    question: "What's your preferred price range?",
    subtitle: "We'll suggest products within your comfort zone",
    options: [
      { label: "Budget-friendly", value: "budget", icon: "💰", description: "Under $30" },
      { label: "Mid-range", value: "mid", icon: "💎", description: "$30 - $60" },
      { label: "Premium", value: "premium", icon: "👑", description: "$60 - $100" },
      { label: "Luxury", value: "luxury", icon: "🏆", description: "$100+" },
    ],
  },
  {
    id: "finish",
    question: "What's your preferred makeup finish?",
    subtitle: "The look you naturally gravitate towards",
    options: [
      { label: "Natural / Dewy", value: "natural", icon: "✨", description: "Fresh, glass-skin glow" },
      { label: "Matte", value: "matte", icon: "🪞", description: " shine-free, velvety" },
      { label: "Satin", value: "satin", icon: "🌙", description: "Soft, luminous sheen" },
      { label: "Full Glam", value: "glam", icon: "💫", description: "Dramatic, polished" },
    ],
  },
];

type QuizAnswers = Record<string, string[]>;

type RoutineStep = {
  step: string;
  product: string;
  slug: string;
  reason: string;
  time: string;
};

const SLUG_MAP: Record<string, string> = {
  "Gentle Foaming Cleanser": "cloud-cleanser",
  "Balancing Essence Toner": "brightening-toner",
  "Vitamin C Brightening Serum": "radiance-glow-serum",
  "Hyaluronic Acid Serum": "hydra-bounce-moisturizer",
  "Peptide Eye Cream": "botanical-eye-cream",
  "Oil-Free Gel Moisturizer": "hydra-bounce-moisturizer",
  "Rich Hydra Cream": "midnight-repair-cream",
  "Broad Spectrum SPF 50": "golden-hour-spf",
  "Micellar Water + Cream Cleanser": "cloud-cleanser",
  "AHA/BHA Exfoliant": "petal-exfoliant",
  "Gentle Enzyme Peel": "clay-detox-mask",
  "Hydrating Essence Toner": "brightening-toner",
  "Retinol Renewal Cream": "retinol-booster",
  "Niacinamide Pore Serum": "brightening-toner",
  "Caffeine Depuffing Eye Gel": "botanical-eye-cream",
  "Overnight Repair Cream": "midnight-repair-cream",
};

function generateRoutine(answers: QuizAnswers) {
  const skinType = answers.skin_type?.[0] || "normal";
  const concerns = answers.concerns || [];
  const age = answers.age?.[0] || "20s";

  const morningSteps: RoutineStep[] = [
    { step: "Cleanse", product: "Gentle Foaming Cleanser", slug: SLUG_MAP["Gentle Foaming Cleanser"], reason: `Perfect for ${skinType} skin`, time: "60s" },
    { step: "Tone", product: "Balancing Essence Toner", slug: SLUG_MAP["Balancing Essence Toner"], reason: "Preps skin for absorption", time: "30s" },
    ...(concerns.includes("dullness") || concerns.includes("dark_spots")
      ? [{ step: "Serum", product: "Vitamin C Brightening Serum", slug: SLUG_MAP["Vitamin C Brightening Serum"], reason: "Targets dark spots & dullness", time: "15s" }]
      : [{ step: "Serum", product: "Hyaluronic Acid Serum", slug: SLUG_MAP["Hyaluronic Acid Serum"], reason: "Deep hydration boost", time: "15s" }]),
    { step: "Eye Cream", product: "Peptide Eye Cream", slug: SLUG_MAP["Peptide Eye Cream"], reason: "Gentle for delicate eye area", time: "15s" },
    { step: "Moisturize", product: skinType === "oily" ? "Oil-Free Gel Moisturizer" : "Rich Hydra Cream", slug: SLUG_MAP[skinType === "oily" ? "Oil-Free Gel Moisturizer" : "Rich Hydra Cream"], reason: `Optimized for ${skinType} skin`, time: "30s" },
    { step: "SPF", product: "Broad Spectrum SPF 50", slug: SLUG_MAP["Broad Spectrum SPF 50"], reason: "UV protection is non-negotiable", time: "30s" },
  ];

  const nightSteps: RoutineStep[] = [
    { step: "Double Cleanse", product: "Micellar Water + Cream Cleanser", slug: SLUG_MAP["Micellar Water + Cream Cleanser"], reason: "Removes makeup & impurities", time: "90s" },
    { step: "Exfoliate", product: concerns.includes("texture") ? "AHA/BHA Exfoliant" : "Gentle Enzyme Peel", slug: SLUG_MAP[concerns.includes("texture") ? "AHA/BHA Exfoliant" : "Gentle Enzyme Peel"], reason: "2-3x per week for cell turnover", time: "60s" },
    { step: "Tone", product: "Hydrating Essence Toner", slug: SLUG_MAP["Hydrating Essence Toner"], reason: "Restores pH balance", time: "30s" },
    ...(concerns.includes("aging") || parseInt(age) >= 30
      ? [{ step: "Treatment", product: "Retinol Renewal Cream", slug: SLUG_MAP["Retinol Renewal Cream"], reason: "Anti-aging powerhouse", time: "15s" }]
      : [{ step: "Serum", product: "Niacinamide Pore Serum", slug: SLUG_MAP["Niacinamide Pore Serum"], reason: "Minimizes pores & controls oil", time: "15s" }]),
    { step: "Eye Cream", product: "Caffeine Depuffing Eye Gel", slug: SLUG_MAP["Caffeine Depuffing Eye Gel"], reason: "Reduces puffiness overnight", time: "15s" },
    { step: "Night Moisturize", product: "Overnight Repair Cream", slug: SLUG_MAP["Overnight Repair Cream"], reason: "Repairs while you sleep", time: "30s" },
  ];

  return { morning: morningSteps, night: nightSteps };
}

export function AISkinQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const addItem = useCart((s) => s.add);

  const step = QUIZ_STEPS[currentStep];
  const progress = ((currentStep + 1) / QUIZ_STEPS.length) * 100;
  const selected = answers[step.id] || [];
  const isMultiSelect = step.id === "concerns";

  const routine = generateRoutine(answers);

  useEffect(() => {
    if (!showResults) return;
    const slugs = [
      ...new Set([...routine.morning, ...routine.night].map((s) => s.slug)),
    ];
    supabase
      .from("products")
      .select("*, categories!inner(slug)")
      .in("slug", slugs)
      .then(({ data }) => {
        if (data) setRecommendedProducts((data as any[]).map((r) => ({ ...r, category_slug: r.categories?.slug })) as Product[]);
      });
  }, [showResults]);

  const getProduct = (slug: string) =>
    recommendedProducts.find((p) => p.slug === slug);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image_key: product.image_url ?? "",
      category_slug: product.category_slug,
    });
    toast.success(`${product.name} added to cart`);
  };

  const toggleOption = (value: string) => {
    setAnswers((prev) => {
      const current = prev[step.id] || [];
      if (isMultiSelect) {
        const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        return { ...prev, [step.id]: updated };
      }
      return { ...prev, [step.id]: [value] };
    });
  };

  const next = () => {
    if (currentStep < QUIZ_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setIsComplete(true);
      setTimeout(() => setShowResults(true), 400);
    }
  };

  const back = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const restart = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsComplete(false);
    setShowResults(false);
    setRecommendedProducts([]);
  };

  return (
    <div className="min-h-screen">
      {!showResults ? (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-xl">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
                <span>Step {currentStep + 1} of {QUIZ_STEPS.length}</span>
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

            {/* Question */}
            <AnimatePresence mode="wait">
              {!isComplete ? (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h2 className="font-display text-3xl md:text-4xl mb-2">{step.question}</h2>
                  <p className="text-sm text-muted-foreground mb-8">{step.subtitle}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {step.options.map((opt) => {
                      const isSelected = selected.includes(opt.value);
                      return (
                        <motion.button
                          key={opt.value}
                          onClick={() => toggleOption(opt.value)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-300 ${
                            isSelected
                              ? "border-primary/40 bg-primary/8 shadow-glow"
                              : "border-border/40 bg-muted/20 hover:border-border/60 hover:bg-muted/40"
                          }`}
                        >
                          {opt.icon && <span className="text-xl mt-0.5">{opt.icon}</span>}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{opt.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                            </div>
                            {opt.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-10">
                    <button
                      onClick={back}
                      disabled={currentStep === 0}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={next}
                      disabled={selected.length === 0}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm btn-primary disabled:opacity-30"
                    >
                      {currentStep === QUIZ_STEPS.length - 1 ? "See my routine" : "Continue"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 grid place-items-center mx-auto mb-6"
                  >
                    <Sparkles className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h2 className="font-display text-3xl">Analyzing your skin...</h2>
                  <p className="text-muted-foreground mt-2">Building your personalized routine</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* Results */
        <div className="max-w-4xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl mb-3">Your Beauty Routine</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Based on your {QUIZ_STEPS.length}-question profile, here's your personalized skincare routine
            </p>
            <button onClick={restart} className="mt-4 text-xs text-primary hover:underline inline-flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Retake quiz
            </button>
          </motion.div>

          {/* Routine Timeline */}
          <div className="grid md:grid-cols-2 gap-12">
            {/* Morning */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="font-display text-2xl mb-6 flex items-center gap-2">
                <span className="text-2xl">☀️</span> Morning Routine
              </h3>
              <div className="space-y-4">
                {routine.morning.map((s, i) => {
                  const product = getProduct(s.slug);
                  return (
                    <RoutineStepCard key={i} step={s} index={i} product={product} onAdd={handleAddToCart} total={routine.morning.length} />
                  );
                })}
              </div>
            </motion.div>

            {/* Night */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="font-display text-2xl mb-6 flex items-center gap-2">
                <span className="text-2xl">🌙</span> Night Routine
              </h3>
              <div className="space-y-4">
                {routine.night.map((s, i) => {
                  const product = getProduct(s.slug);
                  return (
                    <RoutineStepCard key={i} step={s} index={i} product={product} onAdd={handleAddToCart} total={routine.night.length} />
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-16"
          >
            <Link to="/shop">
              <button className="px-8 py-3 rounded-full btn-primary text-xs uppercase tracking-[0.2em]">
                Shop Your Routine
              </button>
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function RoutineStepCard({
  step,
  index,
  product,
  onAdd,
  total,
}: {
  step: RoutineStep;
  index: number;
  product: Product | undefined;
  onAdd: (p: Product) => void;
  total: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.08 }}
      className="relative flex gap-4 group"
    >
      {index < total - 1 && (
        <div className="absolute left-5 top-12 w-px h-[calc(100%)] bg-border/40" />
      )}
      <div className="w-10 h-10 rounded-full bg-primary/10 grid place-items-center shrink-0 z-10">
        <span className="text-xs font-semibold text-primary">{index + 1}</span>
      </div>
      <div className="flex-1 p-4 rounded-2xl bg-muted/20 border border-border/30 hover:border-primary/20 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-medium">{step.step}</span>
          <span className="text-[10px] text-muted-foreground">{step.time}</span>
        </div>
        {product ? (
          <div className="flex items-center gap-3 mt-2">
            <img
              src={productImage(product.image_url, product.category_slug)}
              alt={product.name}
              className="w-12 h-12 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <Link to="/product/$slug" params={{ slug: product.slug }}>
                <p className="text-sm font-display font-medium truncate hover:text-primary transition-colors">{product.name}</p>
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-semibold">${product.price}</span>
                {product.compare_at_price && (
                  <span className="text-xs text-muted-foreground line-through">${product.compare_at_price}</span>
                )}
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {product.rating}
                </span>
              </div>
            </div>
            <button
              onClick={() => onAdd(product)}
              className="shrink-0 w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 grid place-items-center transition-colors"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-display font-medium mt-1">{step.product}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{step.reason}</p>
          </>
        )}
      </div>
    </motion.div>
  );
}
