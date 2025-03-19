import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import { errorHandler } from '@/middlewares/error.middleware'
import { config } from '@/config/env'
import registerRoutes from '@/routes'

const app: any = express()

// Middleware
app.use(express.json())
app.use(bodyParser.json())
app.use(cookieParser())

app.use(
  cors({
    origin: config.FE_BASE_URL,
    credentials: true,
  })
)
app.use(helmet())
app.use(compression())

// Routes
registerRoutes(app)

// Error Handling Middleware
app.use(errorHandler)

export default app
