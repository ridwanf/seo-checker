# ---- Base ----
  FROM node:22-alpine AS base
  RUN npm install -g pnpm
  WORKDIR /app
  
  # ---- Dependencies ----
  FROM base AS deps
  COPY pnpm-workspace.yaml ./
  COPY package.json ./
  COPY packages/shared-types/package.json ./packages/shared-types/
  COPY packages/seo-engine/package.json ./packages/seo-engine/
  COPY apps/api/package.json ./apps/api/
  
  RUN pnpm install --frozen-lockfile
  
  # ---- Builder ----
  FROM deps AS builder
  COPY packages/shared-types ./packages/shared-types
  COPY packages/seo-engine ./packages/seo-engine
  COPY apps/api ./apps/api
  COPY tsconfig.base.json ./
  
  RUN pnpm --filter @seo-checker/shared-types build
  RUN pnpm --filter @seo-checker/seo-engine build
  RUN pnpm --filter @seo-checker/api build
  
  # ---- Runner ----
  FROM node:22-alpine AS runner
  RUN npm install -g pnpm
  WORKDIR /app
  
  ENV NODE_ENV=production
  
  # Copy only what's needed to run
  COPY --from=builder /app/package.json ./
  COPY --from=builder /app/pnpm-workspace.yaml ./
  COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/
  COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
  COPY --from=builder /app/packages/seo-engine/package.json ./packages/seo-engine/
  COPY --from=builder /app/packages/seo-engine/dist ./packages/seo-engine/dist
  COPY --from=builder /app/apps/api/package.json ./apps/api/
  COPY --from=builder /app/apps/api/dist ./apps/api/dist
  
  RUN pnpm install --prod --frozen-lockfile
  
  WORKDIR /app/apps/api
  
  EXPOSE 3000
  
  CMD ["node", "dist/main.js"]