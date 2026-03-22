# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

# Install native build tools required by better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (layer cache friendly)
COPY package*.json ./
RUN npm ci

# Copy source and build the React frontend
COPY . .
RUN npm run build

# ── Stage 2: Production image ──────────────────────────────────────────────────
FROM node:20-slim AS runner

# Same native tools needed at runtime for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Copy only what's needed at runtime
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

EXPOSE 3001

CMD ["node", "server/index.js"]
