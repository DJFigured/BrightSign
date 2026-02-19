# AI_AGENTS.md - n8n Automation Workflows

## 🤖 Automation Strategy

**Goal:** Enable one-person operation of multi-country e-shop through intelligent automation.

### Agent Overview

| Agent | Purpose | Trigger | Priority |
|-------|---------|---------|----------|
| Order Processor | Handle new orders | Order webhook | P0 |
| Customer Support | AI-powered replies | Email/form | P1 |
| Stock Monitor | Track COMM-TEC inventory | Schedule (daily) | P2 |
| Price Watcher | Monitor competitors | Schedule (weekly) | P2 |
| Translation Bot | Translate new content | Product webhook | P2 |
| Review Collector | Request reviews | Order completed | P3 |

---

## 📦 Agent 1: Order Processor

### Purpose
Automate order processing from placement to fulfillment.

### Workflow Diagram
```
┌─────────────────┐
│ Webhook:        │
│ order.placed    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Check COMM-TEC  │
│ Stock (scrape)  │
└────────┬────────┘
         ▼
    ┌────┴────┐
    │ Stock?  │
    └────┬────┘
    Yes  │  No
    ▼    ▼
┌───────┐ ┌───────────┐
│Create │ │Notify:    │
│COMM-  │ │Backorder  │
│TEC    │ │needed     │
│Order  │ └───────────┘
└───┬───┘
    ▼
┌─────────────────┐
│ Create Packeta  │
│ Shipment        │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Generate Label  │
│ (PDF)           │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Update Medusa   │
│ Order Status    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Send Slack/     │
│ Telegram Alert  │
└─────────────────┘
```

### n8n Workflow JSON

```json
{
  "name": "Order Processor",
  "nodes": [
    {
      "name": "Webhook - Order Placed",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "order-placed",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Extract Order Data",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            { "name": "order_id", "value": "={{$json.order_id}}" },
            { "name": "customer_email", "value": "={{$json.email}}" },
            { "name": "items", "value": "={{JSON.stringify($json.items)}}" }
          ]
        }
      }
    },
    {
      "name": "Check COMM-TEC Stock",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://your-stock-api/check",
        "method": "POST",
        "body": {
          "skus": "={{$json.items.map(i => i.sku)}}"
        }
      }
    },
    {
      "name": "Stock Available?",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "boolean": [
            { "value1": "={{$json.all_in_stock}}", "value2": true }
          ]
        }
      }
    },
    {
      "name": "Create Packeta Shipment",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://www.zasilkovna.cz/api/rest/packet",
        "method": "POST",
        "authentication": "genericCredentialType",
        "body": {
          "apiPassword": "={{$env.PACKETA_API_PASSWORD}}",
          "packetAttributes": {
            "number": "={{$node['Extract Order Data'].json.order_id}}",
            "name": "={{$json.shipping.first_name}}",
            "surname": "={{$json.shipping.last_name}}",
            "email": "={{$json.email}}",
            "addressId": "={{$json.packeta_point_id}}",
            "weight": 0.5
          }
        }
      }
    },
    {
      "name": "Update Medusa Order",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{$env.MEDUSA_URL}}/admin/orders/{{$json.order_id}}",
        "method": "POST",
        "headers": {
          "x-medusa-access-token": "={{$env.MEDUSA_ADMIN_TOKEN}}"
        },
        "body": {
          "metadata": {
            "packeta_id": "={{$json.packet.id}}",
            "tracking_number": "={{$json.packet.barcode}}"
          }
        }
      }
    },
    {
      "name": "Send Telegram Alert",
      "type": "n8n-nodes-base.telegram",
      "parameters": {
        "chatId": "={{$env.TELEGRAM_CHAT_ID}}",
        "text": "🛒 Nová objednávka #{{$json.order_id}}\n💰 {{$json.total}} CZK\n📦 Packeta: {{$json.packeta_id}}"
      }
    }
  ]
}
```

---

## 💬 Agent 2: Customer Support AI

### Purpose
AI-powered first response to customer inquiries with human escalation.

### Workflow Diagram
```
┌─────────────────┐
│ Email Received  │
│ (IMAP trigger)  │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Classify Intent │
│ (Claude API)    │
└────────┬────────┘
         ▼
    ┌────┴────────────┐
    │ Intent Type?    │
    └────┬────────────┘
         │
    ┌────┼────┬────┬────┐
    ▼    ▼    ▼    ▼    ▼
Product Order Tech  Quote Complex
Info   Status Sup.  Req.
    │    │    │      │    │
    ▼    ▼    ▼      ▼    ▼
┌───────────────────────────┐
│ Generate Response         │
│ (Claude API with context) │
└────────────┬──────────────┘
             ▼
        ┌────┴────┐
        │Confident│
        │  >80%?  │
        └────┬────┘
        Yes  │  No
        ▼    ▼
┌────────┐ ┌────────────┐
│Auto-   │ │Send to     │
│reply   │ │Human Queue │
└────────┘ └────────────┘
```

