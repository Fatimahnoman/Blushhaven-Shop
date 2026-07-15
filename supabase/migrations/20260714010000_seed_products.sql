-- ============================================================
-- SEED: 52 unique products for Lumiere
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================

-- First, add new categories if they don't exist
INSERT INTO public.categories (id, slug, name, description, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'lip-color', 'Lip Color', 'Luxurious lipsticks, glosses, and tints', 100),
  ('a1000000-0000-0000-0000-000000000002', 'face-base', 'Face Base', 'Foundation, concealer, and powders', 101),
  ('a1000000-0000-0000-0000-000000000003', 'eye-makeup', 'Eye Makeup', 'Eyeshadow, mascara, liner, and brow', 102),
  ('a1000000-0000-0000-0000-000000000005', 'tools-brushes', 'Tools & Brushes', 'Professional brushes and beauty tools', 103),
  ('a1000000-0000-0000-0000-000000000006', 'fragrance', 'Fragrance', 'Eau de parfum and body mists', 104),
  ('a1000000-0000-0000-0000-000000000007', 'bath-body', 'Bath & Body', 'Body lotions, oils, and scrubs', 105),
  ('a1000000-0000-0000-0000-000000000008', 'gift-sets', 'Gift Sets', 'Curated luxury gift collections', 106)
ON CONFLICT (slug) DO NOTHING;

-- Map existing categories for convenience
-- lipstick=8638a135, lip-gloss=95422b40, foundation=50197bb5, concealer=d6331f74
-- mascara=4fde1f9a, eyeliner=47a91349, eyeshadow=20c9e9e2, primer=9bbcdc9c
-- blush=55073599, bronzer=e7828f69, highlighter=6df3732f, setting-spray=30a82bd4
-- brushes=c603be7f, beauty-tools=383d34f5, skincare=618ba08e, serums=15873684
-- moisturizers=5017bd71, face-wash=83446dfd, sunscreen=d8bbbb9c

-- ============================================================
-- NEW LIP PRODUCTS (using existing lipstick + lip-gloss categories)
-- ============================================================
INSERT INTO public.products (slug, name, brand, category_id, description, ingredients, benefits, how_to_use, price, compare_at_price, image_url, stock, rating, review_count, is_bestseller, is_new, is_featured, is_flash_sale, is_trending)
VALUES
-- Existing lipstick category
('nude-illusion-lipstick', 'Nude Illusion', 'Lumiere', '8638a135-72d0-4726-9fb9-31e63dcc5050',
 'Creamy satin nude lipstick that flatters every skin tone. Buildable from sheer to full coverage.',
 'Squalane, Mango Butter, Vitamin C, Castor Oil', 'Universal nude shade, satin finish, buildable coverage',
 'Apply one coat for a natural tint. Layer for full opacity.', 38.00, 42.00, 'lipstick', 95, 4.8, 1923, true, false, true, false, false),

('crimson-dusk-liquid', 'Crimson Dusk Liquid Lip', 'Lumiere', '8638a135-72d0-4726-9fb9-31e63dcc5050',
 'Bold crimson liquid lip with a velvet matte finish. Smudge-proof and transfer-resistant for 16 hours.',
 'Argan Oil, Vitamin E, Silica Microspheres', '16-hour transfer-proof wear, true matte, fade-resistant',
 'Apply with the doe-foot applicator. Allow 30 seconds to set.', 44.00, NULL, 'lipstick', 78, 4.7, 1456, false, true, true, false, true),

('berry-blaze-balm', 'Berry Blaze Tinted Balm', 'Lumiere', '8638a135-72d0-4726-9fb9-31e63dcc5050',
 'Deep berry tinted lip balm with SPF 15. Sheer wash of color meets lip care in one elegant twist-up.',
 'Berry Extracts, SPF 15, Shea Butter, Beeswax', 'SPF protection, tinted moisture, berry-inspired tint',
 'Swipe onto lips as needed throughout the day.', 28.00, NULL, 'lipstick', 200, 4.6, 987, false, false, false, false, false),

('satin-coral-creme', 'Satin Coral Cr\u00e8me', 'Lumiere', '8638a135-72d0-4726-9fb9-31e63dcc5050',
 'Warm coral satin lipstick infused with ceramides for a plump, smooth pout with luminous finish.',
 'Ceramides, Hyaluronic Acid, Mango Butter', 'Plumping effect, ceramide-enriched, satin luminous finish',
 'Apply with a brush for an editorial lip look.', 40.00, NULL, 'lipstick', 67, 4.7, 1340, false, false, true, true, false),

