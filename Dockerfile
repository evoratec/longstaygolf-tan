FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /app
WORKDIR /app
# Instalamos dependencias
RUN pnpm install --frozen-lockfile
# Ejecutamos el build de Vite
RUN pnpm run build

FROM base
# Copiamos la salida del servidor Nitro que genera TanStack
COPY --from=build /app/.output /app/.output
WORKDIR /app

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000
# El punto de entrada para el preset 'node-server'
CMD ["node", ".output/server/index.mjs"]
