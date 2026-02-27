# Shipping Architecture — BrightSign EU E-shop

Per-region shipping provider system for multi-country B2B e-commerce.

## Overview

BrightSign EU e-shop uses Medusa.js v2 fulfillment provider system to support
multiple shipping carriers across different markets. Each region (CZ, SK, PL,
DE/AT, etc.) has its own set of shipping options tailored to local preferences
and dominant carriers.

Fulfillment providers are registered in `backend/medusa-config.ts` under the
`@medusajs/medusa/fulfillment` module and implement the
`AbstractFulfillmentProviderService` interface.

## Architecture Diagram

```
                 +-----------------+
                 |  Medusa Admin   |
                 |  (Fulfillment)  |
                 +--------+--------+
                          |
              +-----------+-----------+
              |                       |
     +--------v--------+    +--------v--------+
     | Shipping Option  |    | Shipping Option  |
     | (Region-bound)   |    | (Region-bound)   |
     +---------+--------+    +--------+--------+
               |                      |
    +----------v----------+  +--------v----------+
    | Fulfillment Provider |  | Fulfillment Provider |
    | (e.g., Packeta)      |  | (e.g., InPost)       |
    +----------+-----------+  +----------+-----------+
               |                         |
    +----------v----------+   +----------v----------+
    | External API         |   | External API         |
    | (Packeta REST/XML)   |   | (InPost ShipX REST)  |
    +----------------------+   +----------------------+
```

## Current State

### Packeta (Zasilkovna) — LIVE

- **Module:** `backend/src/modules/packeta/`
- **API client:** `backend/src/lib/packeta-client.ts`
- **Status:** Fully implemented, production-ready
- **Markets:** CZ, SK, PL, HU, RO (pickup + home delivery)
- **API:** XML-based REST at `https://www.zasilkovna.cz/api/rest`
- **Env vars:** `PACKETA_API_PASSWORD`, `PACKETA_SENDER_ID`, `PACKETA_API_KEY`

Packeta options:
| Option ID | Name | Type |
|-----------|------|------|
| `packeta-pickup` | Packeta Pickup Point | Pickup at Z-BOX / Z-Point |
| `packeta-home` | Packeta Home Delivery | Carrier-based to door |

### Standard Shipping — LIVE (via Medusa)

Flat-rate shipping options configured in Medusa admin for regions without
a dedicated provider. Uses manual fulfillment (no API integration).

### InPost (Paczkomaty) — SKELETON

- **Module:** `backend/src/modules/inpost/`
- **Status:** Skeleton implementation, types + service structure ready
- **Markets:** PL (primary), expanding to CZ
- **API:** ShipX REST at `https://api-shipx-pl.easypack24.net`
- **Env vars:** `INPOST_ORGANIZATION_ID`, `INPOST_ACCESS_TOKEN`, `INPOST_SANDBOX`

InPost options:
| Option ID | Name | Type |
|-----------|------|------|
| `inpost-paczkomat` | InPost Paczkomat | Automated parcel locker |
| `inpost-courier` | InPost Kurier | Courier to door |

## Planned Providers

### DHL (DE/AT) — PLANNED

- **Markets:** DE, AT
- **API:** DHL Parcel DE Shipping API (REST)
- **Why:** Dominant carrier in Germany/Austria, required for DACH market
- **Env vars (planned):** `DHL_API_KEY`, `DHL_API_SECRET`, `DHL_ACCOUNT_NUMBER`
- **Priority:** Medium — implement when DE/AT orders reach 5+/month

### Ceska posta (CZ) — PLANNED

- **Markets:** CZ
- **API:** Ceska posta Online Podani (SOAP/REST)
- **Why:** Some B2B customers prefer traditional post for invoicing
- **Env vars (planned):** `CESKAPOSTA_API_KEY`, `CESKAPOSTA_CONTRACT_ID`
- **Priority:** Low — Packeta covers most CZ delivery needs

### DPD (EU-wide) — CONSIDERED

- **Markets:** EU-wide, especially HU, RO
- **API:** DPD Web Services (SOAP/REST)
- **Why:** Good coverage in Central/Eastern Europe
- **Priority:** Low — evaluate when HU/RO market reaches threshold

## Shipping Options per Region

| Region | Country | Provider | Options | Pricing |
|--------|---------|----------|---------|---------|
| CZ | CZ | Packeta | Pickup Point, Home Delivery | Flat rate (admin) |
| CZ | CZ | Ceska posta (planned) | Standard, Registered | Flat rate |
| SK | SK | Packeta | Pickup Point, Home Delivery | Flat rate (admin) |
| PL | PL | Packeta | Pickup Point, Home Delivery | Flat rate (admin) |
| PL | PL | InPost (skeleton) | Paczkomat, Courier | Flat rate / API |
| EU | AT | Standard | Flat rate | Flat rate (admin) |
| EU | AT | DHL (planned) | Parcel, Express | API pricing |
| EU | DE | Standard | Flat rate | Flat rate (admin) |
| EU | DE | DHL (planned) | Parcel, Express | API pricing |
| EU | HU | Packeta | Pickup Point, Home Delivery | Flat rate (admin) |
| EU | RO | Packeta | Pickup Point, Home Delivery | Flat rate (admin) |

## How to Add a New Shipping Provider

### 1. Create module directory