('mauve-haze-matte', 'Mauve Haze Matte', 'Lumiere', '8638a135-72d0-4726-9fb9-31e63dcc5050',
 'Dusty mauve lipstick that captures effortless elegance. Comfortable matte that never dries.',
 'Squalane, Vitamin E, Cocoa Butter', 'Non-drying matte, everyday wearable, creamy application',
 'Press and blot for a stain effect or swipe for full color.', 42.00, NULL, 'lipstick', 88, 4.8, 1670, false, false, false, false, true),

('cherry-laquer-lip', 'Cherry Laquer Lip Gloss', 'Lumiere', '95422b40-e879-4c38-85e3-51d29cab583b',
 'High-shine cherry red lip lacquer with precision tip applicator. Mirror-like gloss in one swipe.',
 'Avocado Oil, Vitamin E, Polymer Film-Formers', 'Mirror-shine finish, precision applicator, 8-hour wear',
 'Use the angled tip to line lips then fill in.', 36.00, NULL, 'lipstick', 110, 4.5, 876, false, true, false, false, false),

('rose-petal-shine', 'Rose Petal Lip Shine', 'Lumiere', '95422b40-e879-4c38-85e3-51d29cab583b',
 'Non-sticky lip gloss with rose hip oil and soft floral scent. Glass-like reflective finish.',
 'Rose Hip Oil, Vitamin E, Jojoba Oil', 'High-shine finish, non-sticky, nourishing formula',
 'Apply over bare lips or layer over your favorite lipstick.', 32.00, NULL, 'lipstick', 145, 4.8, 2103, false, false, false, false, true),

('nude-glass-gloss', 'Nude Glass Gloss', 'Lumiere', '95422b40-e879-4c38-85e3-51d29cab583b',
 'Sheer nude gloss with micro-shimmer for a glass lip effect. Plumping peptides for a fuller pout.',
 'Peptides, Hyaluronic Acid, Jojoba Oil', 'Plumping peptides, glass effect, micro-shimmer',
 'Apply to center of lips for a fuller look.', 30.00, NULL, 'lipstick', 120, 4.7, 1450, false, true, false, false, false),

-- ============================================================
-- FACE PRODUCTS (using existing categories)
-- ============================================================
('cloud-concealer-fluid', 'Cloud Concealer Fluid', 'Lumiere', 'd6331f74-60c8-4fbe-bc5c-8a3af1098fc5',
 'Ultra-creamy concealer that covers dark circles, blemishes, and redness without creasing.',
 'Peptides, Caffeine, Arnica, Hyaluronic Acid', 'Covers dark circles, brightens under-eye, crease-proof',
 'Dab under eyes and on imperfections. Blend with fingertip or sponge.', 36.00, NULL, 'foundation', 130, 4.8, 2456, false, false, true, false, true),

('petal-glow-blush-powder', 'Petal Glow Blush', 'Lumiere', '55073599-eb95-4957-8b6c-ee12c0e24037',
 'Baked powder blush with micro-shimmer for a lit-from-within glow. Silky blendable formula.',
 'Jojoba Oil, Vitamin E, Rose Extract', 'Natural flush, micro-shimmer glow, long-lasting color',
 'Smile and apply to the apples of cheeks. Blend upward toward temples.', 38.00, NULL, 'foundation', 105, 4.7, 1890, false, false, false, false, true),

('velvet-setting-powder', 'Velvet Setting Powder', 'Lumiere', '9bbcdc9c-e885-427c-81c9-f85b79c6dad1',
 'Micro-fine translucent setting powder that blurs pores and locks makeup for 16 hours.',
 'Silica, Rice Starch, Diamond Powder', 'Pore-blurring, flashback-free, 16-hour setting',
 'Press into T-zone with a puff or dust lightly with a brush.', 46.00, NULL, 'foundation', 92, 4.8, 1567, false, true, false, false, false),

('champagne-highlighter', 'Champagne Highlighter', 'Lumiere', '6df3732f-3d07-4097-aca6-419b3ff1a210',
 'Champagne-gold pressed highlighter with buttery texture. Wet-look glow without glitter.',
 'Mica, Jojoba Oil, Vitamin E', 'Wet-look glow, finely milled, no chunky glitter',
 'Apply to cheekbones, nose bridge, cupid bow.', 40.00, NULL, 'foundation', 115, 4.6, 1234, false, false, false, true, true),

