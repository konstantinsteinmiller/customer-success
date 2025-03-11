import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'
import { config } from '@/config/env'
import jwt from 'jsonwebtoken'
import axios from 'axios'

let accessToken: string | null = null

export const authenticateGoogle = async (req: Request, res: Response) => {
  try {
    const code = req.body.code // Use req.body instead of headers.authorization
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is missing' })
    }

    const data = {
      code,
      client_id: config.GOOGLE_CLIENT_ID,
      client_secret: config.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'postmessage',
      grant_type: 'authorization_code',
    }

    const response = await axios.post(config.GOOGLE_TOKEN_URL, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    // Fetch user details using the access token
    const userResponse = await axios.get(config.GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
      },
    })

    const userDetails = userResponse.data

    accessToken = response.data.access_token

    const token = jwt.sign(userDetails, config.JWT_SECRET!, { expiresIn: '1h' })
    logger.info(`JWT token: ${token}`)
    // Send token as a secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.isProductionEnv,
      maxAge: 3600000, // 1 hour
      sameSite: config.isProductionEnv ? 'none' : 'strict',
      path: '/api'
    })

    res.status(200).json({
      message: 'Authentication successful',
      user: userDetails,
      accessToken,
      token,
    })
  } catch (error: any) {
    logger.error('Error exchanging authorization code:', error.response?.data || error.message)
    res.status(400).json({ message: 'Failed to exchange authorization code', error: error.response?.data })
  }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    accessToken = null
    res.clearCookie('token', {
      httpOnly: true,
      secure: config.isProductionEnv,
      maxAge: 3600000, // 1 hour
      sameSite: config.isProductionEnv ? 'none' : 'strict',
      path: '/api'
    })
    res.status(200).json({ message: 'User logged out', success: true })
  } catch (error) {
    logger.error(error)
    next(error)
  }
}

export const verifySession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ message: 'Token is valid', isValid: true })
  } catch (error) {
    logger.error(error)
    next(error)
  }
}
