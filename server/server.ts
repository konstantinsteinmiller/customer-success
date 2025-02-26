import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
import passport from 'passport'
import session from 'express-session'
import GoogleStrategy from 'passport-google-oauth20'
import qs from 'querystring'
import axios from 'axios'

const env = config()?.parsed
const GOOGLE_CLIENT_ID: string = env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET: string = env.VITE_GOOGLE_CLIENT_SECRET

const app = express()
const PORT = process.env.VITE_API_PORT

app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
  })
)
app.use(passport.initialize())
app.use(passport.session())

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:${PORT}/auth/google/callback`,
    },
    function (accessToken, refreshToken, profile, done) {
      return done(null, profile)
    }
  )
)

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

// Middleware
app.use(cors())
app.use(bodyParser.json())

let accessToken: string | null = null
app.post('/api/token/verify', (req: Request, res: Response) => {
  const token = req.headers.authorization

  if (!token) {
    return res.status(400).json({ message: 'Token is missing' })
  }

  res.status(200).json({ message: 'Token is valid', isValid: accessToken === token })
})

app.post('/api/user/logout', (req: Request, res: Response) => {
  const token = req.headers.authorization

  if (!token) {
    return res.status(400).json({ message: 'Token is missing' })
  }
  accessToken = null
  res.status(200).json({ message: 'User logged out', success: true })
})

app.get('/api/customer-success', (req: Request, res: Response) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(400).json({ message: 'Token is missing' })
  }

  /* verify token is correct */
})

app.post('/api/auth', async (req: Request, res: Response) => {
  try {
    const code = req.body.code // Use req.body instead of headers.authorization
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is missing' })
    }

    const data = {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: 'postmessage', // Ensure it matches frontend redirect_uri
      grant_type: 'authorization_code',
    }

    const response = await axios.post('https://oauth2.googleapis.com/token', data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    // Fetch user details using the access token
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
      },
    })

    const userDetails = userResponse.data

    accessToken = response.data.access_token

    const token = jwt.sign(userDetails, GOOGLE_CLIENT_SECRET, { expiresIn: '1h' })
    res.status(200).json({
      message: 'Authentication successful',
      user: userDetails,
      accessToken,
      jwtToken: token,
    })
  } catch (error: any) {
    console.error('Error exchanging authorization code:', error.response?.data || error.message)
    res.status(400).json({ message: 'Failed to exchange authorization code', error: error.response?.data })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
