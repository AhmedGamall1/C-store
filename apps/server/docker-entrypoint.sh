#!/bin/sh
set -e

echo "[entrypoint] Applying database migrations…"
npm run db:deploy -w apps/server

echo "[entrypoint] Starting server…"
exec node apps/server/dist/index.js