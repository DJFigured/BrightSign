# B2B_FLOW.md - Business Customer Flow & Pricing Tiers

## 🎯 B2B Strategy Overview

**Model:** Hybrid B2B/B2C with public RRP prices and automatic B2B discounts after VAT validation.

### Why This Model?
1. **Transparency** - Public prices build trust
2. **Self-service** - B2B customers can validate themselves
3. **Automation** - Minimal manual approval needed
4. **Flexibility** - Easy to adjust discount tiers

## 🔄 Customer Journey

### B2C Flow (Retail)
```
Visit site → Browse products → Add to cart → 
Checkout as guest → Pay RRP → Order complete
```

### B2B Flow (Business)
```
Visit site → See "B2B přihlášení" banner → 
Register with VAT ID → Auto-validate via VIES →
See discounted prices → Checkout → 
Pay (invoice/card) → Order complete
```

## 👤 Customer Registration

### Registration Form Fields

```typescript
interface B2BRegistration {
  // Company info
  companyName: string;           // Required
  vatId: string;                 // Required (DIČ/VAT ID)
  registrationNumber: string;    // Optional (IČO)
  
  // Contact
  email: string;                 // Required
  phone: string;                 // Required
  contactName: string;           // Required
  
  // Address
  street: string;
  city: string;
  postalCode: string;
  country: string;               // Dropdown
  
  // Business info
  businessType: 'integrator' | 'retailer' | 'enterprise' | 'other';
  expectedVolume: 'low' | 'medium' | 'high';
  
  // Auth
  password: string;
  acceptTerms: boolean;
}
```

### Registration Page UI
```jsx
<div className="max-w-2xl mx-auto py-12">
  <h1 className="text-3xl font-bold mb-4">B2B registrace</h1>
  <p className="text-gray-600 mb-8">
    Zaregistrujte se jako firemní zákazník a získejte automatické slevy 
    10-20% na všechny produkty.
  </p>
  
  {/* Benefits */}
  <div className="grid grid-cols-2 gap-4 mb-8">
    <div className="bg-accent/10 p-4 rounded-lg">
      <span className="text-2xl">💰</span>
      <h3 className="font-semibold mt-2">Slevy 10-20%</h3>
      <p className="text-sm text-gray-600">Na všechny produkty</p>
    </div>
    <div className="bg-accent/10 p-4 rounded-lg">
      <span className="text-2xl">📄</span>
      <h3 className="font-semibold mt-2">Fakturace</h3>
      <p className="text-sm text-gray-600">Platba na fakturu</p>
    </div>
    <div className="bg-accent/10 p-4 rounded-lg">
      <span className="text-2xl">🚫</span>
      <h3 className="font-semibold mt-2">Bez DPH</h3>
      <p className="text-sm text-gray-600">Reverse charge pro EU</p>
    </div>
    <div className="bg-accent/10 p-4 rounded-lg">
      <span className="text-2xl">👤</span>
      <h3 className="font-semibold mt-2">Dedikovaný kontakt</h3>
      <p className="text-sm text-gray-600">Pro větší projekty</p>
    </div>
  </div>
  
  {/* Form */}
  <form>
    {/* ... fields ... */}
  </form>
</div>
```

## ✅ VAT Validation (VIES)

### VIES API Integration

```typescript
// lib/vies.ts
import { createSOAPClient } from 'soap';

const VIES_WSDL = 'https://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl';

interface VIESResponse {
  valid: boolean;
  name: string;
  address: string;
  countryCode: string;
  vatNumber: string;
  requestDate: string;
}

export async function validateVAT(countryCode: string, vatNumber: string): Promise<VIESResponse> {
  const client = await createSOAPClient(VIES_WSDL);
  
  // Remove country prefix if included
  const cleanVatNumber = vatNumber.replace(/^[A-Z]{2}/i, '');
  
  try {
    const result = await client.checkVatAsync({
      countryCode: countryCode.toUpperCase(),
      vatNumber: cleanVatNumber,
    });
    
    return {
      valid: result.valid,
      name: result.name || '',
      address: result.address || '',
      countryCode: countryCode,
      vatNumber: cleanVatNumber,
      requestDate: new Date().toISOString(),
    };
  } catch (error) {
    // VIES is often unavailable, handle gracefully
    console.error('VIES validation error:', error);
    throw new Error('VAT validation service unavailable');
  }
}
```

### Validation Flow

```
1. Customer enters VAT ID (e.g., "CZ12345678")
2. Extract country code (CZ) and number (12345678)
3. Call VIES API
4. If valid:
   - Store validation result
   - Assign to b2b_standard group
   - Show success message
5. If invalid:
   - Show error
   - Allow manual review request
6. If VIES unavailable:
   - Queue for later validation
   - Allow temporary B2B access (24h)
```

