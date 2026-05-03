import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// .env.test lives at the repo root, four levels above this file
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../../../../.env.test')

// `override: true` ensures .env.test wins over any ambient process.env
dotenv.config({ path: envPath, override: true })

// check that DB is configured to a test db
if (!process.env.DATABASE_URL?.includes('test')) {
  throw new Error(
    `Refusing to run tests: DATABASE_URL does not look like a test DB.\n` +
      `Got: ${process.env.DATABASE_URL}\n` +
      `Expected the URL to contain "test".`
  )
}
