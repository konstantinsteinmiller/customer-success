import { Request, Response, NextFunction } from 'express'
import { UserService } from '@/services/user.service'
import { logger } from '@/utils/logger'
import { Company } from '@/types/api'
import { extractUserFromToken } from '@/middlewares/auth.middleware'

const userService = new UserService()

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body
    const user = await userService.createUser(name, email, password)
    res.status(201).json(user)
  } catch (error) {
    logger.error(error)
    next(error)
  }
}

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getUsers()
    res.json(users)
  } catch (error) {
    logger.error(error)
    next(error)
  }
}

export const getUserCompanies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = extractUserFromToken(req)
    const foundUser = await userService.getUserCompanies(user)
    logger.info(`total selected: ${foundUser?.companiesList.length}`)
    res.status(200).json({ data: foundUser?.companiesList || [] })
  } catch (error) {
    logger.error(error)
    next(error)
    res.status(500).json({ message: 'failure' })
  }
}

export const saveUsersSelectedCompanies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = extractUserFromToken(req)
    const companies: Company[] = req.body.data
    logger.info(`saved selected companies for user ${user.email}`)
    await userService.saveUserCompanies({ email: user.email }, companies)
    res.status(200).json({ message: 'successful' })
  } catch (error) {
    logger.error(error)
    next(error)
    res.status(404).json({ message: 'failure, user not found' })
  }
}
