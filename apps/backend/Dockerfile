# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/types/package.json ./packages/shared/types/
COPY packages/shared/utils/package.json ./packages/shared/utils/
COPY packages/shared/i18n/package.json ./packages/shared/i18n/
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source
COPY packages/shared/ ./packages/shared/
COPY apps/backend/ ./apps/backend/
COPY tsconfig.base.json ./

# Build shared packages
RUN pnpm --filter @link-reit/types build
RUN pnpm --filter @link-reit/utils build
RUN pnpm --filter @link-reit/i18n build

# Generate Prisma client
RUN cd apps/backend && npx prisma generate

# Build backend
RUN pnpm --filter @link-reit/backend build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/apps/backend/package.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]
