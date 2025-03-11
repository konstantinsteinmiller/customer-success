import { Request, Response, NextFunction } from 'express'
import { UserService } from '../services/user.service'
import { logger } from '../utils/logger'

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