### VIES Fallback Strategy

```typescript
// When VIES is down (happens often)
async function handleVIESUnavailable(customer: Customer, vatId: string) {
  // 1. Log the attempt
  await logValidationAttempt(customer.id, vatId, 'vies_unavailable');
  
  // 2. Grant temporary B2B status
  await updateCustomerGroup(customer.id, 'b2b_pending');
  
  // 3. Schedule retry
  await scheduleVIESRetry(customer.id, vatId);
  
  // 4. Send notification
  await sendEmail(customer.email, 'vat-validation-pending');
  
  return {
    status: 'pending',
    message: 'Validace DIČ probíhá. Zatím máte dočasný B2B přístup.',
  };
}
```

## 💰 Pricing Tiers

### Customer Groups

| Group | Discount | Conditions | Auto-assign |
|-------|----------|------------|-------------|
| `retail` | 0% | Default | Yes |
| `b2b_pending` | 0% | Awaiting VAT validation | Yes |
| `b2b_standard` | 10% | Valid VAT ID | Yes |
| `b2b_volume` | 15% | 10+ orders or 50k+ CZK | Manual |
| `b2b_partner` | 20% | Certified integrator | Manual |

### Price Calculation Logic

```typescript
// lib/pricing.ts

interface PriceContext {
  basePrice: number;           // RRP in cents
  customerGroup: string;
  quantity: number;
  region: string;
}

export function calculatePrice(ctx: PriceContext): number {
  let price = ctx.basePrice;
  
  // Apply group discount
  const groupDiscount = getGroupDiscount(ctx.customerGroup);
  price = price * (1 - groupDiscount);
  
  // Apply quantity discount (if not already in volume tier)
  if (ctx.customerGroup !== 'b2b_volume' && ctx.customerGroup !== 'b2b_partner') {
    if (ctx.quantity >= 5) {
      price = price * 0.95; // Additional 5% for 5+ units
    }
  }
  
  return Math.round(price);
}

function getGroupDiscount(group: string): number {
  const discounts: Record<string, number> = {
    retail: 0,
    b2b_pending: 0,
    b2b_standard: 0.10,
    b2b_volume: 0.15,
    b2b_partner: 0.20,
  };
  return discounts[group] || 0;
}
```

### Price Display Component

```jsx
function ProductPrice({ product, customer }) {
  const basePrice = product.variants[0].prices[0].amount;
  const discount = getGroupDiscount(customer?.group || 'retail');
  const finalPrice = basePrice * (1 - discount);
  
  return (
    <div className="space-y-1">
      {/* Discounted price */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-primary">
          {formatPrice(finalPrice)}
        </span>
        <span className="text-sm text-gray-500">bez DPH</span>
      </div>
      
      {/* Original price if discounted */}
      {discount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 line-through">
            {formatPrice(basePrice)}
          </span>
          <span className="text-sm text-accent font-medium">
            -{discount * 100}% B2B sleva
          </span>
        </div>
      )}
      
      {/* B2B CTA if not logged in */}
      {!customer && (
        <a href="/b2b/register" className="text-sm text-accent hover:underline">
          Získat B2B slevu →
        </a>
      )}
    </div>
  );
}
```

## 🧾 B2B Checkout Differences

### Payment Methods

| Method | B2C | B2B Standard | B2B Volume/Partner |
|--------|-----|--------------|-------------------|
| Credit card | ✅ | ✅ | ✅ |
| Bank transfer (proforma) | ❌ | ✅ | ✅ |
| Net 14 days | ❌ | ❌ | ✅ (approved) |
| Net 30 days | ❌ | ❌ | ✅ (approved) |

### Invoice Requirements

```typescript
interface B2BInvoice {
  // Seller
  sellerName: 'Make more s.r.o.';
  sellerVatId: string;
  sellerAddress: string;
  
  // Buyer
  buyerName: string;
  buyerVatId: string;         // Required for B2B
  buyerAddress: string;
  
  // Tax handling
  vatRate: number;            // 21% CZ, 20% SK, etc.
  reverseCharge: boolean;     // true for EU B2B cross-border
  
  // If reverse charge
  reverseChargeNote: string;  // "Daň odvede zákazník"
}
```

### Reverse Charge Logic

```typescript
function shouldApplyReverseCharge(order: Order): boolean {
  const seller = { country: 'CZ', isVatRegistered: true };
  const buyer = { 
    country: order.customer.country,
    isVatRegistered: order.customer.vatId !== null,
    vatValid: order.customer.vatValidated,
  };
  
  // Same country - normal VAT
  if (seller.country === buyer.country) {
    return false;
  }
  
  // Cross-border EU B2B with valid VAT
  if (isEUCountry(buyer.country) && buyer.isVatRegistered && buyer.vatValid) {
    return true;
  }
  
  return false;
}
```

