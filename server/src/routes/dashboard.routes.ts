import { Router } from 'express'
import { getDashboard } from '../controllers/dashboard.controller'
import authMiddleware from '../middlewares/auth.middleware'

const router = Router()

router.post('/dashboard', authMiddleware, getDashboard)

export default router
