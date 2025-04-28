import userRoutes from '@/routes/user.routes'
import authRoutes from '@/routes/auth.routes'
import analyticsRoutes from '@/routes/analytics.routes'
import processDataRoutes from '@/routes/process-data.routes'

const registerRoutes = (app: any) => {
  app.use('/api', userRoutes)
  app.use('/api', authRoutes)
  app.use('/api', analyticsRoutes)
  app.use('/api', processDataRoutes)
}

export default registerRoutes