### Claude API Prompt for Classification

```typescript
const classificationPrompt = `
You are a customer support classifier for BrightSign.cz, a B2B e-shop 
selling digital signage players.

Classify this customer email into one of these categories:
- PRODUCT_INFO: Questions about product specifications, features, compatibility
- ORDER_STATUS: Questions about existing orders, shipping, delivery
- TECHNICAL_SUPPORT: Technical issues, setup help, troubleshooting
- QUOTE_REQUEST: Requests for custom pricing, volume discounts
- COMPLAINT: Issues with orders, returns, refunds
- GENERAL: Other inquiries

Also rate your confidence (0-100) and detect the language.

Email:
"""
${email.body}
"""

Respond in JSON format:
{
  "category": "PRODUCT_INFO",
  "confidence": 85,
  "language": "cs",
  "key_entities": ["HD225", "4K", "HDMI"],
  "sentiment": "neutral",
  "urgency": "low"
}
`;
```

### Response Generation Prompt

```typescript
const responsePrompt = `
You are a helpful customer support agent for BrightSign.cz.
Your name is "BrightSign tým" (BrightSign team).

Context:
- We sell BrightSign digital signage players
- We are an authorized Czech reseller
- B2B customers get 10-20% discount
- Shipping: 2-5 days via Packeta
- Support: info@brightsign.cz, +420 XXX XXX XXX

Customer inquiry (${category}):
"""
${email.body}
"""

${category === 'PRODUCT_INFO' ? `
Relevant product info:
${productContext}
` : ''}

${category === 'ORDER_STATUS' ? `
Order details:
${orderContext}
` : ''}

Write a helpful, professional response in ${language}.
Be concise but thorough. Sign as "BrightSign tým".
If you're not 100% sure, suggest they contact us directly.
`;
```

### n8n Implementation Notes

```javascript
// Node: Claude API Call
const response = await $http.post('https://api.anthropic.com/v1/messages', {
  headers: {
    'x-api-key': $env.CLAUDE_API_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: classificationPrompt }
    ]
  }
});

// Parse and route based on classification
const classification = JSON.parse(response.content[0].text);

if (classification.confidence > 80 && 
    !['COMPLAINT', 'QUOTE_REQUEST'].includes(classification.category)) {
  // Auto-reply
  return { autoReply: true, response: generatedResponse };
} else {
  // Human review
  return { autoReply: false, queue: 'human_review' };
}
```

---

## 📊 Agent 3: Stock Monitor

### Purpose
Daily check of COMM-TEC stock levels and price changes.

### Workflow
```
┌─────────────────┐
│ Schedule:       │
│ Daily 6:00 AM   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Login to        │
│ COMM-TEC Portal │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Scrape Product  │
│ Pages           │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Parse Stock &   │
│ Prices          │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Compare with    │
│ Previous Day    │
└────────┬────────┘
         ▼
    ┌────┴────┐
    │Changes? │
    └────┬────┘
    Yes  │  No
    ▼    ▼
┌────────┐ ┌────────┐
│Update  │ │Log     │
│Medusa  │ │"No     │
│Stock   │ │changes"│
└───┬────┘ └────────┘
    ▼
┌─────────────────┐
│ Alert if:       │
│ - Low stock <5  │
│ - Price change  │
│ - Out of stock  │
└─────────────────┘
```

### Scraping Logic (Puppeteer/Playwright)

```javascript
// Using Playwright in n8n Code node
const { chromium } = require('playwright');

async function scrapeCommtec() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Login
  await page.goto('https://portal.comm-tec.de/login');
  await page.fill('#username', process.env.COMMTEC_USERNAME);
  await page.fill('#password', process.env.COMMTEC_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  
  // Navigate to BrightSign products
  await page.goto('https://portal.comm-tec.de/products?brand=brightsign');
  
  // Extract data
  const products = await page.evaluate(() => {
    const rows = document.querySelectorAll('.product-row');
    return Array.from(rows).map(row => ({
      sku: row.querySelector('.sku').textContent.trim(),
      name: row.querySelector('.name').textContent.trim(),
      stock: parseInt(row.querySelector('.stock').textContent),
      price: parseFloat(row.querySelector('.price').textContent.replace('€', '')),
    }));
  });
  
  await browser.close();
  return products;
}
```

---

## 💰 Agent 4: Price Watcher

### Purpose
Monitor competitor prices weekly to ensure competitive positioning.

### Competitors to Monitor

