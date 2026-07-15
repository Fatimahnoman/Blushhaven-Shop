-- ============================================================
-- LUMIERE: Full Schema + 52 Products Seed
-- Run in Supabase SQL Editor on jgczbcxkrfypvatkmsys
-- ============================================================

-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description TEXT,
  ingredients TEXT,
  benefits TEXT,
  how_to_use TEXT,
  price NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  image_url TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  stock INT NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.8,
  review_count INT NOT NULL DEFAULT 0,
  is_bestseller BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_flash_sale BOOLEAN NOT NULL DEFAULT false,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON public.products(is_bestseller) WHERE is_bestseller;
CREATE INDEX IF NOT EXISTS idx_products_new ON public.products(is_new) WHERE is_new;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Wishlists
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.wishlists TO authenticated;
GRANT ALL ON public.wishlists TO service_role;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wishlist all" ON public.wishlists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert own review" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own review" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "delete own review" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_percent INT NOT NULL CHECK (discount_percent BETWEEN 1 AND 90),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active coupons" ON public.coupons FOR SELECT TO anon, authenticated USING (active);
CREATE POLICY "admins manage coupons" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders
CREATE TYPE public.order_status AS ENUM ('pending','processing','shipped','delivered','cancelled');
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  coupon_code TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders read" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own orders insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins read all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own order items read" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS(SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);
CREATE POLICY "own order items insert" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS(SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);
CREATE POLICY "admins read order items" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.newsletter_subscribers TO anon, authenticated;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public read subscribers" ON public.newsletter_subscribers FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- SEED: Categories
-- ============================================================
INSERT INTO public.categories (id, slug, name, description, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'lip-color', 'Lip Color', 'Luxurious lipsticks, glosses, and tints', 1),
  ('a1000000-0000-0000-0000-000000000002', 'face', 'Face', 'Foundation, concealer, blush, powders, and primers', 2),
  ('a1000000-0000-0000-0000-000000000003', 'eye', 'Eye', 'Eyeshadow, mascara, liner, and brow', 3),
  ('a1000000-0000-0000-0000-000000000004', 'skincare', 'Skincare', 'Serums, moisturizers, cleansers, and treatments', 4),
  ('a1000000-0000-0000-0000-000000000005', 'tools', 'Tools & Brushes', 'Professional brushes and beauty tools', 5),
  ('a1000000-0000-0000-0000-000000000006', 'fragrance', 'Fragrance', 'Eau de parfum and body mists', 6),
  ('a1000000-0000-0000-0000-000000000007', 'bath-body', 'Bath & Body', 'Body lotions, oils, and scrubs', 7),
  ('a1000000-0000-0000-0000-000000000008', 'gift-sets', 'Gift Sets', 'Curated luxury gift collections', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: 52 Products
-- ============================================================
INSERT INTO public.products (slug, name, brand, category_id, description, ingredients, benefits, how_to_use, price, compare_at_price, image_url, stock, rating, review_count, is_bestseller, is_new, is_featured, is_flash_sale, is_trending)
VALUES
-- LIP COLOR (8)
('velvet-rouge', 'Velvet Rouge', 'Lumiere', 'a1000000-0000-0000-0000-000000000001',
 'Silk-matte lipstick with intense one-stroke color. Hyaluronic acid for weightless hydration that lasts 12 hours.',
 'Hyaluronic Acid, Jojoba Oil, Vitamin E, Shea Butter', '12-hour wear, hydrating formula, silk-matte finish',
 'Apply directly to lips or use a lip brush for precision.', 42.00, NULL, 'lipstick', 120, 4.9, 2847, true, false, true, false, true),

('nude-illusion', 'Nude Illusion', 'Lumiere', 'a1000000-0000-0000-0000-000000000001',
 'Creamy satin nude lipstick that flatters every skin tone. Buildable from sheer to full coverage.',
 'Squalane, Mango Butter, Vitamin C, Castor Oil', 'Universal nude shade, satin finish, buildable coverage',
 'Apply one coat for a natural tint. Layer for full opacity.', 38.00, 42.00, 'lipstick', 95, 4.8, 1923, true, false, true, false, false),

('crimson-dusk', 'Crimson Dusk', 'Lumiere', 'a1000000-0000-0000-0000-000000000001',
 'Bold crimson liquid lip with velvet matte finish. Smudge-proof and transfer-resistant for 16 hours.',
 'Argan Oil, Vitamin E, Silica Microspheres', '16-hour transfer-proof wear, true matte, fade-resistant',
 'Apply with doe-foot applicator. Allow 30 seconds to set.', 44.00, NULL, 'lipstick', 78, 4.7, 1456, false, true, true, false, true),

('rose-petal-gloss', 'Rose Petal Gloss', 'Lumiere', 'a1000000-0000-0000-0000-000000000001',
 'Non-sticky lip gloss with rose hip oil and soft floral scent. Glass-like reflective finish.',
 'Rose Hip Oil, Vitamin E, Jojoba Oil, Hyaluronic Acid', 'High-shine finish, non-sticky, nourishing',
 'Apply over bare lips or layer over your favorite lipstick.', 32.00, NULL, 'lipstick', 145, 4.8, 2103, false, false, false, false, true),

('berry-blaze', 'Berry Blaze', 'Lumiere', 'a1000000-0000-0000-0000-000000000001',
 'Deep berry tinted lip balm with SPF 15. Sheer wash of color meets lip care.',
 'Berry Extracts, SPF 15, Shea Butter, Beeswax', 'SPF protection, tinted moisture, berry tint',
 'Swipe onto lips as needed throughout the day.', 28.00, NULL, 'lipstick', 200, 4.6, 987, false, false, false, false, false),

('satin-coral', 'Satin Coral', 'Lumiere', 'a1000000-0000-0000-0000-000000000001',
 'Warm coral satin lipstick infused with ceramides for a plump, smooth pout.',
 'Ceramides, Hyaluronic Acid, Mango Butter', 'Plumping effect, ceramide-enriched, satin finish',
 'Apply with a brush for an editorial lip look.', 40.00, NULL, 'lipstick', 67, 4.7, 1340, false, false, true, true, false),

('mauve-haze', 'Mauve Haze', 'Lumiere', 'a1000000-0000-0000-0000-000000000001',
 'Dusty mauve lipstick that captures effortless elegance. Comfortable matte that never dries.',
 'Squalane, Vitamin E, Cocoa Butter', 'Non-drying matte, everyday wearable, creamy',
 'Press and blot for a stain effect or swipe for full color.', 42.00, NULL, 'lipstick', 88, 4.8, 1670, false, false, false, false, true),

('cherry-laquer', 'Cherry Laquer', 'Lumiere', 'a1000000-0000-0000-0000-000000000001',
 'High-shine cherry red lip lacquer with precision tip. Mirror-like gloss in one swipe.',
 'Avocado Oil, Vitamin E, Film-Formers', 'Mirror-shine, precision applicator, 8-hour wear',
 'Use the angled tip to line lips then fill in.', 36.00, NULL, 'lipstick', 110, 4.5, 876, false, true, false, false, false),

-- FACE (8)
('silk-veil-foundation', 'Silk Veil Foundation', 'Lumiere', 'a1000000-0000-0000-0000-000000000002',
 'Weightless serum foundation with buildable medium-to-full coverage. 40-shade range.',
 'Hyaluronic Acid, Niacinamide, Vitamin E', '24-hour hydration, buildable, non-oxidizing',
 'Apply with fingers, sponge, or brush. Blend outward from center.', 54.00, NULL, 'foundation', 85, 4.9, 3201, true, false, true, false, true),

('cloud-concealer', 'Cloud Concealer', 'Lumiere', 'a1000000-0000-0000-0000-000000000002',
 'Ultra-creamy concealer that covers dark circles, blemishes, and redness without creasing.',
 'Peptides, Caffeine, Arnica, Hyaluronic Acid', 'Covers dark circles, brightens, crease-proof',
 'Dab under eyes and on imperfections. Blend with fingertip.', 36.00, NULL, 'foundation', 130, 4.8, 2456, false, false, true, false, true),

('petal-glow-blush', 'Petal Glow Blush', 'Lumiere', 'a1000000-0000-0000-0000-000000000002',
 'Baked powder blush with micro-shimmer for a lit-from-within glow.',
 'Jojoba Oil, Vitamin E, Rose Extract', 'Natural flush, micro-shimmer, long-lasting',
 'Apply to apples of cheeks. Blend upward toward temples.', 38.00, NULL, 'foundation', 105, 4.7, 1890, false, false, false, false, true),

('velvet-powder', 'Velvet Setting Powder', 'Lumiere', 'a1000000-0000-0000-0000-000000000002',
 'Micro-fine translucent powder that blurs pores and locks makeup for 16 hours. No flashback.',
 'Silica, Rice Starch, Diamond Powder', 'Pore-blurring, flashback-free, 16-hour setting',
 'Press into T-zone with a puff or dust with a brush.', 46.00, NULL, 'foundation', 92, 4.8, 1567, false, true, false, false, false),

('luminous-highlighter', 'Luminous Highlighter', 'Lumiere', 'a1000000-0000-0000-0000-000000000002',
 'Champagne-gold pressed highlighter with buttery texture. Wet-look glow without glitter.',
 'Mica, Jojoba Oil, Vitamin E', 'Wet-look glow, finely milled, no chunky glitter',
 'Apply to cheekbones, nose bridge, cupid bow.', 40.00, NULL, 'foundation', 115, 4.6, 1234, false, false, false, true, true),

('soft-sculpt-bronzer', 'Soft Sculpt Bronzer', 'Lumiere', 'a1000000-0000-0000-0000-000000000002',
 'Matte bronzing powder for natural warmth and dimension. Never looks muddy.',
 'Coconut Oil, Vitamin E, Arrowroot', 'Natural warmth, buildable, never patchy',
 'Sweep in a 3-shape along temples, cheeks, jawline.', 42.00, NULL, 'foundation', 78, 4.7, 1456, false, false, false, false, false),

('color-correct-primer', 'Color Correct Primer', 'Lumiere', 'a1000000-0000-0000-0000-000000000002',
 'Green-tinted primer that neutralizes redness and creates a smooth canvas.',
 'Aloe Vera, Green Tea, Hyaluronic Acid, Niacinamide', 'Neutralizes redness, pore-minimizing, hydrating',
 'Apply a thin layer after moisturizer, before foundation.', 38.00, NULL, 'foundation', 88, 4.5, 945, false, false, false, false, false),

('dewy-setting-spray', 'Dewy Setting Spray', 'Lumiere', 'a1000000-0000-0000-0000-000000000002',
 'Fine mist that melts makeup into skin with dewy finish for 16 hours.',
 'Hyaluronic Acid, Aloe Vera, Cucumber Extract', '16-hour hold, dewy finish, makeup melting',
 'Hold 8 inches from face, mist in X and T pattern.', 34.00, NULL, 'foundation', 155, 4.8, 2100, false, false, false, true, true),

-- EYE (8)
('twilight-palette', 'Twilight Palette', 'Lumiere', 'a1000000-0000-0000-0000-000000000003',
 '12-shade eyeshadow palette with warm neutrals, coppers, and plums. Foiled metallics included.',
 'Coconut Oil, Vitamin E, Mica', '12 versatile shades, butter-smooth, high pigment',
 'Apply with fluffy brush for mattes, flat brush for metallics.', 68.00, 78.00, 'eyeshadow', 60, 4.9, 2890, true, false, true, false, true),

('noir-volume-mascara', 'Noir Volume Mascara', 'Lumiere', 'a1000000-0000-0000-0000-000000000003',
 'Ultra-black volumizing mascara with curved fiber brush. Dramatic volume, no clumping.',
 'Biotin, Castor Oil, Rice Bran Wax', 'Dramatic volume, clump-free, smudge-proof',
 'Wiggle wand from root to tip. Apply 2-3 coats.', 34.00, NULL, 'mascara', 140, 4.7, 2345, true, false, false, false, true),

('liquid-liner-ink', 'Liquid Liner Ink', 'Lumiere', 'a1000000-0000-0000-0000-000000000003',
 'Jet-black liquid liner with felt tip for precise wings. Waterproof, 18-hour wear.',
 'Film-Forming Polymers, Carbon Black, Vitamin E', '18-hour, waterproof, precision tip',
 'Start from inner corner, draw close to lash line, flick up.', 28.00, NULL, 'mascara', 165, 4.6, 1876, false, false, false, false, true),

('shimmer-shadow-stick', 'Shimmer Shadow Stick', 'Lumiere', 'a1000000-0000-0000-0000-000000000003',
 'Cream-to-powder eyeshadow stick with buildable shimmer. No primer needed.',
 'Coconut Oil, Mica, Vitamin E', 'No primer, cream-to-powder, 12-hour wear',
 'Swipe across lids and blend with fingertip.', 30.00, NULL, 'eyeshadow', 110, 4.5, 1230, false, true, false, false, false),

('brow-arch-pomade', 'Brow Arch Pomade', 'Lumiere', 'a1000000-0000-0000-0000-000000000003',
 'Waterproof brow pomade that sculpts, defines, and fills. 18-hour wear.',
 'Castor Oil, Vitamin E, Beeswax', 'Waterproof, sculpting, natural strokes',
 'Use angled brush with short upward strokes.', 26.00, NULL, 'mascara', 90, 4.7, 1560, false, false, false, false, false),

('smoky-quad', 'Smoky Quad', 'Lumiere', 'a1000000-0000-0000-0000-000000000003',
 'Four-shade smoky eye palette for evening glamour. Includes mirror and dual-ended brush.',
 'Jojoba Oil, Mica, Silica', 'Compact quad, buildable smoky eye, includes brush',
 'Apply darkest at outer corner, blend inward.', 48.00, NULL, 'eyeshadow', 75, 4.8, 1120, false, true, true, false, false),

('length-mascara', 'Length Mascara', 'Lumiere', 'a1000000-0000-0000-0000-000000000003',
 'Tubing mascara that wraps each lash for dramatic length. Easy warm-water removal.',
 'Polymer Coatings, Biotin, Panthenol', 'Tubing formula, easy removal, dramatic length',
 'Apply to clean lashes. Remove with warm water.', 32.00, NULL, 'mascara', 100, 4.6, 1450, false, false, false, false, false),

('nude-eyeshadow-set', 'Nude Eyeshadow Set', 'Lumiere', 'a1000000-0000-0000-0000-000000000003',
 'Six neutral matte eyeshadows for everyday elegance. Ultra-fine mill.',
 'Talc, Mica, Vitamin E', 'Six neutral mattes, ultra-fine, travel-friendly',
 'Use fluffy brush to wash over lids or build depth.', 44.00, NULL, 'eyeshadow', 82, 4.7, 980, false, false, false, true, true),

-- SKINCARE (10)
('radiance-glow-serum', 'Radiance Glow Serum', 'Lumiere', 'a1000000-0000-0000-0000-000000000004',
 'Vitamin C + E serum that brightens, firms, and protects. Visible results in 2 weeks.',
 '15% Vitamin C, Vitamin E, Ferulic Acid, Hyaluronic Acid', 'Brightens, boosts collagen, antioxidant',
 'Apply 3-4 drops to clean skin in morning. Follow with SPF.', 78.00, NULL, 'serum', 70, 4.9, 3450, true, false, true, false, true),

('midnight-repair-cream', 'Midnight Repair Cream', 'Lumiere', 'a1000000-0000-0000-0000-000000000004',
 'Rich night cream with retinol and peptides. Wake up to plumper, smoother skin.',
 'Retinol, Peptides, Squalane, Ceramides', 'Anti-aging, overnight repair, peptide-boosted',
 'Apply thin layer to face and neck at night.', 82.00, NULL, 'moisturizer', 55, 4.8, 2780, true, false, false, false, true),

('hydra-bounce-moisturizer', 'Hydra Bounce Moisturizer', 'Lumiere', 'a1000000-0000-0000-0000-000000000004',
 'Lightweight gel-cream that delivers 72-hour hydration. Perfect under makeup.',
 'Hyaluronic Acid, Aloe Vera, Niacinamide', '72-hour hydration, lightweight, makeup-friendly',
 'Apply to damp skin after serum. Morning and night.', 52.00, NULL, 'moisturizer', 125, 4.8, 2100, false, false, true, false, true),

('cloud-cleanser', 'Cloud Cleanser', 'Lumiere', 'a1000000-0000-0000-0000-000000000004',
 'Gentle foam cleanser that removes makeup without stripping. pH-balanced.',
 'Glycerin, Chamomile, Centella Asiatica', 'Gentle cleansing, pH-balanced, soothing',
 'Apply to wet skin, massage, rinse thoroughly.', 36.00, NULL, 'serum', 160, 4.7, 1890, false, false, false, false, false),

('golden-hour-spf', 'Golden Hour SPF 50', 'Lumiere', 'a1000000-0000-0000-0000-000000000004',
 'Lightweight invisible sunscreen, no white cast. Broad-spectrum SPF 50 with skincare benefits.',
 'Zinc Oxide, Niacinamide, Hyaluronic Acid, Vitamin E', 'SPF 50, no white cast, skincare-infused',
 'Apply as last skincare step, 15 min before sun.', 42.00, NULL, 'serum', 140, 4.9, 2560, true, true, true, false, true),

('petal-exfoliant', 'Petal Exfoliant', 'Lumiere', 'a1000000-0000-0000-0000-000000000004',
 'AHA/BHA liquid exfoliant that unclogs pores and brightens. Gentle enough for daily use.',
 'Glycolic Acid, Salicylic Acid, Green Tea, Centella', 'Unclogs pores, brightens, gentle',
 'Apply with cotton pad after cleansing at night.', 46.00, NULL, 'serum', 95, 4.6, 1340, false, false, false, false, false),

('retinol-booster', 'Retinol Booster', 'Lumiere', 'a1000000-0000-0000-0000-000000000004',
 'Encapsulated retinol that reduces fine lines, acne, and hyperpigmentation. Sensitive-skin friendly.',
 'Encapsulated Retinol, Bakuchiol, Squalane, Vitamin E', 'Anti-aging, acne-fighting, gentle',
 'Apply 2-3 drops at night. Start 2-3x/week.', 72.00, NULL, 'serum', 60, 4.8, 2200, false, true, false, false, true),

('botanical-eye-cream', 'Botanical Eye Cream', 'Lumiere', 'a1000000-0000-0000-0000-000000000004',
 'Cooling eye cream with caffeine and peptides. Depuffs, smooths fine lines.',
 'Caffeine, Peptides, Vitamin K, Cucumber Extract', 'Depuffs, smooths fine lines, cooling',
 'Dot rice grain-sized amount around orbital bone.', 58.00, NULL, 'serum', 80, 4.7, 1670, false, false, false, false, false),

('brightening-toner', 'Brightening Toner', 'Lumiere', 'a1000000-0000-0000-0000-000000000004',
 'Fermented rice water toner that hydrates, brightens, and preps skin.',
 'Fermented Rice Water, Niacinamide, Hyaluronic Acid', 'Brightens, preps skin, hydrating',
 'Pat into skin after cleansing or mist all day.', 38.00, NULL, 'serum', 135, 4.6, 1120, false, false, false, true, false),

('clay-detox-mask', 'Clay Detox Mask', 'Lumiere', 'a1000000-0000-0000-0000-000000000004',
 'Kaolin clay mask that draws out impurities. Tea tree for blemish-prone skin.',
 'Kaolin Clay, Tea Tree, Charcoal, Aloe Vera', 'Deep cleansing, oil control, blemish-fighting',
 'Apply thin layer, leave 10 min, rinse.', 40.00, NULL, 'moisturizer', 75, 4.5, 890, false, false, false, false, false),

-- TOOLS (6)
('pro-brush-set', 'Pro Brush Set', 'Lumiere', 'a1000000-0000-0000-0000-000000000005',
 '12-piece professional brush set with synthetic bristles and rose gold ferrules in luxury travel case.',
 'Synthetic Taklon, Rose Gold Ferrules', '12 essential brushes, cruelty-free, professional',
 'Use each brush for its intended purpose.', 128.00, 158.00, 'brushes', 45, 4.9, 2340, true, false, true, false, true),

('kabuki-brush', 'Kabuki Brush', 'Lumiere', 'a1000000-0000-0000-0000-000000000005',
 'Dense dome kabuki for flawless powder, bronzer, and blush application.',
 'Synthetic Fibers, Bamboo Handle', 'Dense dome, ultra-soft, multi-purpose',
 'Swirl into product, tap off, buff in circles.', 34.00, NULL, 'brushes', 90, 4.7, 1230, false, false, false, false, false),

('beauty-blender', 'Luxury Blender', 'Lumiere', 'a1000000-0000-0000-0000-000000000005',
 'Ultra-bouncy makeup sponge for seamless foundation and concealer application.',
 'Non-latex Foam', 'Flawless blending, dual-ended, latex-free',
 'Dampen before use. Bounce and press — never drag.', 22.00, NULL, 'brushes', 200, 4.6, 3100, false, false, false, false, true),

('blending-brush', 'Blending Brush', 'Lumiere', 'a1000000-0000-0000-0000-000000000005',
 'Tapered blending brush for seamless eyeshadow transitions.',
 'Goat Hair, Rose Gold Ferrule', 'Seamless blending, tapered, essential',
 'Windshield-wiper motions in the crease.', 18.00, NULL, 'brushes', 180, 4.8, 1890, false, false, false, false, false),

('contour-brush', 'Contour Sculpt Brush', 'Lumiere', 'a1000000-0000-0000-0000-000000000005',
 'Angled flat brush for precise contour and highlight placement.',
 'Synthetic Taklon, Ergonomic Handle', 'Precision contouring, angled, firm-flexible',
 'Load flat side, press and blend along cheekbones.', 28.00, NULL, 'brushes', 70, 4.7, 980, false, false, false, false, false),

('velvet-makeup-bag', 'Velvet Makeup Bag', 'Lumiere', 'a1000000-0000-0000-0000-000000000005',
 'Luxurious velvet travel pouch with waterproof lining.',
 'Velvet, Waterproof Lining, Gold Zipper', 'Spacious, waterproof, travel-friendly',
 'Store brushes, compacts, or skincare minis.', 48.00, NULL, 'brushes', 65, 4.5, 670, false, true, false, false, false),

-- FRAGRANCE (4)
('lumiere-noir', 'Lumiere Noir', 'Lumiere', 'a1000000-0000-0000-0000-000000000006',
 'Dark floral eau de parfum with black orchid, amber, and sandalwood. 12+ hour sillage.',
 'Black Orchid, Amber, Sandalwood, Musk', '12+ hour sillage, dark floral, unisex',
 'Spray on pulse points: wrists, neck, behind ears.', 120.00, NULL, 'serum', 40, 4.9, 1560, true, false, true, false, true),

('rose-dawn', 'Rose Dawn', 'Lumiere', 'a1000000-0000-0000-0000-000000000006',
 'Delicate rose and peony eau de toilette for daytime freshness.',
 'Damask Rose, Peony, White Musk, Bergamot', 'Light daytime, romantic floral, 6-hour',
 'Mist over body. Reapply as desired.', 88.00, NULL, 'serum', 55, 4.7, 1120, false, true, false, false, false),

('amber-vanilla-elixir', 'Amber Vanilla Elixir', 'Lumiere', 'a1000000-0000-0000-0000-000000000006',
 'Warm oriental fragrance with Madagascar vanilla, tonka bean, golden amber.',
 'Madagascar Vanilla, Tonka Bean, Amber, Benzoin', 'Warm oriental, cozy, 10-hour',
 'Apply to warm pulse points.', 96.00, NULL, 'serum', 45, 4.8, 890, false, false, false, false, true),

('fig-blossom-cologne', 'Fig Blossom Cologne', 'Lumiere', 'a1000000-0000-0000-0000-000000000006',
 'Fresh green fig and white blossom. Mediterranean escape in every spray.',
 'Fig Leaf, White Blossom, Cedar, Musk', 'Fresh green, Mediterranean, 4-hour',
 'Spritz on skin and clothes.', 72.00, NULL, 'serum', 65, 4.6, 760, false, false, false, true, false),

-- BATH & BODY (4)
('silk-body-oil', 'Silk Body Oil', 'Lumiere', 'a1000000-0000-0000-0000-000000000007',
 'Luxurious dry body oil with argan and sweet almond. Silky, shimmering skin.',
 'Argan Oil, Sweet Almond, Vitamin E, Gold Mica', 'Silky-smooth, instant absorption, shimmer',
 'Apply to damp skin after shower.', 56.00, NULL, 'moisturizer', 80, 4.8, 1890, false, false, true, false, true),

('rose-sugar-scrub', 'Rose Sugar Scrub', 'Lumiere', 'a1000000-0000-0000-0000-000000000007',
 'Coarse sugar scrub with rose oil and coconut. Exfoliates and moisturizes.',
 'Brown Sugar, Coconut Oil, Rose Oil, Vitamin E', 'Deep exfoliation, moisturizing, rose-scented',
 'Massage onto wet skin. Rinse thoroughly.', 42.00, NULL, 'moisturizer', 100, 4.7, 1450, false, false, false, false, false),

('velvet-body-lotion', 'Velvet Body Lotion', 'Lumiere', 'a1000000-0000-0000-0000-000000000007',
 'Fast-absorbing lotion with shea butter and vitamin E. Velvety soft.',
 'Shea Butter, Vitamin E, Glycerin, Jasmine', 'Deep moisture, fast-absorbing, light fragrance',
 'Apply generously after shower or bath.', 38.00, NULL, 'moisturizer', 150, 4.6, 1120, false, false, false, false, false),

('honey-bath-milk', 'Honey Bath Milk', 'Lumiere', 'a1000000-0000-0000-0000-000000000007',
 'Luxurious bath milk with honey and oat milk. Silky soak that softens.',
 'Honey Extract, Oat Milk, Coconut Oil, Chamomile', 'Softening soak, soothing, silky',
 'Pour 2-3 capfuls under warm water. Soak 15-20 min.', 36.00, NULL, 'moisturizer', 90, 4.5, 780, false, true, false, false, false),

-- GIFT SETS (4)
('bridal-glow-set', 'Bridal Glow Set', 'Lumiere', 'a1000000-0000-0000-0000-000000000008',
 'Complete bridal beauty ritual in a keepsake box: serum, moisturizer, lipstick, setting spray.',
 'See individual products', 'Full bridal routine, keepsake box, travel-ready',
 'Follow numbered steps for your wedding day.', 198.00, 260.00, 'serum', 30, 4.9, 560, true, true, true, false, true),

('skincare-essentials', 'Skincare Essentials', 'Lumiere', 'a1000000-0000-0000-0000-000000000008',
 'Four-step routine: cleanser, toner, serum, moisturizer in elegant minis.',
 'See individual products', 'Complete routine, travel-friendly, perfect gift',
 'Use in order morning and night.', 128.00, 160.00, 'moisturizer', 50, 4.8, 890, false, false, true, false, false),

('lip-collection', 'Lip Collection', 'Lumiere', 'a1000000-0000-0000-0000-000000000008',
 'Three bestselling lip products in a velvet pouch.',
 'See individual products', 'Three iconic looks, luxury pouch, gift-ready',
 'Start with lipstick base, then gloss on center.', 88.00, 112.00, 'lipstick', 65, 4.7, 1230, false, false, false, false, true),

('glam-edit', 'Glam Edit', 'Lumiere', 'a1000000-0000-0000-0000-000000000008',
 'Party-ready set: palette, mascara, liner, and highlighter in a clutch.',
 'See individual products', 'Complete eye + glow look, party clutch, full-size',
 'Smoky eye with palette, define with liner and mascara.', 168.00, 210.00, 'eyeshadow', 35, 4.8, 670, false, true, false, false, false)

ON CONFLICT (slug) DO NOTHING;

-- Verify
SELECT COUNT(*) as total_products FROM public.products;
SELECT COUNT(*) as total_categories FROM public.categories;