('soft-sculpt-matte-bronzer', 'Soft Sculpt Bronzer', 'Lumiere', 'e7828f69-9edd-47b3-a649-e39840301c17',
 'Matte bronzing powder for natural warmth and dimension. Buildable formula that never looks muddy.',
 'Coconut Oil, Vitamin E, Arrowroot', 'Natural warmth, buildable, never patchy',
 'Sweep in a 3-shape along temples, cheeks, and jawline.', 42.00, NULL, 'foundation', 78, 4.7, 1456, false, false, false, false, false),

('green-correct-primer', 'Green Correct Primer', 'Lumiere', '9bbcdc9c-e885-427c-81c9-f85b79c6dad1',
 'Green-tinted primer that neutralizes redness and creates a smooth canvas for makeup.',
 'Aloe Vera, Green Tea, Hyaluronic Acid, Niacinamide', 'Neutralizes redness, pore-minimizing, hydrating base',
 'Apply a thin layer after moisturizer and before foundation.', 38.00, NULL, 'foundation', 88, 4.5, 945, false, false, false, false, false),

('dewy-mist-setting-spray', 'Dewy Mist Setting Spray', 'Lumiere', '30a82bd4-b8f9-4934-aab7-f8b4e954a198',
 'Fine mist setting spray that melts makeup into skin and adds dewy finish for 16 hours.',
 'Hyaluronic Acid, Aloe Vera, Cucumber Extract', '16-hour hold, dewy finish, makeup melting',
 'Hold 8 inches from face and mist in X and T pattern.', 34.00, NULL, 'foundation', 155, 4.8, 2100, false, false, false, true, true),

-- ============================================================
-- EYE PRODUCTS
-- ============================================================
('midnight-smoky-palette', 'Midnight Smoky Palette', 'Lumiere', '20c9e9e2-b119-40c4-901c-7a012cfea920',
 '12-shade smoky eyeshadow palette with deep plums, charcoals, and golds. Foiled metallics included.',
 'Coconut Oil, Vitamin E, Mica', '12 smoky shades, butter-smooth blend, high pigment',
 'Apply darkest shade at outer corner, blend inward with lighter shades.', 68.00, 78.00, 'eyeshadow', 60, 4.9, 2890, true, false, true, false, true),

('noir-volume-lash', 'Noir Volume Mascara', 'Lumiere', '4fde1f9a-be3f-440a-b5fc-67224a690392',
 'Ultra-black volumizing mascara with curved fiber brush. Dramatic volume without clumping.',
 'Biotin, Castor Oil, Rice Bran Wax', 'Dramatic volume, fiber brush, clump-free, smudge-proof',
 'Wiggle wand from root to tip. Apply 2-3 coats for full drama.', 34.00, NULL, 'mascara', 140, 4.7, 2345, true, false, false, false, true),

('ink-precise-liner', 'Ink Precision Liner', 'Lumiere', '47a91349-2946-43e5-ada5-5147c32b3866',
 'Jet-black liquid liner with felt tip for precise wings. Waterproof, 18-hour stay-put formula.',
 'Film-Forming Polymers, Carbon Black, Vitamin E', '18-hour wear, waterproof, precision felt tip',
 'Start from inner corner, draw close to lash line, flick upward at outer corner.', 28.00, NULL, 'mascara', 165, 4.6, 1876, false, false, false, false, true),

('shimmer-shadow-stick-gold', 'Shimmer Shadow Stick', 'Lumiere', '20c9e9e2-b119-40c4-901c-7a012cfea920',
 'Cream-to-powder eyeshadow stick with buildable shimmer. No primer needed — just swipe and go.',
 'Coconut Oil, Mica, Vitamin E', 'No primer needed, cream-to-powder, 12-hour wear',
 'Swipe across lids and blend with fingertip. Layer for intensity.', 30.00, NULL, 'eyeshadow', 110, 4.5, 1230, false, true, false, false, false),

('brow-arch-pomade-dark', 'Brow Arch Pomade', 'Lumiere', '20c9e9e2-b119-40c4-901c-7a012cfea920',
 'Waterproof brow pomade that sculpts, defines, and fills. 18-hour wear that resists sweat.',
 'Castor Oil, Vitamin E, Beeswax', 'Waterproof, sculpting, natural hair-like strokes',
 'Use an angled brush to define brows with short upward strokes.', 26.00, NULL, 'mascara', 90, 4.7, 1560, false, false, false, false, false),

