# Atlas Gastronomic — Production Containerization
FROM node:24-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and configuration
COPY tsconfig*.json vite.config.ts ./
COPY src/ ./src/

# Build client and server
RUN npm run build

# Runtime Stage
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/atlas_gastronomic.db

# Persistent volume directory for SQLite database
RUN mkdir -p /app/data && chown -R node:node /app/data

# Copy built artifacts and runtime node_modules
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/client/public ./dist/client

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "dist/server/index.js"]
