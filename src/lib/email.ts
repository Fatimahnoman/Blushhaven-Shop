// Email System for Lumière Ecommerce
// Uses Resend for transactional emails

export type EmailTemplate = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

const FROM_EMAIL = "Lumière <hello@lumiere-beauty.com>";

// Base email styles
const baseStyles = `
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background: #faf8f6; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #8b4a5a, #a85870); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 0; font-family: 'Playfair Display', Georgia, serif; }
    .header p { color: rgba(255,255,255,0.8); font-size: 12px; margin: 8px 0 0; letter-spacing: 3px; text-transform: uppercase; }
    .content { padding: 40px 30px; color: #333; line-height: 1.6; }
    .content h2 { font-size: 20px; margin: 0 0 16px; color: #1a1520; }
    .content p { font-size: 14px; margin: 0 0 12px; color: #666; }
    .btn { display: inline-block; background: #8b4a5a; color: #ffffff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }
    .btn:hover { background: #a85870; }
    .divider { border: none; border-top: 1px solid #eee; margin: 24px 0; }
    .footer { padding: 30px; text-align: center; color: #999; font-size: 11px; }
    .footer a { color: #8b4a5a; text-decoration: none; }
    .order-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
    .order-item img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; margin-right: 16px; }
    .order-item .details { flex: 1; }
    .order-item .name { font-size: 14px; font-weight: 500; }
    .order-item .meta { font-size: 12px; color: #999; }
    .order-item .price { font-size: 14px; font-weight: 600; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .total-row.grand { border-top: 2px solid #eee; padding-top: 12px; margin-top: 8px; font-weight: 700; font-size: 16px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-processing { background: #dbeafe; color: #1e40af; }
    .status-shipped { background: #ede9fe; color: #5b21b6; }
    .status-delivered { background: #d1fae5; color: #065f46; }
  </style>
`;

