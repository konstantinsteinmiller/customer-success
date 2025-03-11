import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ message: 'Here is the Dashboard you asked for' })
  } catch (error) {
    logger.error(error)
    next(error)
  }
}
