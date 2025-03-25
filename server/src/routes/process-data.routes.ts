import { Router } from 'express'
import authMiddleware from '@/middlewares/auth.middleware'
import { getProcessData } from '@/controllers/process-data.controller'

const router: any = Router()

router.get('/process-data', authMiddleware, getProcessData)

export default router
