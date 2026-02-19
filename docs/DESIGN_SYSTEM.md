# DESIGN_SYSTEM.md - Brand Guidelines & UI Components

## 🎨 Brand Identity

### Brand Positioning
**"Your BrightSign Expert in Central Europe"**

We are an authorized reseller, NOT pretending to be BrightSign official. 
Professional, trustworthy, specialist focus.

### Brand Values
1. **Expertise** - Deep product knowledge
2. **Reliability** - Fast delivery, accurate info
3. **Accessibility** - Local language, local support
4. **Value** - Competitive pricing, B2B benefits

## 🎨 Color Palette

### Primary Colors (from BrightSign brand)
```css
:root {
  /* Primary - Dark Blue/Purple */
  --color-primary: #1a2b4a;
  --color-primary-light: #2d4a7c;
  --color-primary-dark: #0f1a2e;
  
  /* Accent - BrightSign Green */
  --color-accent: #00c389;
  --color-accent-light: #00e6a0;
  --color-accent-dark: #00a070;
  
  /* Neutral */
  --color-background: #f5f7fa;
  --color-surface: #ffffff;
  --color-text: #1a1a1a;
  --color-text-muted: #6b7280;
  --color-border: #e5e7eb;
  
  /* Semantic */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}
```

### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a2b4a',
          light: '#2d4a7c',
          dark: '#0f1a2e',
        },
        accent: {
          DEFAULT: '#00c389',
          light: '#00e6a0',
          dark: '#00a070',
        },
      },
    },
  },
};
```

## 🔤 Typography

### Font Stack
```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Type Scale
| Name | Size | Weight | Use |
|------|------|--------|-----|
| Display | 48px / 3rem | 700 | Hero headlines |
| H1 | 36px / 2.25rem | 700 | Page titles |
| H2 | 30px / 1.875rem | 600 | Section headers |
| H3 | 24px / 1.5rem | 600 | Card titles |
| H4 | 20px / 1.25rem | 600 | Subsections |
| Body | 16px / 1rem | 400 | Default text |
| Small | 14px / 0.875rem | 400 | Captions, meta |
| XSmall | 12px / 0.75rem | 400 | Labels, badges |

## 📐 Spacing System

```css
/* 4px base unit */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

## 🧱 Component Library

### Buttons

```jsx
// Primary Button
<button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold 
  hover:bg-primary-light transition-colors">
  Přidat do košíku
</button>

// Secondary Button
<button className="border-2 border-primary text-primary px-6 py-3 rounded-lg 
  font-semibold hover:bg-primary hover:text-white transition-colors">
  Zobrazit detail
</button>

// Accent Button (CTA)
<button className="bg-accent text-white px-6 py-3 rounded-lg font-semibold 
  hover:bg-accent-dark transition-colors">
  Získat B2B slevu
</button>

// Ghost Button
<button className="text-primary px-6 py-3 rounded-lg font-semibold 
  hover:bg-gray-100 transition-colors">
  Zrušit
</button>
```

### Product Card

```jsx
<div className="bg-white rounded-xl shadow-sm border border-gray-100 
  overflow-hidden hover:shadow-md transition-shadow">
  {/* Image */}
  <div className="aspect-square bg-gray-50 p-4">
    <img src={product.image} alt={product.name} 
      className="w-full h-full object-contain" />
  </div>
  
  {/* Content */}
  <div className="p-4">
    {/* Category */}
    <span className="text-xs text-gray-500 uppercase tracking-wide">
      {product.category}
    </span>
    
    {/* Title */}
    <h3 className="font-semibold text-lg mt-1 text-gray-900">
      {product.name}
    </h3>
    
    {/* Short description */}
    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
      {product.shortDescription}
    </p>
    
    {/* Price */}
    <div className="mt-4 flex items-baseline gap-2">
      <span className="text-2xl font-bold text-primary">
        {formatPrice(product.price)}
      </span>
      <span className="text-sm text-gray-500">bez DPH</span>
    </div>
    
    {/* Stock indicator */}
    <div className="mt-2 flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${
        product.inStock ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span className="text-sm text-gray-600">
        {product.inStock ? 'Skladem' : 'Na objednávku'}
      </span>
    </div>
    
    {/* CTA */}
    <button className="w-full mt-4 bg-primary text-white py-3 rounded-lg 
      font-semibold hover:bg-primary-light transition-colors">
      Do košíku
    </button>
  </div>
