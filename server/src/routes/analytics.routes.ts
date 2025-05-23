import { Router } from 'express'
import { getVisitorData } from '@/controllers/analytics.controller'
import authMiddleware from '@/middlewares/auth.middleware'

const router: any = Router()

router.get('/analytics/visitor-data', authMiddleware, getVisitorData)

export default router
