import jwt from 'jsonwebtoken'
import { createUser } from '../factories/user.factory.js'

// Build an access-token cookie for an existing user. `protect` / `optionalAuth`
// now read the `accessToken` cookie (short-lived access token) — not `token`.
export const cookieFor = (user) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
  return `accessToken=${token}`
}

export const loggedInUser = async (overrides = {}) => {
  const user = await createUser(overrides)
  return { user, cookie: cookieFor(user) }
}

// For testing rejection paths: a syntactically valid but unverifiable token.
export const tamperedCookie = () => {
  const token = jwt.sign({ id: 'x', role: 'CUSTOMER' }, 'wrong-secret')
  return `accessToken=${token}`
}
