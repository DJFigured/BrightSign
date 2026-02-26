# Hetzner Unlock Request - L0029DB12

## Subject: Unlock Request for L0029DB12 - CAX21 #121495175

## Description for Hetzner Robot Support Form:

---

**Locking ID:** L0029DB12

**Analysis of the incident:**

Our server (91.99.49.122) was compromised and used to send a UDP flood attack targeting 212.22.85.158:27015 on 2026-02-22 at approximately 23:16 CET. The attack originated from source port 33785 using large UDP packets (928-1428 bytes).

**Root cause:**

The server runs a Docker-based e-commerce application (Medusa.js + Next.js). Several internal service ports were inadvertently exposed to the public internet (ports 9000, 9001, 9002, 3000), which should have only been accessible through the Caddy reverse proxy. This likely allowed an attacker to exploit one of the exposed services and deploy a DDoS bot.

**Remediation steps taken:**

1. **Closed all unnecessary exposed ports** - Backend (9000), Storefront (3000), and MinIO (9001/9002) are now internal-only (Docker `expose` instead of `ports`). Only ports 80 and 443 are exposed via Caddy reverse proxy.

2. **UFW Firewall** - Configured strict inbound rules (only 22/tcp rate-limited, 80/tcp, 443/tcp, 443/udp). Outbound UDP is blocked except DNS (53) and NTP (123) to prevent future DDoS amplification.

3. **Redis authentication** - Added `requirepass` to Redis (previously no authentication).

4. **SSH hardening** - Disabled password authentication, key-only access, limited to 3 auth attempts, disabled X11/TCP forwarding.

5. **Fail2ban** - Installed with SSH jail (3 attempts, 2h ban).

6. **Docker security** - Disabled Docker's iptables bypass (`"iptables": false`), added log rotation, configured DOCKER-USER chain via UFW.

7. **Malware scan** - Will scan for and remove any malicious processes, check crontabs, and clean temp directories.

8. **All credentials rotated** - Redis password, JWT secret, cookie secret, and database password will be regenerated.

9. **Automatic security updates** enabled via unattended-upgrades.

**We request the IP address 91.99.49.122 to be unlocked so we can apply these security measures via rescue mode.**

Thank you.

---

## Steps to submit:
1. Go to https://robot.hetzner.com/support/
2. Click user icon → Support
3. Under "Unlock", select locking ID **L0029DB12**
4. Paste the description above
5. Submit
