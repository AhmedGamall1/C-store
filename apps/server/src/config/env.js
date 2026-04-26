import { z } from 'zod'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// find the env file and load it

// get the current directory of this file
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// get the exact path to the .env file, which is located at the root of the project
const envPath = path.resolve(__dirname, '../../../../.env')

// load the environment variables from the .env file
dotenv.config({ path: envPath })

const EnvSchema = z.object({
  // Runtime
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  // URLs
  CLIENT_URL: z.string().url().default('http://localhost:5173'),

  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  JWT_SECRET: z
    .string()
    .min(
      32,
      'JWT_SECRET must be at least 32 characters (use a long random string)'
    ),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // Paymob
  PAYMOB_API_KEY: z.string().min(1),
  PAYMOB_INTEGRATION_ID: z.coerce.number().int().positive(),
  PAYMOB_IFRAME_ID: z.string().min(1),
  PAYMOB_HMAC_SECRET: z.string().min(1),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('\n❌  Invalid environment configuration:\n')
  for (const issue of parsed.error.issues) {
    const key = issue.path.join('.') || '(root)'
    console.error(`   • ${key}: ${issue.message}`)
  }
  console.error('\nFix the values above in your .env file and restart.\n')
  process.exit(1)
}

// Frozen cannot be change at runtime.
export const env = Object.freeze(parsed.data)
