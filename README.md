<div align="center">

# Lumiere

### *The Ritual of Radiance*

A luxury AI-powered beauty e-commerce platform crafted with modern web technologies.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3-3FCF8E?logo=supabase&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer-12-05F?logo=framer&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

</div>

---

## Overview

**Lumiere** is a full-featured luxury beauty e-commerce platform that combines AI-driven product discovery with a premium shopping experience. Built for the modern beauty consumer — from intelligent skin analysis to seamless checkout.

## Features

### AI-Powered Tools
- **Skin Quiz** — 7-step diagnostic with personalized AM/PM routine recommendations
- **Shade Finder** — Color-matching quiz for precise product suggestions
- **AI Beauty Assistant** — Floating conversational chatbot with voice input
- **Product Recommendations** — Context-aware suggestions on every product page
- **Routine Builder** — Build, save, and share custom skincare routines
- **Compare Products** — Side-by-side comparison for up to 4 products

### E-Commerce
- Full product catalog with 52+ luxury beauty products across 8 categories
- Cart with coupon system, free shipping progress bar, and persistent state
- 3-step checkout (Shipping, Payment, Review) with Web3Forms integration
- Wishlist with persistent storage
- Order tracking with animated timeline
- Guest checkout — no account required

### Design & Experience
- Warm rose-gold luxury design system with 18+ custom utility classes
- Dark mode with system preference detection and no-flash initialization
- Glassmorphism components with `oklch` color space
- 3D perspective product cards with glare overlay and fly-to-cart animation
- Scroll-physics progress bar and animated page transitions
- Fully responsive — mobile bottom nav, adaptive layouts, touch-friendly

### Content & Engagement
- Beauty Blog with 10 articles across 6 categories
- Loyalty program with 4 tiers, referral system, and animated progress
- Live social proof notifications
- Newsletter subscription with Supabase persistence
- SEO-optimized with JSON-LD structured data

### Technical
- Type-safe routing with TanStack Router + Start
- Server-side rendering and code splitting
- Zustand stores with localStorage persistence
- React Query for server state management
- 23 passing tests with Vitest
- Google Analytics, Microsoft Clarity, and Facebook Pixel integration

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | TanStack Router + Start (SSR) |
| **UI** | React 19, Tailwind CSS 4, Framer Motion |
| **State** | Zustand (client), React Query (server) |
| **Database** | Supabase (PostgreSQL + RLS + Auth) |
| **Forms** | Web3Forms API |
| **Testing** | Vitest |
| **Build** | Vite |
| **Deploy** | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase project (optional — runs with demo data)

### Installation

```bash
git clone https://github.com/Fatimahnoman/Blushhaven-Shop.git
cd Blushhaven-Shop
npm install
```

### Environment Setup

Create a `.env` file:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production

```bash
npm run build
npm run preview
```

### Testing

```bash
npm test          # single run
npm run test:watch # watch mode
```

## Project Structure

```
src/
├── assets/              # Product images, hero photography
├── components/
│   ├── ai/              # AI tools (Quiz, Chat, Recommendations, Blog, etc.)
│   ├── admin/           # Admin dashboard charts & stats
│   ├── AppShell.tsx     # Page wrapper with notifications & social proof
│   ├── CartDrawer.tsx   # Slide-out cart panel
│   ├── MobileBottomNav  # Mobile navigation
│   ├── Navbar.tsx       # Glassmorphism top navigation
│   ├── Particles.tsx    # Animated particle background
│   ├── ProductCard.tsx  # 3D tilt product card
│   ├── ScrollProgress   # Spring-physics scroll indicator
│   └── SearchOverlay.tsx# Cmd+K search with live results
├── hooks/
│   ├── useAuth.ts       # Supabase + demo mode auth
│   └── useTheme.ts      # Dark/light mode with localStorage
├── integrations/
│   └── supabase/        # Supabase client config
├── lib/
│   ├── analytics.ts     # GA, Clarity, Meta Pixel
│   ├── product-images.ts# Category-aware image mapper
│   ├── seo.ts           # JSON-LD structured data
│   └── stripe.ts        # Payment integration
├── routes/
│   ├── index.tsx        # Homepage — Hero, Flash Sale, Newsletter
│   ├── shop.tsx         # Product catalog with filters & sort
│   ├── product.$slug    # Product detail with reviews
│   ├── checkout.tsx     # 3-step checkout flow
│   ├── skin-quiz.tsx    # AI Skin Quiz
│   ├── shade-finder     # Color matching quiz
│   ├── blog.tsx         # Beauty blog
│   ├── loyalty.tsx      # Loyalty program dashboard
│   └── ...              # 15+ route files
├── store/
│   ├── cart.ts          # Zustand cart with coupons
│   └── wishlist.ts      # Zustand wishlist
├── styles.css           # Design system (oklch tokens, 18+ utilities)
└── __tests__/           # 23 Vitest tests
```

## Database

52 products seeded across 8 categories:

| Category | Products |
|---|---|
| Lip Color | 8 — lipsticks, glosses, tints |
| Face | 8 — foundation, concealer, blush, powders |
| Eye | 8 — palettes, mascara, liner, brow |
| Skincare | 10 — serums, moisturizers, cleansers, masks |
| Tools & Brushes | 6 — brush sets, sponges, bags |
| Fragrance | 4 — eau de parfum, cologne |
| Bath & Body | 4 — oils, scrubs, lotions |
| Gift Sets | 4 — curated collections |

Full schema with RLS policies, triggers, and seed data in `supabase/seed_full.sql`.

## Deployment

Push to the connected branch to auto-deploy on Vercel. The project uses the Vite preset for SSR.

```bash
git push origin main
```

---

<div align="center">

Built with care for the beauty of code.

</div>
