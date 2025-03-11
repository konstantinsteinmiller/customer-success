import request from 'supertest'
import mongoose from 'mongoose'
import app from '../app' // Import your Express app
import { UserModel as User } from '../models/user.model' // Import the User model
import { connectDB, disconnectDB } from '../config/db' // Import database connection

// Mock user data
const testUser = {
  name: 'John Doe',
  email: 'johndoe@example.com',
  password: 'SecurePassword123!',
}

let token: string

// Connect to test database before running tests
beforeAll(async () => {
  await connectDB()
  await User.deleteMany() // Clean up existing users
})

// Disconnect database after all tests
afterAll(async () => {
  await User.deleteMany()
  await disconnectDB()
  await mongoose.connection.close()
})

describe('User API Tests', () => {
  it('should log in an existing user', async () => {
    const res = await request(app).post('/api/users/login').send({
      email: testUser.email,
      password: testUser.password,
    })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('token')
    token = res.body.token
  })

  it('should not log in with incorrect password', async () => {
    const res = await request(app).post('/api/users/login').send({
      email: testUser.email,
      password: 'WrongPassword123!',
    })

    expect(res.statusCode).toBe(401)
    expect(res.body).toHaveProperty('error', 'Invalid credentials')
  })
})
