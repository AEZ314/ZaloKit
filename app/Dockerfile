# ---------- build stage ----------
FROM node:24-bookworm AS builder

ARG DATABASE_URL

WORKDIR /app

# install deps (cacheable)
COPY package.json package-lock.json ./
RUN npm ci

# build
COPY . .
RUN npm run build


# ---------- runtime stage ----------
FROM node:24-bookworm-slim

WORKDIR /app

# copy only what is needed at runtime
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle.config.js ./
COPY --from=builder /app/schemas ./schemas

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS http://localhost:3000/health || exit 1

CMD ["node", "build/index.js"]