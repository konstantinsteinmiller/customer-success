import { Router } from 'express'
import { createUser, getUser, getUsers, saveUsersSelectedCompanies } from '@/controllers/user.controller'
import authMiddleware from '@/middlewares/auth.middleware'

const router: any = Router()

router.post('/users', authMiddleware, createUser)
router.get('/users', authMiddleware, getUsers)
router.post('/users/companies', authMiddleware, saveUsersSelectedCompanies)
router.get('/user', authMiddleware, getUser)

export default router
