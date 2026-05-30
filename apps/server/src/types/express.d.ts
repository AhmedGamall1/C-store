import type { User } from '@prisma/client'

// The auth middleware attaches the signed-in user to the request.
// It is optional because guest (unauthenticated) routes also exist.
declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export {}