('everyday-nude-quad', 'Everyday Nude Quad', 'Lumiere', '20c9e9e2-b119-40c4-901c-7a012cfea920',
 'Four-shade nude eyeshadow quad for effortless everyday looks. Includes mirror and dual-ended brush.',
 'Jojoba Oil, Mica, Silica', 'Compact quad, everyday neutrals, includes brush',
 'Apply all-over wash or build depth in crease.', 48.00, NULL, 'eyeshadow', 75, 4.8, 1120, false, true, true, false, false),

('tubing-length-mascara', 'Tubing Length Mascara', 'Lumiere', '4fde1f9a-be3f-440a-b5fc-67224a690392',
 'Tubing mascara that wraps each lash for dramatic length and easy warm-water removal.',
 'Polymer Coatings, Biotin, Panthenol', 'Tubing formula, easy removal, dramatic length',
 'Apply to clean lashes. Remove with warm water — no remover needed.', 32.00, NULL, 'mascara', 100, 4.6, 1450, false, false, false, false, false),

('neutral-matte-six', 'Neutral Matte Six', 'Lumiere', '20c9e9e2-b119-40c4-901c-7a012cfea920',
 'Six neutral matte eyeshadows for everyday elegance. Ultra-fine mill for seamless blending.',
 'Talc, Mica, Vitamin E', 'Six neutral mattes, ultra-fine mill, travel-friendly',
 'Use a fluffy brush to wash color over lids or build depth.', 44.00, NULL, 'eyeshadow', 82, 4.7, 980, false, false, false, true, true),

-- ============================================================
-- SKINCARE
-- ============================================================
('radiance-vitamin-c-serum', 'Radiance Vitamin C Serum', 'Lumiere', '15873684-043f-4bcb-bfb9-79f952bbe7aa',
 'Vitamin C + E serum that brightens, firms, and protects. Visible results in 2 weeks.',
 '15% Vitamin C, Vitamin E, Ferulic Acid, Hyaluronic Acid', 'Brightens skin, boosts collagen, antioxidant protection',
 'Apply 3-4 drops to clean skin in the morning. Follow with SPF.', 78.00, NULL, 'serum', 70, 4.9, 3450, true, false, true, false, true),

('midnight-peptide-repair', 'Midnight Peptide Repair', 'Lumiere', '5017bd71-36d8-48bb-a816-575fa84bc0fc',
 'Rich night cream with retinol and peptides that works while you sleep.',
 'Retinol, Peptides, Squalane, Ceramides', 'Anti-aging, overnight repair, peptide-boosted',
 'Apply a thin layer to face and neck after cleansing at night.', 82.00, NULL, 'moisturizer', 55, 4.8, 2780, true, false, false, false, true),

('hydra-bounce-gel-cream', 'Hydra Bounce Gel Cream', 'Lumiere', '5017bd71-36d8-48bb-a816-575fa84bc0fc',
 'Lightweight gel-cream that delivers 72-hour hydration without heaviness. Perfect under makeup.',
 'Hyaluronic Acid, Aloe Vera, Niacinamide', '72-hour hydration, lightweight gel-cream, makeup-friendly',
 'Apply to damp skin after serum. Use morning and night.', 52.00, NULL, 'moisturizer', 125, 4.8, 2100, false, false, true, false, true),

('cloud-foam-cleanser', 'Cloud Foam Cleanser', 'Lumiere', '83446dfd-c1e4-4451-af47-69eded210bdd',
 'Gentle foam cleanser that removes makeup and impurities without stripping. pH-balanced.',
 'Glycerin, Chamomile, Centella Asiatica', 'Gentle cleansing, pH-balanced, soothing formula',
 'Apply to wet skin, massage in circular motions, rinse thoroughly.', 36.00, NULL, 'serum', 160, 4.7, 1890, false, false, false, false, false),

('golden-hour-spf50', 'Golden Hour SPF 50', 'Lumiere', 'd8bbbb9c-a7a4-4002-a0ed-9bb801314afc',
 'Lightweight invisible sunscreen with no white cast. Broad-spectrum SPF 50 with skincare benefits.',
 'Zinc Oxide, Niacinamide, Hyaluronic Acid, Vitamin E', 'SPF 50 protection, no white cast, skincare-infused',
 'Apply as last step of skincare, 15 minutes before sun exposure.', 42.00, NULL, 'serum', 140, 4.9, 2560, true, true, true, false, true),

