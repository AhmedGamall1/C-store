# --------------- BUILD STAGE ---------------
FROM node:22-alpine AS build

WORKDIR /app

# Caching layer
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/

# Install only server deps
RUN npm ci -w apps/server --include=dev

# Copy server sources
COPY apps/server ./apps/server

# Generate the Prisma Client
RUN npm run db:generate -w apps/server



# --------------- RUNTIME STAGE ---------------
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Run as a non-privileged user
RUN addgroup -S app && adduser -S app -G app

# Copy only what's needed at runtime
COPY --from=build --chown=app:app /app/package.json /app/package-lock.json ./
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/apps/server ./apps/server

# Entrypoint runs migrations then starts the server
COPY --chown=app:app apps/server/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER app
EXPOSE 5000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
