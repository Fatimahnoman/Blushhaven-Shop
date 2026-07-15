-- Enterprise Ecommerce Database Schema
-- Adds: brands, product_images, inventory, addresses, payments, transactions,
-- notifications, newsletter_subscribers, referral_codes, reward_points, audit_logs,
-- shopping_cart, support_tickets, and extends existing tables.

-- ============================================================
-- BRANDS
-- ============================================================
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id);

-- ============================================================
-- PRODUCT IMAGES (multiple images per product)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- ============================================================
-- INVENTORY TRACKING
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 0,
  reserved INT NOT NULL DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  sku TEXT UNIQUE,
  warehouse TEXT DEFAULT 'main',
  last_restocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'partially_refunded')),
  payment_method TEXT DEFAULT 'card',
  card_brand TEXT,
  card_last4 TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe ON payments(stripe_payment_id);

-- ============================================================
-- TRANSACTIONS (refund tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('charge', 'refund', 'partial_refund')),
  amount NUMERIC(10,2) NOT NULL,
  stripe_transfer_id TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_payment ON transactions(payment_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('order_update', 'promotional', 'wishlist', 'stock_alert', 'review', 'system', 'loyalty')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

-- ============================================================
-- REFERRAL CODES
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE UNIQUE,
  code TEXT UNIQUE NOT NULL,
  uses INT DEFAULT 0,
  max_uses INT DEFAULT 50,
  reward_points INT DEFAULT 200,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);

-- ============================================================
-- REWARD POINTS
-- ============================================================
CREATE TABLE IF NOT EXISTS reward_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'adjusted')),
  source TEXT NOT NULL CHECK (source IN ('purchase', 'review', 'referral', 'birthday', 'social', 'admin', 'signup')),
  description TEXT,
  order_id UUID REFERENCES orders(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reward_points_user ON reward_points(user_id);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================
-- SHOPPING CART (server-side, for logged-in users)
-- ============================================================
CREATE TABLE IF NOT EXISTS shopping_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_shopping_cart_user ON shopping_cart(user_id);

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT DEFAULT 'general',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- ============================================================
-- ORDER STATUS HISTORY (timeline tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);

-- ============================================================
-- EXTEND EXISTING ORDERS TABLE
-- ============================================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ============================================================
-- EXTEND USER_ROLES FOR MODERATOR
-- ============================================================
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('admin', 'customer', 'moderator'));

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Brands
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active brands" ON brands FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage brands" ON brands FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Product Images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Admins manage product images" ON product_images FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Inventory
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Admins manage inventory" ON inventory FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins view all addresses" ON addresses FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all payments" ON payments FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System inserts payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own transactions" ON transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM payments WHERE payments.id = transactions.payment_id AND payments.user_id = auth.uid())
);
CREATE POLICY "Admins manage transactions" ON transactions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System inserts notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Newsletter
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users manage own subscription" ON newsletter_subscribers FOR UPDATE USING (auth.uid() = user_id OR email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "Admins view all subscribers" ON newsletter_subscribers FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Referral Codes
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own referral code" ON referral_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can validate referral codes" ON referral_codes FOR SELECT USING (is_active = true);
CREATE POLICY "System manages referral codes" ON referral_codes FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Reward Points
ALTER TABLE reward_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own points" ON reward_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System inserts points" ON reward_points FOR INSERT WITH CHECK (true);

-- Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view all audit logs" ON audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System inserts audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- Shopping Cart
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart" ON shopping_cart FOR ALL USING (auth.uid() = user_id);

-- Support Tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tickets" ON support_tickets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins view all tickets" ON support_tickets FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update tickets" ON support_tickets FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Order Status History
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order history" ON order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins manage order history" ON order_status_history FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create inventory record on product insert
CREATE OR REPLACE FUNCTION handle_new_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO inventory (product_id, quantity, sku)
  VALUES (NEW.id, NEW.stock, UPPER(SUBSTRING(NEW.slug FROM 1 FOR 10)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_new_product_inventory
  AFTER INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION handle_new_product_inventory();

-- Auto-update inventory when order is placed
CREATE OR REPLACE FUNCTION handle_order_stock_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'processing' AND OLD.status = 'pending' THEN
    UPDATE inventory SET quantity = quantity - oi.quantity
    FROM order_items oi WHERE oi.order_id = NEW.id AND inventory.product_id = oi.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_order_stock_update
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION handle_order_stock_update();

-- Auto-insert order status history
CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, status, created_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION handle_order_status_change();

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO brands (slug, name, description, is_active, sort_order) VALUES
  ('lumiere', 'Lumière', 'Our signature line of luxury beauty products', true, 1),
  ('velvet', 'Velvet Beauty', 'Premium makeup for the modern woman', true, 2),
  ('botanica', 'Botanica', 'Clean, plant-based skincare essentials', true, 3),
  ('glow-lab', 'Glow Lab', 'Science-backed radiance formulas', true, 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- HELPER VIEWS
-- ============================================================
CREATE OR REPLACE VIEW order_summary AS
SELECT
  o.id,
  o.user_id,
  o.status,
  o.total,
  o.created_at,
  p.full_name AS customer_name,
  (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count,
  py.status AS payment_status,
  py.payment_method
FROM orders o
LEFT JOIN profiles p ON p.id = o.user_id
LEFT JOIN payments py ON py.order_id = o.id;

CREATE OR REPLACE VIEW product_inventory_view AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.price,
  p.stock,
  i.quantity AS inventory_quantity,
  i.reserved,
  i.sku,
  i.low_stock_threshold,
  CASE
    WHEN i.quantity <= 0 THEN 'out_of_stock'
    WHEN i.quantity <= i.low_stock_threshold THEN 'low_stock'
    ELSE 'in_stock'
  END AS stock_status
FROM products p
LEFT JOIN inventory i ON i.product_id = p.id;

CREATE OR REPLACE VIEW revenue_summary AS
SELECT
  DATE_TRUNC('day', o.created_at) AS date,
  COUNT(*) AS order_count,
  SUM(o.total) AS revenue,
  SUM(o.subtotal) AS gross_revenue,
  SUM(o.discount) AS total_discounts,
  SUM(o.tax) AS total_tax
FROM orders o
WHERE o.status NOT IN ('cancelled')
GROUP BY DATE_TRUNC('day', o.created_at)
ORDER BY date DESC;

CREATE OR REPLACE VIEW user_stats AS
SELECT
  u.id AS user_id,
  p.full_name,
  p.email,
  (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS total_orders,
  (SELECT COALESCE(SUM(total), 0) FROM orders WHERE user_id = u.id AND status != 'cancelled') AS total_spent,
  (SELECT COUNT(*) FROM reviews WHERE user_id = u.id) AS review_count,
  (SELECT COALESCE(SUM(points), 0) FROM reward_points WHERE user_id = u.id AND type = 'earned') AS reward_points,
  u.created_at AS joined_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id;