('aha-bha-exfoliant', 'AHA+BHA Exfoliant', 'Lumiere', '15873684-043f-4bcb-bfb9-79f952bbe7aa',
 'Liquid exfoliant that unclogs pores and brightens dull skin. Gentle enough for daily use.',
 'Glycolic Acid, Salicylic Acid, Green Tea, Centella', 'Unclogs pores, brightens dull skin, gentle formula',
 'Apply with cotton pad after cleansing, before moisturizer. Use at night.', 46.00, NULL, 'serum', 95, 4.6, 1340, false, false, false, false, false),

('retinol-night-booster', 'Retinol Night Booster', 'Lumiere', '15873684-043f-4bcb-bfb9-79f952bbe7aa',
 'Encapsulated retinol serum that reduces fine lines, acne, and hyperpigmentation.',
 'Encapsulated Retinol, Bakuchiol, Squalane, Vitamin E', 'Anti-aging, acne-fighting, sensitive-skin friendly',
 'Apply 2-3 drops at night. Start 2-3 times per week and increase.', 72.00, NULL, 'serum', 60, 4.8, 2200, false, true, false, false, true),

('caffeine-eye-cream', 'Caffeine Eye Cream', 'Lumiere', '15873684-043f-4bcb-bfb9-79f952bbe7aa',
 'Cooling eye cream with caffeine and peptides that depuffs and smooths fine lines.',
 'Caffeine, Peptides, Vitamin K, Cucumber Extract', 'Depuffs dark circles, smooths fine lines, cooling',
 'Dot a rice grain-sized amount around orbital bone. Pat gently.', 58.00, NULL, 'serum', 80, 4.7, 1670, false, false, false, false, false),

('fermented-rice-toner', 'Fermented Rice Toner', 'Lumiere', '15873684-043f-4bcb-bfb9-79f952bbe7aa',
 'Fermented rice water toner that hydrates, brightens, and preps skin for next steps.',
 'Fermented Rice Water, Niacinamide, Hyaluronic Acid, Centella', 'Brightens complexion, preps skin, hydrating mist',
 'Pat into skin after cleansing or mist throughout the day.', 38.00, NULL, 'serum', 135, 4.6, 1120, false, false, false, true, false),

('charcoal-clay-mask', 'Charcoal Clay Mask', 'Lumiere', '618ba08e-461b-4d3d-be33-ad3bfd744b04',
 'Kaolin clay mask that draws out impurities and refines pores. Tea tree for blemish-prone skin.',
 'Kaolin Clay, Tea Tree, Charcoal, Aloe Vera', 'Deep pore cleansing, oil control, blemish-fighting',
 'Apply a thin layer to clean skin. Leave 10 minutes, then rinse.', 40.00, NULL, 'moisturizer', 75, 4.5, 890, false, false, false, false, false),

-- ============================================================
-- TOOLS & BRUSHES
-- ============================================================
('pro-12-brush-set', 'Pro 12-Piece Brush Set', 'Lumiere', 'c603be7f-6c3f-482c-989e-ada70a31d0e6',
 '12-piece professional brush set with synthetic bristles and rose gold ferrules in luxury travel case.',
 'Synthetic Taklon Bristles, Rose Gold Ferrules', '12 essential brushes, cruelty-free, professional quality',
 'Use each brush for its intended purpose: powder, blush, contour, eyeshadow, liner, lip.', 128.00, 158.00, 'brushes', 45, 4.9, 2340, true, false, true, false, true),

('dense-kabuki-brush', 'Dense Kabuki Brush', 'Lumiere', 'c603be7f-6c3f-482c-989e-ada70a31d0e6',
 'Dense dome-shaped kabuki for flawless powder, bronzer, and blush application.',
 'Synthetic Fibers, Bamboo Handle', 'Dense dome shape, ultra-soft, multi-purpose',
 'Swirl into product, tap off excess, buff into skin in circular motions.', 34.00, NULL, 'brushes', 90, 4.7, 1230, false, false, false, false, false),

