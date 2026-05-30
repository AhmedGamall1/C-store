import { Router } from 'express'
import {
  register,
  login,
  getMe,
  logout,
} from '../controllers/auth.controller.js'
import { protect } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import { registerSchema, loginSchema } from '../schemas/auth.schema.js'

const router = Router()

router.post('/register', validate({ body: registerSchema }), register)
router.post('/login', validate({ body: loginSchema }), login)
router.post('/logout', protect, logout)
router.get('/me', protect, getMe)

export default router
