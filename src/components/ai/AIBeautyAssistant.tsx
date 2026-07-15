import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, Bot, User, ShoppingBag, Heart, Star, ChevronRight, Mic, MicOff, RotateCcw, ThumbsUp, ThumbsDown, Copy, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/store/cart";
import { productImage } from "@/lib/product-images";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/components/ProductCard";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  quickReplies?: string[];
  timestamp: Date;
};

const BEAUTY_KNOWLEDGE: Record<string, { answer: string; products?: string[] }> = {
  "vitamin c": {
    answer: "Vitamin C is a powerful antioxidant that brightens skin, boosts collagen production, and protects against environmental damage. Look for L-ascorbic acid (10-20%) for maximum efficacy. Apply in the morning before sunscreen for best results.",
    products: ["serum"],
  },
  "hyaluronic acid": {
    answer: "Hyaluronic acid is a hydration powerhouse that can hold 1000x its weight in water. It plumps skin, reduces fine lines, and works for all skin types. Apply to damp skin and seal with a moisturizer.",
    products: ["moisturizer"],
  },
  "retinol": {
    answer: "Retinol is the gold standard for anti-aging. It accelerates cell turnover, boosts collagen, and reduces wrinkles. Start with 0.25% 2x/week and gradually increase. Always use sunscreen during the day.",
  },
  "spf": {
    answer: "Sunscreen is the most important skincare step. Use SPF 30+ daily, rain or shine. Reapply every 2 hours when outdoors. Look for broad-spectrum protection against UVA and UVB rays.",
  },
  "foundation": {
    answer: "Foundation evens out your skin tone and creates a flawless base. Choose based on your coverage needs: light for natural look, medium for everyday, full for events. Always match to your jawline, not your hand.",
    products: ["foundation"],
  },
  "lipstick": {
    answer: "The perfect lipstick depends on your undertone. Warm undertones look great in coral, peach, and warm reds. Cool undertones suit berry, plum, and blue-based reds. Nudes should match your lip color's natural depth.",
    products: ["lipstick"],
  },
  "skincare routine": {
    answer: "A basic routine: Cleanser → Toner → Serum → Moisturizer → SPF (AM) or Cleanser → Toner → Serum → Eye Cream → Night Cream (PM). Always layer from thinnest to thickest consistency.",
  },
  "oily skin": {
    answer: "For oily skin: Use a gentle foaming cleanser, oil-free moisturizer, and lightweight serums with niacinamide. Avoid heavy creams. Use clay masks 1-2x/week. Never skip moisturizer — dehydrated skin produces more oil.",
    products: ["moisturizer"],
  },
  "dry skin": {
    answer: "For dry skin: Use cream-based cleanser, hydrating toner, hyaluronic acid serum, and rich moisturizer with ceramides. Add facial oil at night. Avoid harsh exfoliants and alcohol-based products.",
    products: ["moisturizer"],
  },
  "sensitive skin": {
    answer: "For sensitive skin: Stick to fragrance-free, minimal ingredient products. Use mineral SPF, gentle micellar water, and barrier-repair creams. Patch test everything. Avoid physical scrubs and chemical exfoliants initially.",
  },
  "combination skin": {
    answer: "For combination skin: Use a gentle cleanser, lightweight moisturizer, and targeted treatments. Apply mattifying products only on T-zone. Use a hydrating serum all over for balance.",
    products: ["moisturizer"],
  },
  "shipping": {
    answer: "We offer complimentary shipping on orders over $75. Standard delivery takes 3-5 business days. Express shipping (1-2 days) is available at checkout. Free returns within 100 days on all unused products.",
  },
  "returns": {
    answer: "We offer free returns within 100 days of purchase. Items must be unused and in original packaging. Simply visit your order history and click 'Return Item' to start the process. Refunds process within 5-7 business days.",
  },
  "ingredients": {
    answer: "Our products feature clean, high-performance ingredients. Key actives include Vitamin C, Hyaluronic Acid, Niacinamide, Retinol, and Peptides. All products are paraben-free, sulfate-free, and cruelty-free.",
  },
  "routine": {
    answer: "I'd love to help build your routine! A few questions: What's your skin type? Any specific concerns (acne, aging, dark spots)? What's your current routine? I can then recommend the perfect products for you.",
  },
  "shade": {
    answer: "Finding your perfect shade is key! I recommend checking our Shade Finder tool — it uses a few simple questions to match you with your ideal foundation, concealer, and lip colors based on your skin tone and undertone.",
  },
};

const SUGGESTED_TOPICS = [
  { icon: "🧴", label: "Skincare routine", query: "help me build a skincare routine" },
  { icon: "💄", label: "Find my shade", query: "how do I find my perfect foundation shade" },
  { icon: "✨", label: "Best products", query: "what are your best selling products" },
  { icon: "🔬", label: "Ingredients", query: "tell me about your key ingredients" },
  { icon: "📦", label: "Shipping info", query: "what are your shipping options" },
  { icon: "🎁", label: "Gift ideas", query: "recommend gift sets" },
];

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

