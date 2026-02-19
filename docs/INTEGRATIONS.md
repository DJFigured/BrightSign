# INTEGRATIONS.md - External Service Integrations

## 📋 Integration Overview

| Service | Purpose | Priority | Complexity |
|---------|---------|----------|------------|
| Stripe | Payments | P0 (Critical) | Low |
| Packeta | Shipping | P0 (Critical) | Medium |
| VIES | VAT validation | P1 (Important) | Low |
| Resend | Transactional email | P2 (Nice to have) | Low |
| COMM-TEC | Stock monitoring | P2 (Nice to have) | High |
| Plausible | Analytics | P2 (Nice to have) | Low |
| n8n | Automation | P2 (Nice to have) | Medium |

---

## 💳 Stripe Integration

### Overview
Stripe handles all payment processing. Use Medusa's official Stripe plugin.

### Setup

```bash
# Install Stripe plugin
cd brightsign-backend
npm install medusa-payment-stripe
```

```typescript
// medusa-config.ts
module.exports = {
  plugins: [
    {
      resolve: 'medusa-payment-stripe',
      options: {
        api_key: process.env.STRIPE_API_KEY,
        webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
        capture: true, // Auto-capture payments
      },
    },
  ],
};
```

### Environment Variables
```env
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
```

### Webhook Events to Handle
- `payment_intent.succeeded` - Order paid
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed

### Frontend Payment Form

```tsx
// components/checkout/PaymentForm.tsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });
    
    if (error) {
      // Show error to customer
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe}>
        Zaplatit
      </button>
    </form>
  );
}

export function StripePayment({ clientSecret }: { clientSecret: string }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  );
}
```

### Supported Payment Methods
Configure in Stripe Dashboard:
- Cards (Visa, Mastercard, Amex)
- Google Pay
- Apple Pay
- Bancontact (Belgium)
- iDEAL (Netherlands)
- Przelewy24 (Poland)

---

## 📦 Packeta (Zásilkovna) Integration

### Overview
Packeta provides shipping to CZ, SK, PL, HU, RO with pickup points and home delivery.

### API Documentation
- API v5: https://docs.packetery.com/
- API Key required from Packeta merchant portal

### Environment Variables
```env
PACKETA_API_KEY=...
PACKETA_API_PASSWORD=...
PACKETA_SENDER_ID=...
```

### API Client

```typescript
// lib/packeta.ts
import axios from 'axios';

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';

interface PacketaClient {
  createPacket(order: Order): Promise<PacketaResponse>;
  getLabel(packetId: string): Promise<Buffer>;
  getTracking(packetId: string): Promise<TrackingInfo>;
}

export async function createPacketaShipment(order: Order): Promise<string> {
  const response = await axios.post(`${PACKETA_API_URL}/packet`, {
    apiPassword: process.env.PACKETA_API_PASSWORD,
    packetAttributes: {
      number: order.display_id,
      name: order.shipping_address.first_name,
      surname: order.shipping_address.last_name,
      email: order.email,
      phone: order.shipping_address.phone,
      addressId: order.metadata?.packeta_point_id, // For pickup point
      street: order.shipping_address.address_1,
      city: order.shipping_address.city,
      zip: order.shipping_address.postal_code,
      country: order.shipping_address.country_code,
      cod: 0, // Cash on delivery amount
      value: order.total / 100, // Order value for insurance
      weight: calculateWeight(order.items),
      eshop: process.env.PACKETA_SENDER_ID,
    },
  });
  
  return response.data.packet.id;
}

export async function getPacketaLabel(packetId: string): Promise<Buffer> {
  const response = await axios.get(
    `${PACKETA_API_URL}/packet/${packetId}/label`,
    {
      params: { 
        apiPassword: process.env.PACKETA_API_PASSWORD,
        format: 'pdf',
      },
      responseType: 'arraybuffer',
    }
  );
  
  return Buffer.from(response.data);
}
```

### Pickup Point Selector Widget

```html
<!-- Add Packeta widget to checkout -->
<script src="https://widget.packeta.com/v6/www/js/library.js"></script>

<script>
Packeta.Widget.pick(
  process.env.NEXT_PUBLIC_PACKETA_API_KEY,
  (point) => {
    // point selected
    console.log('Selected point:', point);
    // Store in order metadata
    setSelectedPoint({
      id: point.id,
      name: point.name,
      address: point.address,
    });
  },
  {
    language: 'cs',
    country: 'cz,sk,pl,hu,ro',
    appIdentity: 'brightsign-eshop',
  }
);
</script>
```

### Shipping Zones & Rates

