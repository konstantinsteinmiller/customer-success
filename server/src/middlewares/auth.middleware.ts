// Middleware to protect routes
import jwt from 'jsonwebtoken'
import { config } from '@/config/env'
import { logger } from '@/utils/logger'

const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    req.user = jwt.verify(token, config.JWT_SECRET!)
    next()
  } catch (err: any) {
    logger.error('Error verifying token:', err.message)
    return res.status(403).json({ message: 'Invalid token' })
  }
}
export default authMiddleware
