import mongoose from 'mongoose'
import { config } from '@/config/env'
import { logger } from '@/utils/logger'

export const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI)
    logger.info('MongoDB connected successfully!')
  } catch (error) {
    logger.error('Database connection error:', error)
    process.exit(1)
  }
}

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect()
    logger.info('MongoDB disconnected successfully!')
  } catch (error) {
    logger.error('Database disconnected error:', error)
    process.exit(1)
  }
}
