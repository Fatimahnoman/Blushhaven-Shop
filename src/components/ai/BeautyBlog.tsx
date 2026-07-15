import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, User, Search, BookOpen, Sparkles } from "lucide-react";
import { productImage } from "@/lib/product-images";

type Category = "All" | "Makeup Tips" | "Skincare Tips" | "Beauty Trends" | "Product Reviews" | "Beauty Guides";

type Article = {
  id: string;
  title: string;
  excerpt: string;
  category: Category;
  readTime: number;
  author: string;
  date: string;
  imageKey: string;
  featured?: boolean;
};

const ARTICLES: Article[] = [
  {
    id: "1",
    title: "The 10-Minute Morning Routine That Changed My Skin",
    excerpt: "Discover the minimalist skincare routine that delivers maximum results in under 10 minutes. Perfect for busy mornings when you still want to look radiant.",
    category: "Skincare Tips",
    readTime: 5,
    author: "Aria Chen",
    date: "2026-07-10",
    imageKey: "serum",
    featured: true,
  },
  {
    id: "2",
    title: "5 Makeup Mistakes You're Making Every Day",
    excerpt: "From over-blending to wrong shade matching — avoid these common pitfalls that could be sabotaging your beauty look.",
    category: "Makeup Tips",
    readTime: 4,
    author: "Luna Rivera",
    date: "2026-07-08",
    imageKey: "lipstick",
  },
  {
    id: "3",
    title: "Summer 2026: The Hottest Beauty Trends to Try",
    excerpt: "Glass skin, latte makeup, and cherry lips — here are the trends dominating this season and how to wear them.",
    category: "Beauty Trends",
    readTime: 6,
    author: "Maya Patel",
    date: "2026-07-05",
    imageKey: "foundation",
  },
  {
    id: "4",
    title: "Retinol vs. Bakuchiol: Which Is Right for You?",
    excerpt: "We break down the science behind these two anti-aging powerhouses and help you decide which fits your skin's needs.",
    category: "Product Reviews",
    readTime: 7,
    author: "Aria Chen",
    date: "2026-07-03",
    imageKey: "moisturizer",
  },
  {
    id: "5",
    title: "How to Build a Skincare Routine from Scratch",
    excerpt: "New to skincare? This comprehensive guide walks you through every step — from cleanser to SPF — so you can build a routine that actually works.",
    category: "Beauty Guides",
    readTime: 10,
    author: "Sophie Kim",
    date: "2026-06-30",
    imageKey: "brushes",
  },
  {
    id: "6",
    title: "The Art of the Perfect Smoky Eye",
    excerpt: "Master the timeless smoky eye with our step-by-step tutorial. Includes tips for hooded eyes, monolids, and every eye shape in between.",
    category: "Makeup Tips",
    readTime: 8,
    author: "Luna Rivera",
    date: "2026-06-28",
    imageKey: "eyeshadow",
  },
  {
    id: "7",
    title: "Niacinamide: The Ingredient Your Skin Is Begging For",
    excerpt: "This vitamin B3 derivative does it all — minimizes pores, controls oil, and fades dark spots. Here's how to incorporate it into your routine.",
    category: "Skincare Tips",
    readTime: 5,
    author: "Maya Patel",
    date: "2026-06-25",
    imageKey: "serum",
  },
  {
    id: "8",
    title: "Clean Beauty: What It Really Means in 2026",
    excerpt: "Beyond the marketing buzz — we decode clean beauty standards, ingredient safety, and which certifications actually matter.",
    category: "Beauty Trends",
    readTime: 6,
    author: "Sophie Kim",
    date: "2026-06-22",
    imageKey: "moisturizer",
  },
  {
    id: "9",
    title: "Lipstick Trends: From Velvet Matte to Glazed Gloss",
    excerpt: "Your complete guide to this season's lip looks. We swatch and review 12 new shades that are worth adding to your collection.",
    category: "Product Reviews",
    readTime: 9,
    author: "Luna Rivera",
    date: "2026-06-20",
    imageKey: "lipstick",
  },
  {
    id: "10",
    title: "The Complete Guide to Sunscreen for Every Skin Type",
    excerpt: "Mineral vs. chemical, SPF 30 vs. 50, white cast solutions — everything you need to know about protecting your skin from UV damage.",
    category: "Beauty Guides",
    readTime: 12,
    author: "Aria Chen",
    date: "2026-06-18",
    imageKey: "mascara",
  },
];

const CATEGORY_OPTIONS: Category[] = [
  "All",
  "Makeup Tips",
  "Skincare Tips",
  "Beauty Trends",
  "Product Reviews",
  "Beauty Guides",
];

const CATEGORY_COLORS: Record<Category, string> = {
  "All": "bg-primary/10 text-primary",
  "Makeup Tips": "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  "Skincare Tips": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "Beauty Trends": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "Product Reviews": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Beauty Guides": "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AuthorAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 grid place-items-center">
      <span className="text-[9px] font-semibold text-primary">{initials}</span>
    </div>
  );
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export function BeautyBlog() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((article) => {
      const matchesCategory = activeCategory === "All" || article.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const featured = filteredArticles.find((a) => a.featured);
  const gridArticles = filteredArticles.filter((a) => a.id !== featured?.id);

  return (
    <div className="min-h-screen px-4 py-10 md:py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-medium">Beauty Blog</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl mb-2">The Beauty Edit</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Tips, trends, and expert guides to elevate your beauty ritual
          </p>
        </motion.div>

        {/* Search & Categories */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8 space-y-4"
        >
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-muted/30 border border-border/30 text-sm outline-none focus:border-primary/30 transition-colors placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-border/20"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Featured Article */}
        {featured && (
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="glass-card rounded-2xl overflow-hidden mb-8 group cursor-pointer border border-border/30 hover:border-primary/20 transition-colors"
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-full overflow-hidden">
                <motion.img
                  src={productImage(featured.imageKey)}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium ${CATEGORY_COLORS[featured.category]}`}>
                    {featured.category}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <BookOpen className="w-3 h-3" />
                    Featured
                  </div>
                </div>
                <h2 className="font-display text-xl md:text-2xl leading-tight mb-3 group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">
                  {featured.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AuthorAvatar name={featured.author} />
                    <div>
                      <p className="text-xs font-medium">{featured.author}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(featured.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" /> {featured.readTime} min read
                  </div>
                </div>
                <button className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full btn-primary text-xs uppercase tracking-[0.15em] self-start">
                  Read Article
                </button>
              </div>
            </div>
          </motion.article>
        )}

        {/* Article Grid */}
        {gridArticles.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {gridArticles.map((article) => (
              <motion.article
                key={article.id}
                variants={cardVariant}
                className="glass-card rounded-2xl overflow-hidden group cursor-pointer border border-border/30 hover:border-primary/20 hover:shadow-elevated transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <motion.img
                    src={productImage(article.imageKey)}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium ${CATEGORY_COLORS[article.category]}`}>
                    {article.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AuthorAvatar name={article.author} />
                      <div>
                        <p className="text-[11px] font-medium">{article.author}</p>
                        <p className="text-[9px] text-muted-foreground">{formatDate(article.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" /> {article.readTime} min
                    </div>
                  </div>
                  <button className="w-full py-2.5 rounded-xl text-xs font-medium border border-border/30 hover:bg-muted/40 hover:border-primary/20 transition-all duration-300">
                    Read More
                  </button>
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <User className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No articles found matching your search.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
