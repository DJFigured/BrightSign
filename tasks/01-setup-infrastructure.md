# Task 01: Infrastructure Setup

## Overview
Set up the hosting infrastructure on Hetzner with Coolify for deployment management.

**Duration:** 1-2 days
**Priority:** P0 (Critical path)

---

## Prerequisites

- [ ] Hetzner Cloud account (hetzner.com)
- [ ] GitHub account with SSH key
- [ ] Domain DNS access (Wedos for SK/PL/EU, Shoptet for CZ)
- [ ] Credit card for Hetzner billing

---

## Step 1: Create Hetzner VPS

### 1.1 Log into Hetzner Cloud Console
- Go to https://console.hetzner.cloud
- Create new project: "BrightSign E-shop"

### 1.2 Create Server
- Click "Add Server"
- Location: **Falkenstein** (closest to CZ)
- Image: **Ubuntu 24.04**
- Type: **CAX21** (Arm64, 4GB RAM, 2 vCPU) - €4.51/month
- Networking: Public IPv4 + IPv6
- SSH Key: Add your public key
- Name: `brightsign-prod`

### 1.3 Note Server Details
```
IPv4: ___.___.___.___ 
IPv6: ____:____:____:____::1
```

---

## Step 2: Initial Server Configuration

### 2.1 Connect via SSH
```bash
ssh root@<server-ip>
```

### 2.2 Update System
```bash
apt update && apt upgrade -y
```

### 2.3 Set Timezone
```bash
timedatectl set-timezone Europe/Prague
```

### 2.4 Configure Firewall
```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw allow 8000  # Coolify
ufw enable
```

---

## Step 3: Install Coolify

### 3.1 Run Coolify Installer
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### 3.2 Wait for Installation
- Takes 2-5 minutes
- Creates Docker containers for Coolify

### 3.3 Access Coolify UI
- Open: `http://<server-ip>:8000`
- Create admin account
- Complete initial setup wizard

---

## Step 4: Configure Coolify

### 4.1 Add Server
- Go to Servers → Add Server
- Type: Localhost (same machine)
- Validate connection

### 4.2 Create Project
- Go to Projects → Add Project
- Name: "BrightSign E-shop"

### 4.3 Add GitHub Integration
- Go to Sources → Add Source
- Type: GitHub App
- Follow OAuth flow
- Grant access to your repository

---

## Step 5: DNS Configuration

### 5.1 Cloudflare Setup (Recommended)
- Add site to Cloudflare
- Update nameservers at registrar
- Set up DNS records:

```
Type    Name              Content           Proxy
A       @                 <server-ip>       Yes
A       api               <server-ip>       Yes
A       admin             <server-ip>       Yes
CNAME   www               brightsign.cz     Yes
```

### 5.2 Without Cloudflare (Direct)
At Wedos/Shoptet DNS:
```
A       @                 <server-ip>
A       api               <server-ip>
A       admin             <server-ip>
CNAME   www               brightsign.cz
```

### 5.3 Multi-domain Setup
Repeat for each domain:
- brightsign.cz → Main CZ site
- brightsign.sk → SK site
- ebrightsign.pl → PL site
- ebrightsign.eu → EU/EN site

---

## Step 6: SSL Certificates

Coolify handles Let's Encrypt automatically when you deploy apps.

### 6.1 Verify SSL Settings
- In Coolify: Settings → SSL
- Ensure Let's Encrypt is enabled
- Email for notifications: your@email.com

---

## Step 7: Database Setup

### 7.1 Add PostgreSQL in Coolify
- Go to Project → Add Resource → Database
- Type: PostgreSQL
- Version: 16
- Name: `medusa-db`
- Generate secure password
- Deploy

### 7.2 Note Connection Details
```
Host: localhost (or internal Docker network)
Port: 5432
Database: medusa
User: medusa
Password: <generated>
```

### 7.3 Add Redis in Coolify
- Go to Project → Add Resource → Database
- Type: Redis
- Version: 7
- Name: `medusa-redis`
- Deploy

---

## Step 8: Environment Variables

### 8.1 Create .env Template
Store securely (not in Git):

```env
# Database
DATABASE_URL=postgresql://medusa:<password>@localhost:5432/medusa

# Redis
REDIS_URL=redis://localhost:6379

# Secrets (generate with: openssl rand -hex 32)
JWT_SECRET=<generate>
COOKIE_SECRET=<generate>

# Domain
STORE_CORS=https://brightsign.cz,https://brightsign.sk,https://ebrightsign.pl,https://ebrightsign.eu
ADMIN_CORS=https://admin.brightsign.cz

# Stripe (add later)
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## Step 9: GitHub Repository Setup

### 9.1 Create Repository
```bash
# On local machine
mkdir brightsign-eu-shop
cd brightsign-eu-shop
git init
git remote add origin git@github.com:YOUR_USERNAME/brightsign-eu-shop.git
```

### 9.2 Initial Structure
```
brightsign-eu-shop/
├── backend/          # Medusa backend (will create)
├── storefront/       # Next.js frontend (will create)
├── docs/             # Documentation (copy from this project)
├── .github/
│   └── workflows/    # CI/CD (will create)
├── docker-compose.yml
├── README.md
└── .gitignore
```

### 9.3 Push Initial Commit
```bash
git add .
git commit -m "Initial project structure"
git push -u origin main
```

---

## Step 10: Verification Checklist

- [ ] Server accessible via SSH
- [ ] Coolify UI accessible at :8000
- [ ] Admin account created
- [ ] GitHub connected
- [ ] PostgreSQL running
- [ ] Redis running
- [ ] DNS pointing to server
- [ ] SSL working (after first deploy)

---

## Troubleshooting

### Coolify not starting
```bash
docker ps -a  # Check container status
docker logs coolify  # Check logs
systemctl restart docker
```

### Database connection issues
```bash
docker exec -it <postgres-container> psql -U medusa -d medusa
```

### DNS not propagating
- Use https://dnschecker.org
- Wait up to 24-48 hours
- Check TTL settings

---

## Next Step
→ Proceed to `02-medusa-backend.md`
