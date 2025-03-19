import userRoutes from '@/routes/user.routes'
import authRoutes from '@/routes/auth.routes'
import dashboardRoutes from '@/routes/dashboard.routes'
import analyticsRoutes from '@/routes/analytics.routes'
import processDataRoutes from '@/routes/processData.routes'

const registerRoutes = (app: any) => {
  app.use('/api', userRoutes)
  app.use('/api', authRoutes)
  app.use('/api', dashboardRoutes)
  app.use('/api', analyticsRoutes)
  app.use('/api', processDataRoutes)
}

export default registerRoutes