('luxury-blender-sponge', 'Luxury Blender Sponge', 'Lumiere', '383d34f5-8641-43cd-a0ec-93c371a0aa02',
 'Ultra-bouncy makeup sponge for seamless foundation and concealer application.',
 'Non-latex Foam, Hydrophilic Material', 'Flawless blending, dual-ended shape, latex-free',
 'Dampen before use. Bounce and press into skin — never drag.', 22.00, NULL, 'brushes', 200, 4.6, 3100, false, false, false, false, true),

('fluffy-blending-brush', 'Fluffy Blending Brush', 'Lumiere', 'c603be7f-6c3f-482c-989e-ada70a31d0e6',
 'Tapered blending brush for seamless eyeshadow transitions. Essential for any eye look.',
 'Goat Hair, Rose Gold Ferrule, Wooden Handle', 'Seamless blending, tapered shape, essential tool',
 'Use windshield-wiper motions in the crease to blend edges.', 18.00, NULL, 'brushes', 180, 4.8, 1890, false, false, false, false, false),

('contour-sculpt-angled', 'Contour Sculpt Brush', 'Lumiere', 'c603be7f-6c3f-482c-989e-ada70a31d0e6',
 'Angled flat brush for precise contour and highlight placement. Firm yet flexible bristles.',
 'Synthetic Taklon, Ergonomic Handle', 'Precision contouring, angled shape, firm-flexible bristles',
 'Load product on flat side, press and blend along cheekbone hollows.', 28.00, NULL, 'brushes', 70, 4.7, 980, false, false, false, false, false),

('velvet-travel-bag', 'Velvet Travel Makeup Bag', 'Lumiere', '383d34f5-8641-43cd-a0ec-93c371a0aa02',
 'Luxurious velvet travel pouch with waterproof lining. Fits all your essentials.',
 'Velvet Exterior, Waterproof Lining, Gold Zipper', 'Spacious interior, waterproof, travel-friendly',
 'Store brushes, compacts, or skincare minis while traveling.', 48.00, NULL, 'brushes', 65, 4.5, 670, false, true, false, false, false),

-- ============================================================
-- FRAGRANCE
-- ============================================================
('lumiere-noir-edp', 'Lumiere Noir Eau de Parfum', 'Lumiere', '618ba08e-461b-4d3d-be33-ad3bfd744b04',
 'Dark floral eau de parfum with black orchid, amber, and sandalwood. Long-lasting sillage.',
 'Black Orchid, Amber, Sandalwood, Musk', 'Long-lasting 12+ hour sillage, dark floral, unisex',
 'Spray on pulse points: wrists, neck, behind ears.', 120.00, NULL, 'serum', 40, 4.9, 1560, true, false, true, false, true),

('rose-dawn-edt', 'Rose Dawn Eau de Toilette', 'Lumiere', '618ba08e-461b-4d3d-be33-ad3bfd744b04',
 'Delicate rose and peony eau de toilette for daytime freshness. Light and romantic.',
 'Damask Rose, Peony, White Musk, Bergamot', 'Light daytime wear, romantic floral, 6-hour longevity',
 'Mist over body from a distance. Reapply as desired.', 88.00, NULL, 'serum', 55, 4.7, 1120, false, true, false, false, false),

('amber-vanilla-edp', 'Amber Vanilla Elixir', 'Lumiere', '618ba08e-461b-4d3d-be33-ad3bfd744b04',
 'Warm oriental fragrance with Madagascar vanilla, tonka bean, and golden amber.',
 'Madagascar Vanilla, Tonka Bean, Amber, Benzoin', 'Warm oriental, cozy, 10-hour wear',
 'Apply to warm pulse points for maximum projection.', 96.00, NULL, 'serum', 45, 4.8, 890, false, false, false, false, true),

('fig-blossom-cologne', 'Fig Blossom Cologne', 'Lumiere', '618ba08e-461b-4d3d-be33-ad3bfd744b04',
 'Fresh green fig and white blossom cologne. A Mediterranean escape in every spray.',
 'Fig Leaf, White Blossom, Cedar, Musk', 'Fresh green, Mediterranean-inspired, 4-hour light wear',
 'Spritz generously on skin and clothes for an uplifting scent.', 72.00, NULL, 'serum', 65, 4.6, 760, false, false, false, true, false),