```typescript
// config/shipping.ts
export const shippingZones = {
  cz: {
    packeta_pickup: {
      name: 'Zásilkovna - výdejní místo',
      price: 79, // CZK
      freeFrom: 2000,
    },
    packeta_home: {
      name: 'Zásilkovna - doručení domů',
      price: 99,
      freeFrom: 2000,
    },
  },
  sk: {
    packeta_pickup: {
      name: 'Zásielkovňa - výdajné miesto',
      price: 3.50, // EUR
      freeFrom: 80,
    },
    packeta_home: {
      name: 'Zásielkovňa - doručenie domov',
      price: 4.50,
      freeFrom: 80,
    },
  },
  pl: {
    packeta_pickup: {
      name: 'Paczkomaty - punkt odbioru',
      price: 15, // PLN
      freeFrom: 400,
    },
    packeta_home: {
      name: 'Kurier - dostawa do domu',
      price: 20,
      freeFrom: 400,
    },
  },
};
```

---

## 🔍 VIES VAT Validation

### Overview
EU VAT Information Exchange System for validating B2B customer VAT IDs.

### API Endpoint
SOAP: `https://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl`

### Implementation

```typescript
// lib/vies.ts
import * as soap from 'soap';

const VIES_WSDL = 'https://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl';

export interface VIESResult {
  valid: boolean;
  name: string;
  address: string;
  countryCode: string;
  vatNumber: string;
}

export async function validateVatNumber(
  countryCode: string, 
  vatNumber: string
): Promise<VIESResult> {
  // Clean VAT number (remove spaces, country prefix)
  const cleanNumber = vatNumber
    .replace(/\s/g, '')
    .replace(/^[A-Z]{2}/i, '');
  
  const client = await soap.createClientAsync(VIES_WSDL);
  
  const [result] = await client.checkVatAsync({
    countryCode: countryCode.toUpperCase(),
    vatNumber: cleanNumber,
  });
  
  return {
    valid: result.valid,
    name: result.name || '',
    address: result.address || '',
    countryCode: countryCode,
    vatNumber: cleanNumber,
  };
}

// Helper to parse various VAT ID formats
export function parseVatId(input: string): { country: string; number: string } | null {
  const patterns: Record<string, RegExp> = {
    CZ: /^(CZ)?(\d{8,10})$/i,
    SK: /^(SK)?(\d{10})$/i,
    PL: /^(PL)?(\d{10})$/i,
    AT: /^(AT)?U(\d{8})$/i,
    DE: /^(DE)?(\d{9})$/i,
    HU: /^(HU)?(\d{8})$/i,
    RO: /^(RO)?(\d{2,10})$/i,
  };
  
  const cleaned = input.replace(/\s/g, '').toUpperCase();
  
  for (const [country, pattern] of Object.entries(patterns)) {
    const match = cleaned.match(pattern);
    if (match) {
      return { country, number: match[2] };
    }
  }
  
  return null;
}
```

### Caching Strategy

```typescript
// VIES has rate limits and downtime, cache results
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
const CACHE_TTL = 60 * 60 * 24 * 30; // 30 days

export async function validateVatCached(
  countryCode: string, 
  vatNumber: string
): Promise<VIESResult> {
  const cacheKey = `vies:${countryCode}:${vatNumber}`;
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Validate
  const result = await validateVatNumber(countryCode, vatNumber);
  
  // Cache result
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
  
  return result;
}
```

---

## 📧 Resend Integration

### Overview
Resend handles transactional emails. Simple, cheap, has MCP server for AI automation.

**Pricing:** 3,000 emails/month FREE, then $0.10/1000 emails

### Setup
```bash
# Medusa plugin
npm install medusa-plugin-resend resend

# MCP server for Claude Code (AI can send emails directly)
claude mcp add resend -- npx -y @anthropic/mcp-server-resend
```

### Environment Variables
```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=info@brightsign.cz
RESEND_FROM_NAME=BrightSign.cz
```

### Medusa Plugin Config

```typescript
// medusa-config.ts
plugins: [
  {
    resolve: 'medusa-plugin-resend',
    options: {
      api_key: process.env.RESEND_API_KEY,
      from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
    },
  },
],
```

### Email Client (Manual Use)

```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  return resend.emails.send({
    from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
}

// Example: Order confirmation
export async function sendOrderConfirmation(order: Order) {
  return sendEmail(
    order.email,
    `Potvrzení objednávky #${order.display_id}`,
    `<h1>Děkujeme za objednávku!</h1>
     <p>Číslo objednávky: ${order.display_id}</p>
     <p>Celkem: ${formatPrice(order.total)}</p>`
  );
}
```

### Email Templates (React)

Resend supports React email templates:

```tsx
// emails/order-confirmation.tsx
import { Html, Head, Body, Container, Text } from '@react-email/components';

export function OrderConfirmation({ order }) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Text>Děkujeme za objednávku #{order.display_id}</Text>
          <Text>Celkem: {order.total} CZK</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

### AI Agent Email (via MCP)

Claude Code can send emails directly:
```
User: "Pošli zákazníkovi info@firma.cz odpověď na dotaz o HD225"
Claude: [uses Resend MCP] → Email sent ✓
```

---

## 🏭 COMM-TEC Stock Monitoring

### Overview
COMM-TEC has no API. Stock must be monitored via scraping or manual checks.

### Option A: Manual Updates (Recommended for Start)