## 📊 B2B Dashboard

### Features for B2B Customers

```jsx
<div className="grid grid-cols-3 gap-6">
  {/* Order History */}
  <Card>
    <h3>Objednávky</h3>
    <p className="text-3xl font-bold">{orders.length}</p>
    <Link href="/account/orders">Zobrazit vše →</Link>
  </Card>
  
  {/* Current Tier */}
  <Card>
    <h3>Vaše sleva</h3>
    <p className="text-3xl font-bold text-accent">
      {customer.group === 'b2b_standard' && '10%'}
      {customer.group === 'b2b_volume' && '15%'}
      {customer.group === 'b2b_partner' && '20%'}
    </p>
    <p className="text-sm text-gray-600">
      {getNextTierInfo(customer)}
    </p>
  </Card>
  
  {/* Quick Reorder */}
  <Card>
    <h3>Rychlá objednávka</h3>
    <Button onClick={showQuickOrder}>
      Objednat znovu
    </Button>
  </Card>
</div>

{/* Recent Orders */}
<section className="mt-8">
  <h2 className="text-xl font-semibold mb-4">Poslední objednávky</h2>
  <OrdersTable orders={orders.slice(0, 5)} />
</section>

{/* Project Quote Request */}
<section className="mt-8 bg-accent/10 p-6 rounded-lg">
  <h2 className="text-xl font-semibold mb-2">Plánujete větší projekt?</h2>
  <p className="text-gray-600 mb-4">
    Kontaktujte nás pro individuální cenovou nabídku na větší objemy.
  </p>
  <Button variant="accent">
    Poptat projekt
  </Button>
</section>
```

## 📧 B2B Email Sequences

### Registration Sequence

1. **Welcome Email** (immediate)
   - Confirm registration
   - VAT validation status
   - How to use B2B benefits

2. **VAT Validated** (when confirmed)
   - Confirmation of B2B status
   - Link to first order

3. **Follow-up** (7 days, no order)
   - Reminder of benefits
   - Featured products

### Post-Purchase Sequence

1. **Order Confirmation** (immediate)
   - Invoice attached
   - Shipping info

2. **Review Request** (14 days)
   - Ask for feedback
   - Offer support

3. **Reorder Reminder** (60 days)
   - Based on typical order cycle
   - Special offer for repeat order

## 🔧 Medusa Implementation

### Customer Groups Setup

```typescript
// src/scripts/seed-customer-groups.ts
import { MedusaContainer } from '@medusajs/medusa';

export default async function seedCustomerGroups(container: MedusaContainer) {
  const customerGroupService = container.resolve('customerGroupService');
  
  const groups = [
    { name: 'Retail', metadata: { discount: 0 } },
    { name: 'B2B Pending', metadata: { discount: 0 } },
    { name: 'B2B Standard', metadata: { discount: 0.10 } },
    { name: 'B2B Volume', metadata: { discount: 0.15 } },
    { name: 'B2B Partner', metadata: { discount: 0.20 } },
  ];
  
  for (const group of groups) {
    await customerGroupService.create(group);
  }
}
```

### Price List for B2B

```typescript
// Create price lists for each B2B tier
const priceLists = [
  {
    name: 'B2B Standard Prices',
    type: 'sale',
    customer_groups: ['b2b_standard'],
    prices: products.map(p => ({
      variant_id: p.variants[0].id,
      amount: Math.round(p.variants[0].prices[0].amount * 0.90),
      currency_code: 'CZK',
    })),
  },
  // ... repeat for other tiers
];
```

### VAT Validation Subscriber

```typescript
// src/subscribers/customer-created.ts
import { CustomerService } from '@medusajs/medusa';
import { validateVAT } from '../lib/vies';

export default async function customerCreatedHandler({ 
  data, 
  container 
}) {
  const customerService: CustomerService = container.resolve('customerService');
  const customer = data.customer;
  
  // Check if VAT ID provided
  if (!customer.metadata?.vatId) {
    return;
  }
  
  try {
    // Validate VAT
    const result = await validateVAT(
      customer.metadata.vatCountry,
      customer.metadata.vatId
    );
    
    if (result.valid) {
      // Assign to B2B group
      await customerService.update(customer.id, {
        groups: [{ id: 'b2b_standard' }],
        metadata: {
          ...customer.metadata,
          vatValidated: true,
          vatValidatedAt: new Date().toISOString(),
          vatCompanyName: result.name,
        },
      });
    }
  } catch (error) {
    // Handle VIES unavailable
    console.error('VAT validation failed:', error);
  }
}
```