-- ============================================================
-- BATH & BODY
-- ============================================================
('silk-shimmer-body-oil', 'Silk Shimmer Body Oil', 'Lumiere', '618ba08e-461b-4d3d-be33-ad3bfd744b04',
 'Luxurious dry body oil with argan and sweet almond. Absorbs instantly for shimmering skin.',
 'Argan Oil, Sweet Almond Oil, Vitamin E, Gold Mica', 'Silky-smooth skin, instant absorption, subtle shimmer',
 'Apply to damp skin after shower. Massage in upward motions.', 56.00, NULL, 'moisturizer', 80, 4.8, 1890, false, false, true, false, true),

('rose-sugar-body-scrub', 'Rose Sugar Body Scrub', 'Lumiere', '618ba08e-461b-4d3d-be33-ad3bfd744b04',
 'Coarse sugar body scrub infused with rose oil and coconut. Exfoliates and moisturizes.',
 'Brown Sugar, Coconut Oil, Rose Oil, Vitamin E', 'Deep exfoliation, moisturizing, rose-scented',
 'Massage onto wet skin in circular motions. Rinse thoroughly.', 42.00, NULL, 'moisturizer', 100, 4.7, 1450, false, false, false, false, false),

('velvet-body-lotion-rose', 'Velvet Body Lotion', 'Lumiere', '618ba08e-461b-4d3d-be33-ad3bfd744b04',
 'Fast-absorbing body lotion with shea butter and vitamin E. Velvety soft with light floral scent.',
 'Shea Butter, Vitamin E, Glycerin, Jasmine Extract', 'Deep moisture, fast-absorbing, light fragrance',
 'Apply generously all over body after shower or bath.', 38.00, NULL, 'moisturizer', 150, 4.6, 1120, false, false, false, false, false),

('honey-oat-bath-milk', 'Honey Oat Bath Milk', 'Lumiere', '618ba08e-461b-4d3d-be33-ad3bfd744b04',
 'Luxurious bath milk with honey extract and oat milk. Creates a silky soak that softens skin.',
 'Honey Extract, Oat Milk, Coconut Oil, Chamomile', 'Softening soak, soothing, silky bath water',
 'Pour 2-3 capfuls under warm running water. Soak 15-20 minutes.', 36.00, NULL, 'moisturizer', 90, 4.5, 780, false, true, false, false, false),

-- ============================================================
-- GIFT SETS
-- ============================================================
('bridal-glow-gift-set', 'Bridal Glow Gift Set', 'Lumiere', '618ba08e-461b-4d3d-be33-ad3bfd744b04',
 'Complete bridal beauty ritual: serum, moisturizer, lipstick sample, and setting spray in keepsake box.',
 'See individual products', 'Full bridal routine, luxurious keepsake box, travel-ready',
 'Follow the numbered steps inside the box for your wedding day routine.', 198.00, 260.00, 'serum', 30, 4.9, 560, true, true, true, false, true),

('skincare-essentials-set', 'Skincare Essentials Set', 'Lumiere', '618ba08e-461b-4d3d-be33-ad3bfd744b04',
 'Four-step skincare routine: cleanser, toner, serum, and moisturizer in elegant mini sizes.',
 'See individual products', 'Complete routine, travel-friendly, perfect gift',
 'Use in order: cleanser, toner, serum, moisturizer. Morning and night.', 128.00, 160.00, 'moisturizer', 50, 4.8, 890, false, false, true, false, false),

('lip-collection-box', 'Lip Collection Box', 'Lumiere', '8638a135-72d0-4726-9fb9-31e63dcc5050',
 'Three bestselling lip products: Velvet Rouge, Rose Petal Shine, and a lip brush in velvet pouch.',
 'See individual products', 'Three iconic lip looks, luxury pouch, gift-ready',
 'Start with Velvet Rouge for base, then dab Rose Petal Shine on center.', 88.00, 112.00, 'lipstick', 65, 4.7, 1230, false, false, false, false, true),

('glam-eye-edit-set', 'Glam Eye Edit Set', 'Lumiere', '20c9e9e2-b119-40c4-901c-7a012cfea920',
 'Party-ready set: Midnight Smoky Palette, Noir Volume Mascara, Ink Liner, and Champagne Highlighter in clutch.',
 'See individual products', 'Complete eye and glow look, party clutch included, full-size',
 'Create a smoky eye with palette, define with liner and mascara, highlight cheekbones.', 168.00, 210.00, 'eyeshadow', 35, 4.8, 670, false, true, false, false, false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Verify count
-- ============================================================
SELECT COUNT(*) as total_products FROM public.products;
