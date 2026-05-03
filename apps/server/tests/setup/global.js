import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

// Vitest globalSetup runs in its own process.
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({
  path: path.resolve(__dirname, '../../../../.env.test'),
  override: true,
})

export default async function setup() {
  console.log('[test-setup] Applying migrations to test DB…')
  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(__dirname, '../..'), // apps/server
    stdio: 'inherit',
    env: process.env,
  })
  console.log('[test-setup] Migrations applied.')
}

// teardown runs after the entire test suite finishes
export async function teardown() {
  // Container is tmpfs-backed — restart it for a fully fresh slate.
  // Nothing to do here; leaving the hook for future use.
}
