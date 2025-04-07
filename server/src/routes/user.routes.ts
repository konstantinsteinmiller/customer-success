import { Router } from 'express'
import { createUser, getUserCompanies, getUsers, saveUsersSelectedCompanies } from '@/controllers/user.controller'
import authMiddleware from '@/middlewares/auth.middleware'

const router: any = Router()

router.post('/users', authMiddleware, createUser)
router.get('/users', authMiddleware, getUsers)
router.post('/users/companies', authMiddleware, saveUsersSelectedCompanies)
router.get('/users/companies', authMiddleware, getUserCompanies)

export default router
