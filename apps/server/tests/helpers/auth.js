import jwt from 'jsonwebtoken'

// Returned string can be passed directly to Supertest's .set('Cookie', …).
export const cookieFor = (user) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
  return `token=${token}`
}
