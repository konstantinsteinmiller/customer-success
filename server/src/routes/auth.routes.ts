import { Router } from 'express'
import { authenticateGoogle, logout, verifySession } from '../controllers/auth.controller'
import authMiddleware from '../middlewares/auth.middleware'

const router = Router()

router.post('/auth', authenticateGoogle)
router.post('/auth/token/verify', authMiddleware, verifySession)
router.post('/auth/logout', authMiddleware, logout)

export default router
