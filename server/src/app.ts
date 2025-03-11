import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import { errorHandler } from '@/middlewares/error.middleware'
import authRoutes from '@/routes/auth.routes'
import userRoutes from '@/routes/user.routes'
import dashboardRoutes from '@/routes/dashboard.routes'
import { config } from '@/config/env'

const app: any = express()

// Middleware
app.use(express.json())
app.use(bodyParser.json())
app.use(cookieParser())

app.use(
  cors({
    origin: config.FE_BASE_URL,
    credentials: true,
  }),
)
app.use(helmet())
app.use(compression())

// Routes
app.use('/api', userRoutes)
app.use('/api', authRoutes)
app.use('/api', dashboardRoutes)

// Error Handling Middleware
app.use(errorHandler)

export default app
