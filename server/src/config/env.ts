import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 5000

export const config = {
  PORT,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/exampleDB',
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProductionEnv: process.env.NODE_ENV === 'production',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_TOKEN_URL: 'https://oauth2.googleapis.com/token',
  GOOGLE_USERINFO_URL: 'https://www.googleapis.com/oauth2/v3/userinfo',
  JWT_SECRET: process.env.JWT_SECRET,
  FE_BASE_URL: process.env.FE_BASE_URL,
  PIWIK_CLIENT_ID: process.env.PIWIK_CLIENT_ID,
  PIWIK_SECRET: process.env.PIWIK_SECRET,
  BACKEND_URL: process.env.BACKEND_URL,
}
