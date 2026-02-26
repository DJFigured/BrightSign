#!/bin/bash
# =============================================================================
# BrightSign VPS Hardening Script
# Run after Hetzner unlock via rescue mode
# Incident: L0029DB12 - DDoS attack from 91.99.49.122 (2026-02-22)
# =============================================================================
set -euo pipefail

echo "=== BrightSign VPS Hardening ==="
echo "Date: $(date)"
echo ""

# --- 1. UFW Firewall ---
echo ">>> [1/7] Configuring UFW firewall..."

# Reset UFW to clean state
ufw --force reset

# Default policies: deny incoming, allow outgoing
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (rate-limited)
ufw limit 22/tcp comment 'SSH rate-limited'

# Allow HTTP/HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 443/udp comment 'HTTPS/QUIC'

# Block outbound UDP except DNS and NTP (prevents DDoS amplification)
ufw deny out to any port 1:52 proto udp comment 'Block outbound UDP below DNS'
ufw deny out to any port 54:122 proto udp comment 'Block outbound UDP 54-122'
ufw deny out to any port 124:65535 proto udp comment 'Block outbound UDP above NTP'
# This allows: UDP 53 (DNS) and UDP 123 (NTP) outbound

# Enable UFW
ufw --force enable
echo "UFW configured and enabled."
echo ""

# --- 2. SSH Hardening ---
echo ">>> [2/7] Hardening SSH..."

SSHD_CONFIG="/etc/ssh/sshd_config"
cp "$SSHD_CONFIG" "${SSHD_CONFIG}.backup.$(date +%Y%m%d)"

# Apply SSH hardening
cat > /etc/ssh/sshd_config.d/99-hardening.conf << 'SSHEOF'
# BrightSign SSH Hardening (post-incident L0029DB12)
PermitRootLogin prohibit-password
PasswordAuthentication no
PubkeyAuthentication yes
PermitEmptyPasswords no
ChallengeResponseAuthentication no
X11Forwarding no
MaxAuthTries 3
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2
AllowAgentForwarding no
AllowTcpForwarding no
SSHEOF

# Restart SSH
systemctl restart sshd
echo "SSH hardened: key-only auth, no password login."
echo ""

# --- 3. Fail2ban ---
echo ">>> [3/7] Installing and configuring fail2ban..."

apt-get update -qq && apt-get install -y -qq fail2ban > /dev/null 2>&1

cat > /etc/fail2ban/jail.local << 'F2BEOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
banaction = ufw

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200
F2BEOF

systemctl enable fail2ban
systemctl restart fail2ban
echo "Fail2ban installed and configured."
echo ""

# --- 4. Automatic security updates ---
echo ">>> [4/7] Enabling automatic security updates..."

apt-get install -y -qq unattended-upgrades > /dev/null 2>&1
dpkg-reconfigure -plow unattended-upgrades 2>/dev/null || true

cat > /etc/apt/apt.conf.d/20auto-upgrades << 'AUTOEOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
AUTOEOF

echo "Automatic security updates enabled."
echo ""

# --- 5. Docker security ---
echo ">>> [5/7] Hardening Docker..."

# Disable Docker's iptables manipulation (use UFW instead)
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'DOCKEREOF'
{
  "iptables": false,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 65536,
      "Soft": 65536
    }
  }
}
DOCKEREOF

# Note: After setting iptables:false, we need DOCKER-USER chain rules
# to allow container networking through UFW
cat > /etc/ufw/after.rules.docker << 'UFWDOCKEREOF'
# Docker container networking via UFW
*filter
:DOCKER-USER - [0:0]
# Allow established connections
-A DOCKER-USER -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
# Allow internal Docker network traffic
-A DOCKER-USER -s 172.16.0.0/12 -j ACCEPT
-A DOCKER-USER -s 10.0.0.0/8 -j ACCEPT
# Allow incoming on ports 80/443 to Docker containers
-A DOCKER-USER -p tcp --dport 80 -j ACCEPT
-A DOCKER-USER -p tcp --dport 443 -j ACCEPT
-A DOCKER-USER -p udp --dport 443 -j ACCEPT
# Drop everything else to Docker containers from external
-A DOCKER-USER -j DROP
COMMIT
UFWDOCKEREOF

echo "Docker security configured (disabled iptables bypass, log rotation)."
echo ""

# --- 6. Kill suspicious processes ---
echo ">>> [6/7] Scanning for suspicious processes..."

# Kill any process using high-numbered UDP ports
for PID in $(ss -ulnp | grep -E ':(3[0-9]{4}|[4-9][0-9]{4})' | grep -oP 'pid=\K[0-9]+' 2>/dev/null || true); do
  PROC=$(ps -p "$PID" -o comm= 2>/dev/null || echo "unknown")
  echo "  SUSPICIOUS: PID=$PID process=$PROC - killing..."
  kill -9 "$PID" 2>/dev/null || true
done

# Check for crypto miners and common malware
for SUSPECT in xmrig kinsing kdevtmpfsi solr.sh kthreaddi; do
  FOUND=$(pgrep -f "$SUSPECT" 2>/dev/null || true)
  if [ -n "$FOUND" ]; then
    echo "  MALWARE FOUND: $SUSPECT (PIDs: $FOUND) - killing..."
    pkill -9 -f "$SUSPECT" 2>/dev/null || true
  fi
done

# Check crontabs for suspicious entries
echo "  Checking crontabs..."
for USER in root $(awk -F: '$3>=1000{print $1}' /etc/passwd); do
  CRON=$(crontab -u "$USER" -l 2>/dev/null || true)
  if echo "$CRON" | grep -qiE '(curl|wget|bash|\.sh|/tmp|/dev/shm)'; then
    echo "  WARNING: Suspicious crontab for $USER:"
    echo "$CRON" | grep -iE '(curl|wget|bash|\.sh|/tmp|/dev/shm)'
  fi
done

# Check /tmp and /dev/shm for executables
echo "  Checking /tmp and /dev/shm for binaries..."
find /tmp /dev/shm -type f -executable 2>/dev/null | while read -r F; do
  echo "  SUSPICIOUS: Executable in temp dir: $F"
  rm -f "$F"
done

echo "Process scan complete."
echo ""

# --- 7. Restart services ---
echo ">>> [7/7] Restarting services..."

systemctl restart docker
sleep 5

# Navigate to app directory
cd /root/brightsign || { echo "ERROR: /root/brightsign not found"; exit 1; }

# Rebuild and restart all containers (clean state)
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "=== Hardening complete ==="
echo ""
echo "Checklist:"
echo "  [x] UFW firewall: inbound 22/80/443 only, outbound UDP restricted"
echo "  [x] SSH: key-only auth, no root password, rate-limited"
echo "  [x] Fail2ban: SSH brute-force protection"
echo "  [x] Auto-updates: security patches applied automatically"
echo "  [x] Docker: iptables bypass disabled, log rotation"
echo "  [x] Malware: scanned and cleaned"
echo "  [x] Services: rebuilt and restarted cleanly"
echo ""
echo "NEXT STEPS:"
echo "  1. Generate new Redis password: openssl rand -hex 32"
echo "  2. Update .env.production with REDIS_PASSWORD=<new_password>"
echo "  3. Regenerate JWT_SECRET and COOKIE_SECRET"
echo "  4. Change POSTGRES_PASSWORD"
echo "  5. Submit Hetzner unlock request at https://robot.hetzner.com/support/"
echo "  6. Run: docker compose -f docker-compose.prod.yml exec -T backend npx medusa db:migrate"
echo ""
echo "UFW Status:"
ufw status verbose