```
backend/src/modules/{provider}/
  index.ts     — Module export (ModuleProvider)
  service.ts   — Fulfillment provider service
  types.ts     — TypeScript types for API
```

### 2. Implement the service

Extend `AbstractFulfillmentProviderService` from `@medusajs/framework/utils`.

Required methods:
```typescript
import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"

class MyProviderService extends AbstractFulfillmentProviderService {
  static identifier = "my-provider"

  // Return available shipping options
  async getFulfillmentOptions(): Promise<FulfillmentOption[]> { ... }

  // Validate data from storefront
  async validateFulfillmentData(...): Promise<Record<string, unknown>> { ... }

  // Validate option config from admin
  async validateOption(...): Promise<boolean> { ... }

  // Can this provider calculate prices dynamically?
  async canCalculate(...): Promise<boolean> { ... }

  // Calculate price (if canCalculate returns true)
  async calculatePrice(...): Promise<CalculatedShippingOptionPrice> { ... }

  // Create shipment at carrier API
  async createFulfillment(...): Promise<CreateFulfillmentResult> { ... }

  // Cancel shipment
  async cancelFulfillment(...): Promise<Record<string, unknown>> { ... }

  // Create return shipment
  async createReturnFulfillment(...): Promise<CreateFulfillmentResult> { ... }

  // Document retrieval methods (can return empty arrays)
  async getFulfillmentDocuments(...): Promise<never[]> { ... }
  async getReturnDocuments(...): Promise<never[]> { ... }
  async getShipmentDocuments(...): Promise<never[]> { ... }
  async retrieveDocuments(...): Promise<void> { ... }
}
```

### 3. Create module export

```typescript
// index.ts
import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import MyProviderService from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [MyProviderService],
})
```

### 4. Register in medusa-config.ts

Add the provider to the existing fulfillment module configuration:

```typescript
{
  resolve: "@medusajs/medusa/fulfillment",
  options: {
    providers: [
      // ... existing providers
      {
        resolve: "./src/modules/my-provider",
        id: "my-provider",
        options: {
          apiKey: process.env.MY_PROVIDER_API_KEY,
          // ... other options
        },
      },
    ],
  },
},
```

### 5. Configure shipping options in Medusa admin

After registering the provider:
1. Go to Medusa Admin > Settings > Shipping
2. Select the target region (e.g., PL)
3. Add shipping option → select your provider
4. Set pricing (flat rate or calculated)
5. Configure any provider-specific metadata

### 6. Storefront integration

If the provider requires a widget (e.g., point selector):
- Add the widget script to storefront
- Store selected data in checkout metadata
- Read metadata in `createFulfillment()` method

Examples:
- Packeta: `metadata.packeta_point_id` (pickup point ID)
- InPost: `metadata.inpost_point_name` (Paczkomat name, e.g., "KRA012")

### 7. Add env variables

Add required env vars to:
- `.env` (local development)
- `.env.production.template` (documentation)
- VPS `.env.production` (production)

## Provider Comparison (BrightSign context)

| Feature | Packeta | InPost | DHL |
|---------|---------|--------|-----|
| Pickup points | 12,000+ (CZ/SK/PL) | 20,000+ (PL) | 3,000+ (DE) |
| Home delivery | Yes (carrier-based) | Yes (own courier) | Yes |
| API type | XML REST | JSON REST | JSON REST |
| Label generation | Yes (PDF) | Yes (PDF/ZPL) | Yes (PDF) |
| Tracking | Yes | Yes | Yes |
| Returns support | Manual | API-supported | API-supported |
| COD | Yes | Yes | Yes |
| Insurance | Yes | Yes | Yes |
| Ideal for | CZ/SK + PL/HU/RO | PL market | DE/AT market |
| Pricing model | Negotiated rates | Negotiated rates | API + contract |

## Environment Variables Summary

```bash
# Packeta (LIVE)
PACKETA_API_PASSWORD=       # REST API password
PACKETA_SENDER_ID=          # E-shop ID (eshop)
PACKETA_API_KEY=            # Widget API key (storefront)

# InPost (SKELETON — ready for activation)
INPOST_ORGANIZATION_ID=     # Organization ID from InPost Manager
INPOST_ACCESS_TOKEN=        # API access token (Bearer)
INPOST_SANDBOX=true         # true for sandbox, false for production
INPOST_SENDER_EMAIL=        # Default sender email (optional)
INPOST_SENDER_PHONE=        # Default sender phone (optional)

# DHL (PLANNED)
# DHL_API_KEY=
# DHL_API_SECRET=
# DHL_ACCOUNT_NUMBER=

# Ceska posta (PLANNED)
# CESKAPOSTA_API_KEY=
# CESKAPOSTA_CONTRACT_ID=
```

## File Structure

```
backend/src/modules/
  packeta/                    # Packeta (CZ/SK/PL/HU/RO) — LIVE
    index.ts                  # Module export
    service.ts                # Fulfillment provider service
  inpost/                     # InPost (PL) — SKELETON
    index.ts                  # Module export
    service.ts                # Fulfillment provider service
    types.ts                  # TypeScript types for ShipX API
  (dhl/)                      # DHL (DE/AT) — PLANNED
  (ceskaposta/)               # Ceska posta (CZ) — PLANNED

backend/src/lib/
  packeta-client.ts           # Packeta REST/XML API client

docs/
  SHIPPING-ARCHITECTURE.md    # This file
```