| Competitor | URL | Region |
|------------|-----|--------|
| brightsign-shop.eu | brightsign-shop.eu | NL/EU |
| Office Partner | office-partner.de | DE |
| Daars.pl | daars.pl | PL |
| Videopart.hu | videopart.hu | HU |

### Workflow
```
┌─────────────────┐
│ Schedule:       │
│ Monday 8:00 AM  │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Scrape each     │
│ competitor site │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Extract prices  │
│ for key SKUs    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Compare with    │
│ our prices      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Generate report │
│ (spreadsheet)   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Send weekly     │
│ price report    │
└─────────────────┘
```

### Report Format

```markdown
# Weekly Price Report - {{date}}

## Summary
- Products monitored: 15
- Price alerts: 3
- Recommended actions: 2

## Price Comparison Matrix

| Product | Our Price | brightsign-shop.eu | Office Partner | Daars.pl | Status |
|---------|-----------|-------------------|----------------|----------|--------|
| HD225 | €591 | €620 | €480 | €720 | ✅ Competitive |
| XT1145 | €1048 | €1100 | €890 | €1200 | ⚠️ High vs DE |

## Recommendations
1. Consider reducing XT1145 price by 5% to match DE market
2. HD225 well-positioned in all markets

## Historical Trends
[Chart: 30-day price movements]
```

---

## 🌐 Agent 5: Translation Bot

### Purpose
Automatically translate new product content to all supported languages.

### Workflow
```
┌─────────────────┐
│ Webhook:        │
│ product.created │
│ product.updated │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Detect source   │
│ language        │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Get target      │
│ languages       │
│ [sk, pl, en]    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Translate via   │
│ Claude API      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Store in Medusa │
│ product.metadata│
└────────┬────────┘
         ▼
┌─────────────────┐
│ Flag for human  │
│ review          │
└─────────────────┘
```

### Translation Prompt

```typescript
const translationPrompt = `
Translate this e-commerce product content from ${sourceLang} to ${targetLang}.

Maintain:
- Technical accuracy (digital signage terminology)
- SEO-friendly language
- Professional tone
- Keep brand names (BrightSign, HDMI, etc.) unchanged

Content to translate:
Title: ${product.title}
Description: ${product.description}
Short Description: ${product.subtitle}

Respond in JSON:
{
  "title": "...",
  "description": "...",
  "subtitle": "..."
}
`;
```

---

## ⭐ Agent 6: Review Collector

### Purpose
Request reviews from customers after successful delivery.

### Workflow
```
┌─────────────────┐
│ Webhook:        │
│ order.fulfilled │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Wait 7 days     │
│ (delay node)    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Check order     │
│ not returned    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Send review     │
│ request email   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ If no response  │
│ after 7 days,   │
│ send reminder   │
└─────────────────┘
```

### Email Template

```html
Subject: Jak se vám líbí váš BrightSign {{product_name}}?

Dobrý den {{first_name}},

před týdnem jsme vám doručili {{product_name}}. 
Rádi bychom slyšeli, jak jste s ním spokojeni.

[⭐⭐⭐⭐⭐ Ohodnotit nákup]

Vaše zpětná vazba nám pomáhá zlepšovat naše služby.

Děkujeme,
BrightSign tým
```

---

## 🔧 n8n Setup Instructions

### 1. Installation on Coolify

```yaml
# docker-compose.yml for n8n
services:
  n8n:
    image: n8nio/n8n:latest
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=n8n.brightsign.cz
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.brightsign.cz
    volumes:
      - n8n_data:/home/node/.n8n
    ports:
      - "5678:5678"
```

### 2. Required Credentials

| Credential | Type | Used By |
|------------|------|---------|
| Medusa Admin | HTTP Header Auth | All agents |
| Claude API | API Key | Support, Translation |
| Telegram | Bot Token | Order alerts |
| IMAP Email | OAuth2/Basic | Support agent |
| Packeta | API Key | Order processor |

### 3. Environment Variables for n8n

```env
# Medusa
MEDUSA_URL=https://api.brightsign.cz
MEDUSA_ADMIN_TOKEN=...

# Claude
CLAUDE_API_KEY=sk-ant-...

# Notifications
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# COMM-TEC
COMMTEC_USERNAME=...
COMMTEC_PASSWORD=...

# Packeta
PACKETA_API_PASSWORD=...
```

---

## 📊 Automation Metrics to Track

| Metric | Target | Measurement |
|--------|--------|-------------|
| Order processing time | < 5 min | Webhook to label |
| Support auto-reply rate | > 60% | Auto vs human |
| Stock sync accuracy | > 95% | Manual spot checks |
| Translation quality | > 90% | Human review sample |
| Alert response time | < 1 hour | Notification to action |
