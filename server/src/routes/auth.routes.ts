import { Router } from 'express'
import { authenticateGoogle, logout, verifySession } from '@/controllers/auth.controller'
import authMiddleware from '@/middlewares/auth.middleware'

const router: any = Router()

// @ts-ignore
router.post('/auth', authenticateGoogle)
router.post('/auth/token/verify', authMiddleware, verifySession)
router.post('/auth/logout', authMiddleware, logout)

export default router
