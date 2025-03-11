import { Router } from 'express'
import { getDashboard } from '@/controllers/dashboard.controller'
import authMiddleware from '@/middlewares/auth.middleware'

const router: any = Router()

router.post('/dashboard', authMiddleware, getDashboard)

export default router
