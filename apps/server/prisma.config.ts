import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'
import path from 'path'

// استخدم path.resolve عشان تضمن إن المسار يتحسب صح من مكان تشغيل الكود
config({ path: path.resolve(process.cwd(), '../../.env') })
console.log(process.env.DATABASE_URL)
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