```typescript
// Admin endpoint for manual stock update
// POST /admin/stock-update
interface StockUpdate {
  sku: string;
  quantity: number;
  lastChecked: string;
}

app.post('/admin/stock-update', async (req, res) => {
  const updates: StockUpdate[] = req.body;
  
  for (const update of updates) {
    await updateProductStock(update.sku, update.quantity);
  }
  
  res.json({ success: true, updated: updates.length });
});
```

### Option B: Scraping (n8n Automation)

```javascript
// n8n workflow: COMM-TEC Stock Check
// Trigger: Schedule (daily at 6:00)

// 1. HTTP Request - Login to COMM-TEC dealer portal
const loginResponse = await $http.post('https://portal.comm-tec.de/login', {
  body: {
    username: '{{$env.COMMTEC_USERNAME}}',
    password: '{{$env.COMMTEC_PASSWORD}}',
  },
});

// 2. HTTP Request - Get product page
const productPage = await $http.get('https://portal.comm-tec.de/products/brightsign', {
  headers: {
    Cookie: loginResponse.headers['set-cookie'],
  },
});

// 3. Parse HTML for stock levels
const cheerio = require('cheerio');
const $ = cheerio.load(productPage.body);

const stockLevels = [];
$('.product-row').each((i, el) => {
  stockLevels.push({
    sku: $(el).find('.sku').text(),
    stock: parseInt($(el).find('.stock').text()),
    price: parseFloat($(el).find('.price').text().replace('€', '')),
  });
});

// 4. Update Medusa inventory
for (const item of stockLevels) {
  await $http.post('{{$env.MEDUSA_URL}}/admin/inventory-items', {
    body: { sku: item.sku, quantity: item.stock },
    headers: { 'x-medusa-access-token': '{{$env.MEDUSA_ADMIN_TOKEN}}' },
  });
}

// 5. Alert if low stock
const lowStock = stockLevels.filter(i => i.stock < 5);
if (lowStock.length > 0) {
  // Send Slack/Telegram notification
}
```

### Stock Display Strategy

```typescript
// Don't show exact stock, just availability
function getStockStatus(quantity: number): string {
  if (quantity > 10) return 'Skladem';
  if (quantity > 0) return 'Poslední kusy';
  return 'Na objednávku (3-5 dní)';
}
```

---

## 📊 Plausible Analytics

### Overview
Privacy-focused analytics, GDPR compliant without cookie banner.

### Setup (Self-hosted or Cloud)

```html
<!-- Add to _app.tsx or layout.tsx -->
<script 
  defer 
  data-domain="brightsign.cz" 
  src="https://plausible.io/js/script.js"
></script>
```

### Custom Events

```typescript
// Track key events
function trackEvent(name: string, props?: Record<string, string>) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(name, { props });
  }
}

// Usage
trackEvent('Add to Cart', { product: 'HD225', price: '14900' });
trackEvent('B2B Registration');
trackEvent('Checkout Complete', { value: '35000' });
```

---

## 🔌 n8n Webhook Endpoints

### Overview
n8n receives webhooks from Medusa for automation.

### Webhook URLs
```
POST https://n8n.yourdomain.com/webhook/order-created
POST https://n8n.yourdomain.com/webhook/order-paid
POST https://n8n.yourdomain.com/webhook/customer-created
POST https://n8n.yourdomain.com/webhook/low-stock-alert
```

### Medusa Subscriber for Webhooks

```typescript
// src/subscribers/order-created.ts
import axios from 'axios';

export default async function orderCreatedHandler({ data, container }) {
  const order = data.order;
  
  // Send to n8n
  await axios.post(process.env.N8N_WEBHOOK_ORDER_CREATED!, {
    order_id: order.id,
    display_id: order.display_id,
    email: order.email,
    total: order.total,
    items: order.items.map(i => ({
      title: i.title,
      quantity: i.quantity,
      sku: i.variant.sku,
    })),
    shipping_address: order.shipping_address,
  });
}
```

---

## 🔑 All Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/medusa

# Redis
REDIS_URL=redis://localhost:6379

# Medusa
JWT_SECRET=your-jwt-secret-min-32-chars
COOKIE_SECRET=your-cookie-secret-min-32-chars
MEDUSA_ADMIN_ONBOARDING_TYPE=default
STORE_CORS=http://localhost:3000

# Stripe
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Packeta
PACKETA_API_KEY=...
PACKETA_API_PASSWORD=...
PACKETA_SENDER_ID=...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=info@brightsign.cz
RESEND_FROM_NAME=BrightSign.cz

# COMM-TEC (for scraping)
COMMTEC_USERNAME=...
COMMTEC_PASSWORD=...

# n8n
N8N_WEBHOOK_ORDER_CREATED=https://n8n.../webhook/order-created
N8N_WEBHOOK_ORDER_PAID=https://n8n.../webhook/order-paid

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=brightsign.cz

# Frontend
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.brightsign.cz
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
NEXT_PUBLIC_PACKETA_API_KEY=...
```
