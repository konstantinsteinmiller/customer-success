import { UserRepository } from '@/repositories/user.repository'

export class UserService {
  private userRepository = new UserRepository()

  async createUser(name: string, email: string, password: string) {
    const existingUser = await this.userRepository.findByEmail(email)
    if (existingUser) {
      throw new Error('User already exists')
    }

    return this.userRepository.create({ name, email, password })
  }

  async getUsers() {
    return this.userRepository.getAllUsers()
  }
}
