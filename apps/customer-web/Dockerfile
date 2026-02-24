# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/types/package.json ./packages/shared/types/
COPY packages/shared/i18n/package.json ./packages/shared/i18n/
COPY packages/shared/utils/package.json ./packages/shared/utils/
COPY packages/shared/api-client/package.json ./packages/shared/api-client/
COPY apps/customer-web/package.json ./apps/customer-web/

RUN pnpm install --frozen-lockfile || pnpm install

COPY packages/shared/ ./packages/shared/
COPY apps/customer-web/ ./apps/customer-web/
COPY tsconfig.base.json ./

RUN pnpm --filter @link-reit/types build
RUN pnpm --filter @link-reit/i18n build
RUN pnpm --filter @link-reit/utils build
RUN pnpm --filter @link-reit/api-client build
RUN pnpm --filter @link-reit/customer-web build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/apps/customer-web/dist /usr/share/nginx/html
COPY apps/customer-web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