</div>
```

### Navigation Header

```jsx
<header className="bg-white border-b border-gray-100 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4">
    {/* Top bar */}
    <div className="flex items-center justify-between py-2 text-sm border-b border-gray-100">
      <div className="flex items-center gap-4 text-gray-600">
        <span>📞 +420 XXX XXX XXX</span>
        <span>✉️ info@brightsign.cz</span>
      </div>
      <div className="flex items-center gap-4">
        {/* Language switcher */}
        <select className="text-sm bg-transparent">
          <option>🇨🇿 Čeština</option>
          <option>🇸🇰 Slovenčina</option>
          <option>🇬🇧 English</option>
        </select>
        {/* B2B login */}
        <a href="/b2b" className="text-accent font-medium hover:underline">
          B2B přihlášení
        </a>
      </div>
    </div>
    
    {/* Main nav */}
    <div className="flex items-center justify-between py-4">
      {/* Logo */}
      <a href="/" className="flex items-center gap-2">
        <img src="/logo.svg" alt="BrightSign.cz" className="h-10" />
        <span className="text-xs text-gray-500">Autorizovaný prodejce</span>
      </a>
      
      {/* Search */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <input type="search" placeholder="Hledat produkty..." 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 
              focus:ring-accent focus:border-transparent" />
          <button className="absolute right-2 top-1/2 -translate-y-1/2">
            🔍
          </button>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-4">
        <a href="/cart" className="relative">
          🛒
          <span className="absolute -top-2 -right-2 bg-accent text-white 
            text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        </a>
      </div>
    </div>
    
    {/* Mega menu */}
    <nav className="py-2 flex items-center gap-6 text-sm font-medium">
      <a href="/serie-5" className="hover:text-accent">Série 5 (aktuální)</a>
      <a href="/serie-4" className="hover:text-accent">Série 4</a>
      <a href="/prislusenstvi" className="hover:text-accent">Příslušenství</a>
      <a href="/reseni" className="hover:text-accent">Řešení podle odvětví</a>
      <a href="/podpora" className="hover:text-accent">Podpora</a>
      <a href="/b2b" className="text-accent font-semibold">Pro firmy →</a>
    </nav>
  </div>
</header>
```

### Footer

```jsx
<footer className="bg-primary text-white">
  <div className="max-w-7xl mx-auto px-4 py-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Company */}
      <div>
        <img src="/logo-white.svg" alt="BrightSign.cz" className="h-8 mb-4" />
        <p className="text-gray-300 text-sm">
          Autorizovaný prodejce BrightSign pro Českou republiku a Slovensko.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <img src="/brightsign-partner-badge.svg" alt="BrightSign Partner" 
            className="h-12" />
        </div>
      </div>
      
      {/* Products */}
      <div>
        <h4 className="font-semibold mb-4">Produkty</h4>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li><a href="/ls-serie" className="hover:text-white">LS Série</a></li>
          <li><a href="/hd-serie" className="hover:text-white">HD Série</a></li>
          <li><a href="/xd-serie" className="hover:text-white">XD Série</a></li>
          <li><a href="/xt-serie" className="hover:text-white">XT Série</a></li>
          <li><a href="/xc-serie" className="hover:text-white">XC Série</a></li>
        </ul>
      </div>
      
      {/* Support */}
      <div>
        <h4 className="font-semibold mb-4">Podpora</h4>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li><a href="/kontakt" className="hover:text-white">Kontakt</a></li>
          <li><a href="/faq" className="hover:text-white">Časté dotazy</a></li>
          <li><a href="/dokumentace" className="hover:text-white">Dokumentace</a></li>
          <li><a href="/reklamace" className="hover:text-white">Reklamace</a></li>
        </ul>
      </div>
      
      {/* Contact */}
      <div>
        <h4 className="font-semibold mb-4">Kontakt</h4>
        <address className="text-gray-300 text-sm not-italic space-y-2">
          <p>Make more s.r.o.</p>
          <p>📞 +420 XXX XXX XXX</p>
          <p>✉️ info@brightsign.cz</p>
          <p>IČO: XXXXXXXX</p>
          <p>DIČ: CZXXXXXXXX</p>
        </address>
      </div>
    </div>
    
    {/* Bottom */}
    <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row 
      items-center justify-between text-sm text-gray-400">
      <p>© 2025 Make more s.r.o. Všechna práva vyhrazena.</p>
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <a href="/obchodni-podminky" className="hover:text-white">Obchodní podmínky</a>
        <a href="/ochrana-udaju" className="hover:text-white">Ochrana údajů</a>
        <a href="/cookies" className="hover:text-white">Cookies</a>
      </div>
    </div>
  </div>
</footer>
```

## 📱 Responsive Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Mobile-first Approach
- Design for mobile first
- Add complexity for larger screens
- Touch-friendly tap targets (min 44px)
- Thumb-reachable navigation on mobile

## 🖼️ Imagery Guidelines

### Product Images
- **Format:** WebP with PNG fallback
- **Size:** 800x800px minimum (square)
- **Background:** White or transparent
- **Style:** Clean, professional, consistent lighting
- **Source:** Download from brightsign.biz or COMM-TEC

### Hero Images
- **Size:** 1920x1080px (16:9)
- **Style:** Lifestyle shots showing BrightSign in use
- **Source:** BrightSign marketing materials

### Icons
- **Set:** Lucide Icons (open source)
- **Size:** 24px default, 20px small, 32px large
- **Color:** Inherit from text or accent

## 🎭 Animation Guidelines

### Transitions
```css
/* Default transition */
transition: all 0.2s ease-in-out;

/* Hover states */
transition: transform 0.2s, box-shadow 0.2s;

/* Page transitions */
transition: opacity 0.3s ease-in-out;
```

### Motion Principles
- Subtle, not distracting
- Purposeful (indicates state change)
- Respect `prefers-reduced-motion`
- No animations on initial page load

## 📋 Reference Sites

### Official (inspiration)
- **brightsign.biz** - Official BrightSign website
- Use their imagery, product descriptions as base

### Competitors (what to beat)
- **brightsign-shop.eu** - Netherlands, clean design
- **visunext.de** - German, professional B2B focus

### Current site (migrate from)
- **brightsign.cz** - Shoptet, basic design
- Keep familiar elements for existing customers

## ✅ Design Checklist

- [ ] Logo in SVG format (color + white versions)
- [ ] Favicon (16x16, 32x32, apple-touch-icon)
- [ ] Open Graph image (1200x630)
- [ ] Product images optimized (WebP)
- [ ] Mobile navigation tested
- [ ] Forms accessibility (labels, errors)
- [ ] Loading states for all async actions
- [ ] Empty states (cart, search results)
- [ ] Error pages (404, 500)
- [ ] Print stylesheet for invoices