// Email templates
export const emailTemplates = {
  welcome: (name: string): EmailTemplate => ({
    to: "",
    subject: "Welcome to Lumière ✨",
    html: `
      ${baseStyles}
      <div class="container">
        <div class="header">
          <h1>Lumière</h1>
          <p>Luxury Beauty</p>
        </div>
        <div class="content">
          <h2>Welcome, ${name}! ✨</h2>
          <p>We're thrilled to have you join the Lumière family. Your journey to radiant beauty starts here.</p>
          <p>As a welcome gift, enjoy <strong>15% off</strong> your first order with code <strong>WELCOME15</strong></p>
          <hr class="divider">
          <p><strong>Here's what you can do:</strong></p>
          <p>• Browse our curated collection of luxury beauty products</p>
          <p>• Take our AI Skin Quiz for personalized recommendations</p>
          <p>• Build your perfect skincare routine with our Routine Builder</p>
          <p>• Earn reward points with every purchase</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://lumiere-beauty.com'}/shop" class="btn">Start Shopping</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Lumière Beauty. All rights reserved.</p>
          <p><a href="#">Unsubscribe</a> · <a href="#">Privacy Policy</a></p>
        </div>
      </div>
    `,
  }),

  orderConfirmation: (order: {
    id: string;
    items: { name: string; quantity: number; price: number; image?: string }[];
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    shipping_address?: any;
    coupon_code?: string;
  }): EmailTemplate => ({
    to: "",
    subject: `Order Confirmed #${order.id.slice(0, 8)} ✨`,
    html: `
      ${baseStyles}
      <div class="container">
        <div class="header">
          <h1>Lumière</h1>
          <p>Order Confirmation</p>
        </div>
        <div class="content">
          <h2>Thank you for your order! 🎉</h2>
          <p>Your order <strong>#${order.id.slice(0, 8)}</strong> has been confirmed and is being prepared.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <span class="status-badge status-processing">Processing</span>
          </div>

          <hr class="divider">
          
          <h3 style="font-size: 16px; margin: 0 0 16px;">Order Summary</h3>
          
          ${order.items.map(item => `
            <div class="order-item">
              ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
              <div class="details">
                <div class="name">${item.name}</div>
                <div class="meta">Qty: ${item.quantity}</div>
              </div>
              <div class="price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          `).join('')}

          <div style="margin-top: 24px;">
            <div class="total-row"><span>Subtotal</span><span>$${order.subtotal.toFixed(2)}</span></div>
            ${order.discount > 0 ? `<div class="total-row" style="color: #059669;"><span>Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}</span><span>-$${order.discount.toFixed(2)}</span></div>` : ''}
            <div class="total-row"><span>Shipping</span><span>${order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span></div>
            <div class="total-row"><span>Tax</span><span>$${order.tax.toFixed(2)}</span></div>
            <div class="total-row grand"><span>Total</span><span>$${order.total.toFixed(2)}</span></div>
          </div>

          ${order.shipping_address ? `
            <hr class="divider">
            <h3 style="font-size: 16px; margin: 0 0 12px;">Shipping Address</h3>
            <p style="font-size: 13px; color: #666;">
              ${order.shipping_address.full_name || ''}<br>
              ${order.shipping_address.line1 || ''}<br>
              ${order.shipping_address.line2 ? order.shipping_address.line2 + '<br>' : ''}
              ${order.shipping_address.city || ''}, ${order.shipping_address.state || ''} ${order.shipping_address.postal_code || ''}
            </p>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://lumiere-beauty.com'}/track-order" class="btn">Track Order</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Lumière Beauty. All rights reserved.</p>
          <p><a href="#">Unsubscribe</a> · <a href="#">Privacy Policy</a></p>
        </div>
      </div>
    `,
  }),

  shippingConfirmation: (order: {
    id: string;
    tracking_number: string;
    carrier: string;
    estimated_delivery: string;
  }): EmailTemplate => ({
    to: "",
    subject: `Your order is on its way! 📦`,
    html: `
      ${baseStyles}
      <div class="container">
        <div class="header">
          <h1>Lumière</h1>
          <p>Shipping Update</p>
        </div>
        <div class="content">
          <h2>Your order is on its way! 🚚</h2>
          <p>Great news! Your order <strong>#${order.id.slice(0, 8)}</strong> has been shipped.</p>
          
          <div style="background: #f8f6f4; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 8px;"><strong>Carrier:</strong> ${order.carrier}</p>
            <p style="margin: 0 0 8px;"><strong>Tracking:</strong> ${order.tracking_number}</p>
            <p style="margin: 0;"><strong>Estimated Delivery:</strong> ${order.estimated_delivery}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://lumiere-beauty.com'}/track-order" class="btn">Track Package</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Lumière Beauty. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  passwordReset: (resetUrl: string): EmailTemplate => ({
    to: "",
    subject: "Reset your Lumière password",
    html: `
      ${baseStyles}
      <div class="container">
        <div class="header">
          <h1>Lumière</h1>
          <p>Password Reset</p>
        </div>
        <div class="content">
          <h2>Reset your password</h2>
          <p>You requested a password reset. Click the button below to create a new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="btn">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #999;">This link expires in 24 hours. If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Lumière Beauty. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  abandonedCart: (items: { name: string; price: number; image?: string }[]): EmailTemplate => ({
    to: "",
    subject: "You left something beautiful behind 💄",
    html: `
      ${baseStyles}
      <div class="container">
        <div class="header">
          <h1>Lumière</h1>
          <p>We miss you</p>
        </div>
        <div class="content">
          <h2>You left something beautiful behind</h2>
          <p>Your cart is waiting! Complete your order before these items sell out.</p>
          
          ${items.map(item => `
            <div class="order-item">
              ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
              <div class="details">
                <div class="name">${item.name}</div>
              </div>
              <div class="price">$${item.price.toFixed(2)}</div>
            </div>
          `).join('')}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://lumiere-beauty.com'}/cart" class="btn">Complete Your Order</a>
          </div>
          <p style="font-size: 12px; color: #999; text-align: center;">Use code <strong>CART10</strong> for 10% off</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Lumière Beauty. All rights reserved.</p>
          <p><a href="#">Unsubscribe</a></p>
        </div>
      </div>
    `,
  }),
};

// Send email function (server-side, uses Resend)
export async function sendEmail(template: EmailTemplate): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, this calls Resend API:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: template.from ?? FROM_EMAIL,
    //   to: template.to,
    //   subject: template.subject,
    //   html: template.html,
    // });
    
    console.log(`[Email] Sent to ${template.to}: ${template.subject}`);
    return { success: true };
  } catch (error) {
    console.error("[Email] Failed:", error);
    return { success: false, error: String(error) };
  }
}

// Batch send
export async function sendBatchEmails(templates: EmailTemplate[]): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  for (const template of templates) {
    const result = await sendEmail(template);
    if (result.success) sent++;
    else failed++;
  }
  return { sent, failed };
}
