# Adding a Payment Provider to BrightSight

**Step-by-step guide for implementing a new payment provider in Medusa.js v2.**

This document uses the Comgate module as a reference implementation. The same pattern applies to any redirect-based payment provider (Przelewy24, PayU, Tpay, etc.).

---

## Prerequisites

- Medusa.js v2 backend running locally
- API credentials from the payment provider (merchant ID, secret, etc.)
- Provider API documentation (endpoints, auth, webhooks)
- Understanding of the provider's payment flow (redirect vs. embedded)

---

## Step 1: Create the Module Directory

```
backend/src/modules/{provider-name}/
  index.ts    — Module export (ModuleProvider)
  service.ts  — Payment provider service (AbstractPaymentProvider)
  types.ts    — TypeScript types (options, API types, session data)
```

Example:
```bash
mkdir -p backend/src/modules/comgate
```

---

## Step 2: Define Types (`types.ts`)

Every payment provider module needs these type categories:

### 2.1 Provider Options
Options passed from `medusa-config.ts`. Include all credentials and flags.

```typescript
export interface ProviderOptions {
  merchantId: string
  secret: string
  test?: boolean
}
```

### 2.2 API Request/Response Types
Match the provider's API documentation exactly. Include all fields.

```typescript
export interface CreatePaymentParams {
  merchant: string
  price: number
  curr: string
  // ...all fields from API docs
}

export interface CreatePaymentResponse {
  code: number
  message: string
  transId?: string
  redirect?: string
}
```

### 2.3 Session/Payment Data Types
Data stored in `PaymentSession.data` and `Payment.data`.

**IMPORTANT:** Session data is accessible to the storefront. Never store secrets.

```typescript
export interface SessionData {
  provider: "your-provider"
  transId: string
  redirectUrl: string
  status: string
}
```

### 2.4 Constants and Enums
API endpoints, status mappings, etc.

```typescript
export const API_ENDPOINTS = {
  CREATE: "https://api.provider.com/v1/create",
  STATUS: "https://api.provider.com/v1/status",
  // ...
} as const

export const STATUS_MAP: Record<string, string> = {
  PROVIDER_PAID: "authorized",
  PROVIDER_CANCELLED: "canceled",
  PROVIDER_PENDING: "pending",
}
```

---

## Step 3: Implement the Service (`service.ts`)

### 3.1 Class Setup

```typescript
import { AbstractPaymentProvider, MedusaError } from "@medusajs/framework/utils"
import type { Logger } from "@medusajs/framework/types"
import { ProviderOptions } from "./types"

class MyPaymentService extends AbstractPaymentProvider<ProviderOptions> {
  static identifier = "my-provider"  // Used in provider ID: pp_my-provider_my-provider

  protected logger_: Logger
  protected options_: ProviderOptions

  static validateOptions(options: Record<string, unknown>): void {
    if (!options.merchantId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing merchantId"
      )
    }
  }

  constructor(container: Record<string, unknown>, options: ProviderOptions) {
    super(container, options)
    this.logger_ = (container.logger as Logger) || console
    this.options_ = options
  }
}
```

### 3.2 Required Methods

Every payment provider must implement these methods:

| Method | When Called | What It Does |
|--------|-----------|-------------|
| `initiatePayment` | Customer selects payment method | Create payment at provider, return redirect URL |
| `authorizePayment` | Cart completion (order placement) | Verify payment was authorized at provider |
| `capturePayment` | Admin captures payment | Capture funds at provider |
| `refundPayment` | Admin refunds payment | Refund via provider API |
| `cancelPayment` | Admin cancels order | Cancel payment at provider |
| `deletePayment` | Customer changes payment method | Clean up session at provider |
| `updatePayment` | Cart amount changes | Update or recreate payment |
| `retrievePayment` | Various | Fetch latest payment data |
| `getPaymentStatus` | Various | Get current status from provider |
| `getWebhookActionAndData` | Webhook received | Verify and map webhook to Medusa action |

### 3.3 The Redirect Flow (most common for CZ/PL providers)

```
1. initiatePayment()
   └─> POST to provider API → get transactionId + redirectUrl
   └─> Store in session.data: { transId, redirectUrl, status: "CREATED" }
   └─> Storefront reads session.data.redirectUrl, redirects customer

2. Customer pays on provider's page

3. Provider sends webhook POST to /hooks/payment/{identifier}_{id}
   └─> getWebhookActionAndData()
       └─> Verify status via provider's status API (IMPORTANT!)
       └─> Return { action: "authorized", data: { session_id, amount } }

4. Medusa creates the order automatically
```

### 3.4 Webhook Action Types

```typescript
// Return from getWebhookActionAndData():
{ action: "authorized" }   // → Medusa completes cart, creates order
{ action: "captured" }     // → Medusa captures the payment
{ action: "failed" }       // → Medusa marks payment as failed
{ action: "canceled" }     // → Medusa cancels the payment session
{ action: "pending" }      // → No action, wait for next webhook
{ action: "not_supported" } // → Ignore webhook
```

### 3.5 Data Flow Between Methods

```
initiatePayment() → stores data in PaymentSession.data
                     ↓
authorizePayment() → reads from PaymentSession.data
                     → stores in Payment.data
                     ↓
capturePayment()   → reads from Payment.data
refundPayment()    → reads from Payment.data
cancelPayment()    → reads from Payment.data
```

