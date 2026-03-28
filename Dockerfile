# Usa una imagen de Node estable
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# Construye la aplicación
RUN pnpm run build

FROM base
COPY --from=build /app/.output /app/.output
WORKDIR /app

# TanStack Start/Nitro usa el puerto 3000 por defecto
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

# Comando para arrancar el servidor de Nitro
CMD ["node", ".output/server/index.mjs"]