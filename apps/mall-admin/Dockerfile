# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/types/package.json ./packages/shared/types/
COPY packages/shared/i18n/package.json ./packages/shared/i18n/
COPY packages/shared/utils/package.json ./packages/shared/utils/
COPY packages/shared/api-client/package.json ./packages/shared/api-client/
COPY apps/mall-admin/package.json ./apps/mall-admin/

RUN pnpm install --frozen-lockfile || pnpm install

COPY packages/shared/ ./packages/shared/
COPY apps/mall-admin/ ./apps/mall-admin/
COPY tsconfig.base.json ./

RUN pnpm --filter @link-reit/types build
RUN pnpm --filter @link-reit/i18n build
RUN pnpm --filter @link-reit/utils build
RUN pnpm --filter @link-reit/api-client build
RUN pnpm --filter @link-reit/mall-admin build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/apps/mall-admin/dist /usr/share/nginx/html
COPY apps/mall-admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
