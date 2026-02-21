# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cache layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---- Stage 2: Runner ----
FROM node:20-alpine AS runner

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 medusa

# node_modules at /app/node_modules (Node resolution walks up from /app/.medusa/server/)
COPY --from=builder --chown=medusa:nodejs /app/node_modules /app/node_modules

# Compiled server at /app/.medusa/server/ — this is rootDirectory
# medusa-config.js + src/subscribers + src/jobs + public/admin are all here
COPY --from=builder --chown=medusa:nodejs /app/.medusa/server /app/.medusa/server

# Uploads directory
RUN mkdir -p /app/uploads && chown -R medusa:nodejs /app/uploads

USER medusa

# rootDirectory = /app/.medusa/server (where medusa-config.js is)
WORKDIR /app/.medusa/server

EXPOSE 9000

# Health check via Medusa /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:9000/health || exit 1

CMD ["/app/node_modules/.bin/medusa", "start"]
