import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import jwt from 'jsonwebtoken'

const app = express()
const PORT = process.env.VITE_API_PORT || 5170
const SECRET_KEY = 'your-secret-keys' // replace with a strong secret

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Dummy user data (for demo purposes)
const dummyUser = {
  id: 1,
  username: 'dummy',
  password: '123', // DO NOT use plain text passwords in production!
  firstName: 'Test',
  lastName: 'User',
}

// POST /api/login – authenticate user and return a JWT
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body
  console.log('username, password: ', username, password)
  if (username === dummyUser.username && password === dummyUser.password) {
    // Create JWT payload (customize as needed)
    const token = jwt.sign(
      {
        id: dummyUser.id,
        username: dummyUser.username,
        firstName: dummyUser.firstName,
        lastName: dummyUser.lastName,
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    )
    return res.json({ token })
  }
  return res.status(401).json({ message: 'Invalid credentials' })
})

// POST /api/logout – for demo, simply return a message (client should remove token)
app.get('/api/auth/user', (req: Request, res: Response) => {
  res.json(dummyUser)
})

// POST /api/logout – for demo, simply return a message (client should remove token)
app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({ message: 'Logout successful' })
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
