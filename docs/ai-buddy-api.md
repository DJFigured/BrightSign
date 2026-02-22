# AI Buddy API — BrightSign Medusa Integration

Custom REST API endpoints for the AI Buddy command center dashboard.

## Base URL

- Local: `http://localhost:9000`
- Production: `http://91.99.49.122:9000`

## Authentication

All endpoints except `/health` require Bearer token authentication.

```
Authorization: Bearer {AI_BUDDY_API_KEY}
```

The API key is set in the backend `.env` file as `AI_BUDDY_API_KEY`.

---

## Endpoints

### 1. Health Check (no auth)

```
GET /store/ai-buddy/health
```

Used for "Test Connection" button in AI Buddy Settings.

```bash
curl http://localhost:9000/store/ai-buddy/health
```

Response:
```json
{
  "status": "ok",
  "store": "BrightSign EU",
  "medusa": "2.13.1",
  "products": 24,
  "series": { "S6": 4, "S5": 12, "S4": 8 },
  "regions": ["CZ", "SK", "PL", "EU"],
  "currencies": ["CZK", "EUR", "PLN"],
  "customerGroups": ["retail", "b2b_standard", "b2b_volume", "b2b_partner"],
  "features": { "b2b": true, "stripe": true, "inventory": true, "vies": true, "s3Images": true },
  "warehouse": "BrightSign CZ Warehouse",
  "timestamp": "2026-02-22T09:00:00Z"
}
```

---

### 2. Dashboard (main aggregated endpoint)

```
GET /store/ai-buddy/dashboard
Authorization: Bearer {KEY}
```

Called every 5 minutes. Returns complete business overview.

```bash
curl -H "Authorization: Bearer $KEY" http://localhost:9000/store/ai-buddy/dashboard
```

Response includes:
- `orders` — counts by period (today/week/month) and status
- `revenue` — sums by currency per period
- `inventory` — total products, low stock alerts, clearance count
- `recentOrders` — last 10 orders with customer + items
- `topProducts` — top 5 selling products this month
- `b2b` — B2B customer count, pending approvals
- `byRegion` — orders and revenue per region
- `bySerie` — sales breakdown by S4/S5/S6
- `lastUpdated` — ISO timestamp

---

### 3. Inventory

```
GET /store/ai-buddy/inventory
Authorization: Bearer {KEY}
```

Full inventory with stock levels, prices, and alerts.

```bash
curl -H "Authorization: Bearer $KEY" http://localhost:9000/store/ai-buddy/inventory
```

Response includes `products[]` array with:
- `sku`, `serie`, `family`, `stock`, `reserved`, `available`
- `threshold` (S5/S6=10, S4=3), `status` (ok/low/out)
- `prices` by currency, `thumbnail`, `hasImage`

Plus `summary` with totals and `bySerie` breakdown.

---

### 4. Orders (filtered)

```
GET /store/ai-buddy/orders?status=pending&region=CZ&serie=S5&b2b=true&since=2026-02-01&limit=25&page=1
Authorization: Bearer {KEY}
```

All query params are optional:
| Param | Values | Default |
|-------|--------|---------|
| status | pending, processing, shipped, delivered, cancelled | all |
| region | CZ, SK, PL, EU | all |
| serie | S4, S5, S6 | all |
| b2b | true, false | all |
| since | ISO date | none |
| until | ISO date | none |
| limit | 1-100 | 25 |
| page | 1+ | 1 |

```bash
curl -H "Authorization: Bearer $KEY" "http://localhost:9000/store/ai-buddy/orders?status=pending&limit=10"
```

---

### 5. Revenue

```
GET /store/ai-buddy/revenue?from=2026-01-01&to=2026-02-22&granularity=daily
Authorization: Bearer {KEY}
```

| Param | Values | Default |
|-------|--------|---------|
| from | ISO date | 30 days ago |
| to | ISO date | now |
| granularity | daily, weekly, monthly | daily |

```bash
curl -H "Authorization: Bearer $KEY" "http://localhost:9000/store/ai-buddy/revenue?granularity=weekly"
```

Response includes:
- `timeline[]` — revenue per date/week/month bucket
- `byRegion[]` — per region with share %
- `byProduct[]` — per SKU
- `bySerie[]` — S4/S5/S6 breakdown
- `byCustomerType` — retail vs b2b
- `totals` — grand totals per currency

---

### 6. B2B Customers

```
GET /store/ai-buddy/b2b
Authorization: Bearer {KEY}
```

```bash
curl -H "Authorization: Bearer $KEY" http://localhost:9000/store/ai-buddy/b2b
```

Response includes:
- `customers.total`, `customers.byGroup`, `customers.recent[]`
- `discountTiers` — b2b_standard=10%, b2b_volume=15%, b2b_partner=20%
- `viesCountries` — supported VIES validation countries
- `inquiries` — currently empty (inquiries sent via email, not stored in DB)

---

## Data Notes

- **Prices are in minor units** (CZK halere, EUR cents, PLN grosze)
- **SKU → Serie mapping:** last digit of numeric part (4=S4, 5=S5, 6=S6)
- **Stock thresholds:** S5/S6 = 10 units, S4 (clearance) = 3 units
- **B2B inquiries** are sent via Resend email and not persisted in DB
- **24 products total:** 4 S6, 12 S5, 8 S4 (clearance)