function findBestResponse(input: string): { answer: string; products?: string[] } {
  const lower = input.toLowerCase();
  let bestMatch = "";
  let bestScore = 0;

  for (const [keyword, data] of Object.entries(BEAUTY_KNOWLEDGE)) {
    const words = keyword.split(" ");
    let score = 0;
    for (const word of words) {
      if (lower.includes(word)) score += word.length;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = keyword;
    }
  }

  if (bestScore >= 3 && bestMatch) {
    return BEAUTY_KNOWLEDGE[bestMatch];
  }

  return {
    answer: "I'd be happy to help with that! I'm your personal beauty consultant. I can assist with:\n\n• Product recommendations\n• Skincare routines\n• Ingredient explanations\n• Shade matching\n• Shipping & returns\n\nWhat would you like to know?",
    quickReplies: ["Show me bestsellers", "Build my routine", "Find my shade", "Shipping info"],
  };
}

export function AIBeautyAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: "assistant",
      content: "Welcome to Lumière! I'm your personal beauty consultant. I can help you find the perfect products, build a skincare routine, explain ingredients, and more. How can I assist you today?",
      quickReplies: ["Show bestsellers", "Build my routine", "Find my shade", "Gift ideas"],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const add = useCart((s) => s.add);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  const searchProducts = async (term: string): Promise<Product[]> => {
    const { data } = await supabase
      .from("products")
      .select("*, categories!inner(slug)")
      .or(`name.ilike.%${term}%,brand.ilike.%${term}%,description.ilike.%${term}%`)
      .limit(3);
    return (data as Product[]) ?? [];
  };

  const handleSend = async (text?: string) => {
    const query = text || input.trim();
    if (!query) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    const { answer, products: productHints, quickReplies } = findBestResponse(query);

    let matchedProducts: Product[] | undefined;
    if (productHints?.length) {
      const results = await Promise.all(productHints.map((h) => searchProducts(h)));
      matchedProducts = results.flat().slice(0, 3);
    }

    const assistantMsg: Message = {
      id: generateId(),
      role: "assistant",
      content: answer,
      products: matchedProducts,
      quickReplies,
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, assistantMsg]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      handleSend(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  };

  const quickAddToCart = (product: Product) => {
    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      price: Number(product.price),
      image_key: product.image_url ?? "lipstick",
      category_slug: (product as any).category_slug,
    });
  };

  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08, boxShadow: "0 0 30px oklch(0.58 0.13 18 / 0.3)" }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 md:bottom-8 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-elevated grid place-items-center"
            aria-label="Open AI Beauty Assistant"
          >
            <Sparkles className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 md:bottom-8 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-[420px] h-[70vh] max-h-[640px] rounded-3xl bg-background/95 backdrop-blur-2xl border border-border/40 shadow-elevated flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 grid place-items-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold">Beauty Assistant</h3>
                  <p className="text-[10px] text-muted-foreground">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setMessages([]); setInput(""); }} className="p-2 rounded-xl hover:bg-muted/60 transition-colors" title="New conversation">
                  <RotateCcw className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-muted/60 transition-colors" aria-label="Close">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scroll-smooth">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] ${msg.role === "user" ? "order-2" : ""}`}>
                    {/* Avatar */}
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 grid place-items-center">
                          <Bot className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">Lumière AI</span>
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted/50 text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Product cards */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.products.map((p) => (
                          <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-colors group">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-blush-soft shrink-0">
                              <img src={productImage(p.image_url, (p as any).category_slug)} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link to="/product/$slug" params={{ slug: p.slug }} className="text-xs font-display font-medium hover:text-primary transition-colors line-clamp-1">
                                {p.name}
                              </Link>
                              <p className="text-[10px] text-muted-foreground mt-0.5">${Number(p.price).toFixed(2)}</p>
                            </div>
                            <button
                              onClick={() => quickAddToCart(p)}
                              className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
                              aria-label={`Add ${p.name} to cart`}
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick replies */}
                    {msg.quickReplies && msg.role === "assistant" && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {msg.quickReplies.map((qr) => (
                          <button
                            key={qr}
                            onClick={() => handleSend(qr)}
                            className="px-3 py-1.5 rounded-full text-[11px] bg-primary/8 text-primary hover:bg-primary/15 transition-colors"
                          >
                            {qr}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100">
                        <button onClick={() => handleCopy(msg.id, msg.content)} className="p-1 rounded hover:bg-muted/60 transition-colors">
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-muted-foreground/50" />}
                        </button>
                        <button className="p-1 rounded hover:bg-muted/60 transition-colors">
                          <ThumbsUp className="w-3 h-3 text-muted-foreground/50" />
                        </button>
                        <button className="p-1 rounded hover:bg-muted/60 transition-colors">
                          <ThumbsDown className="w-3 h-3 text-muted-foreground/50" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 grid place-items-center">
                    <Bot className="w-3 h-3 text-primary" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested topics (when few messages) */}
            {messages.length <= 1 && (
              <div className="px-5 pb-3">
                <div className="grid grid-cols-2 gap-1.5">
                  {SUGGESTED_TOPICS.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => handleSend(t.query)}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border/20 hover:border-primary/20 transition-all text-left"
                    >
                      <span className="text-base">{t.icon}</span>
                      <span className="text-[11px] font-medium text-foreground/80">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-border/30">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 bg-muted/40 rounded-2xl px-4 py-2.5 border border-border/30 focus-within:border-primary/30 transition-colors"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about products, routines..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
                />
                <button type="button" onClick={toggleVoice} className={`p-1.5 rounded-xl transition-colors ${isListening ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/60"}`} aria-label="Voice input">
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-1.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-primary/90"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
