# Base stage
FROM node:22 AS base
WORKDIR /app
COPY package.json yarn.lock ./

# Dependencies stage
FROM base AS deps
RUN yarn install --frozen-lockfile

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Final stage for production
FROM node:22-alpine AS runner
WORKDIR /usr/src/app

# Copiamos los archivos necesarios del builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./

# Reinstalamos bcrypt en alpine para evitar problemas de compatibilidad
RUN apk add --no-cache make gcc g++ python3 && \
    yarn add bcrypt && \
    apk del make gcc g++ python3

# Comando de inicio de la aplicación en modo producción
CMD ["yarn", "start:prod"]
