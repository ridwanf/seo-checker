# ---- Base ----
  FROM node:22-alpine AS base
  RUN npm install -g pnpm
  WORKDIR /app
  
  # ---- Dependencies ----
  FROM base AS deps
  COPY pnpm-workspace.yaml ./
  COPY package.json ./
  COPY packages/shared-types/package.json ./packages/shared-types/
  COPY apps/web/package.json ./apps/web/
  
  RUN pnpm install --frozen-lockfile
  
  # ---- Builder ----
  FROM deps AS builder
  COPY packages/shared-types ./packages/shared-types
  COPY apps/web ./apps/web
  COPY tsconfig.base.json ./
  
  RUN pnpm --filter @seo-checker/shared-types build
  RUN pnpm --filter @seo-checker/web build
  
  # ---- Runner (Nginx serves static files) ----
  FROM nginx:alpine AS runner
  
  COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
  COPY docker/web/nginx.conf /etc/nginx/conf.d/default.conf
  
  EXPOSE 80
  
  CMD ["nginx", "-g", "daemon off;"]