---

## Step 4: Create Module Export (`index.ts`)

```typescript
import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import MyPaymentService from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [MyPaymentService],
})
```

---

## Step 5: Register in `medusa-config.ts`

Add the provider to the payment module's providers array:

```typescript
{
  resolve: "@medusajs/medusa/payment",
  options: {
    providers: [
      // Existing providers...
      {
        resolve: "@medusajs/medusa/payment-stripe",
        id: "stripe",
        options: { /* ... */ },
      },
      // New provider:
      {
        resolve: "./src/modules/my-provider",
        id: "my-provider",
        options: {
          merchantId: process.env.MY_PROVIDER_MERCHANT_ID,
          secret: process.env.MY_PROVIDER_SECRET,
          test: process.env.MY_PROVIDER_TEST === "true",
        },
      },
    ],
  },
},
```

---

## Step 6: Assign to Region

Via Medusa Admin UI or API, assign the payment provider to the appropriate region(s):

```bash
# Via Admin API:
curl -X POST http://localhost:9000/admin/regions/{region_id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"payment_providers": ["pp_my-provider_my-provider"]}'
```

The provider ID format is: `pp_{identifier}_{id}` where:
- `identifier` = static identifier from the service class
- `id` = id from medusa-config.ts

---

## Step 7: Frontend Integration

### 7.1 Detect Provider in Checkout

```typescript
// In checkout, after customer selects payment session:
const session = cart.payment_session
if (session?.provider_id?.includes("comgate")) {
  // Redirect-based provider
  const redirectUrl = session.data?.redirectUrl
  if (redirectUrl) {
    window.location.href = redirectUrl
  }
}
```

### 7.2 Return URL Handling

After payment, the provider redirects back to your storefront.
Create a return page that checks the payment status:

```
/checkout/payment-return?transId=xxx&status=OK
```

---

## Step 8: Webhook Configuration

### 8.1 Medusa Webhook URL

Medusa automatically routes webhooks to: `/hooks/payment/{provider_id}`

For a provider with identifier "comgate" and id "comgate":
```
https://api.brightsign.cz/hooks/payment/comgate_comgate
```

### 8.2 Configure in Provider Dashboard

Set the webhook/callback URL in the payment provider's admin portal to point to your Medusa webhook endpoint.

---

## Step 9: Environment Variables

Add to `.env` (local) and `.env.production` (VPS):

```bash
# My Provider
MY_PROVIDER_MERCHANT_ID=xxx
MY_PROVIDER_SECRET=xxx
MY_PROVIDER_TEST=true
```

---

## Step 10: Testing

### 10.1 Unit Testing

Test the service methods directly:

```typescript
const service = new MyPaymentService(
  { logger: console },
  { merchantId: "test", secret: "test", test: true }
)

const result = await service.initiatePayment({
  amount: 10000,
  currency_code: "CZK",
})

expect(result.id).toBeDefined()
expect(result.data.redirectUrl).toBeDefined()
```

### 10.2 Integration Testing

1. Start Medusa locally with test credentials
2. Create a cart, add items
3. Select the new payment provider
4. Complete checkout flow
5. Verify webhook handling

### 10.3 Sandbox/Test Mode

Most providers have a sandbox environment. Use it:
- Set `test: true` in options
- Use sandbox credentials
- Test all flows: success, failure, refund, cancel

---

## Checklist

- [ ] `types.ts` — All API types defined
- [ ] `service.ts` — All methods implemented
- [ ] `index.ts` — ModuleProvider export
- [ ] `medusa-config.ts` — Provider registered
- [ ] `.env` — Credentials set (local)
- [ ] `.env.production` — Credentials set (VPS)
- [ ] Webhook URL configured in provider dashboard
- [ ] Region assigned to provider
- [ ] Frontend checkout handles redirect flow
- [ ] Frontend return page handles callback
- [ ] Tested: create payment
- [ ] Tested: successful payment + webhook
- [ ] Tested: failed payment
- [ ] Tested: refund
- [ ] Tested: cancel
- [ ] TypeScript check passes (`npx tsc --noEmit`)

---

## Reference Implementations

| Provider | Directory | Status | Notes |
|----------|-----------|--------|-------|
| Stripe | `@medusajs/medusa/payment-stripe` | Production | Embedded flow |
| Bank Transfer | `src/modules/bank-transfer/` | Production | Manual capture |
| Comgate | `src/modules/comgate/` | Ready | Redirect flow, CZ/SK |
| Przelewy24 | `src/modules/przelewy24/` | Skeleton | Redirect flow, PL |

---

## Common Pitfalls

1. **Always verify webhook data** — Never trust webhook payloads alone. Always verify the payment status via the provider's API.

2. **Don't store secrets in session data** — `PaymentSession.data` is accessible to the storefront. Only store non-sensitive data (transId, redirectUrl, status).

3. **Handle currency correctly** — Most providers use smallest currency units (halere, grosze, cents). Medusa also uses smallest units, so no conversion needed.

4. **Return proper status strings** — Medusa expects: "authorized", "captured", "pending", "canceled", "requires_more". Map provider statuses correctly.

5. **Log everything** — Use `this.logger_` for all API calls and responses. Payment debugging is hard without logs.

6. **Graceful degradation** — If a cancel or delete call to the provider fails, don't throw. The payment session should still be cleanable in Medusa.
