import { UserRepository } from '@/repositories/user.repository'
import { Company } from '@/types/api'
import { User } from '@/models/user.model'

export class UserService {
  private userRepository = new UserRepository()

  async createUser(name: string, email: string, password: string) {
    const existingUser = await this.userRepository.findByEmail(email)
    if (existingUser) {
      throw new Error('User already exists')
    }

    return this.userRepository.create({ name, email, password })
  }

  async saveUser(user: User) {
    const existingUser = await this.userRepository.findByEmail(user.email)
    if (existingUser) {
      return existingUser
    }

    return this.userRepository.create(user)
  }

  async getUsers() {
    return this.userRepository.getAllUsers()
  }

  async saveUserCompanies(user: Partial<User>, companies: Company[]) {
    return this.userRepository.saveUserCompanies(user, companies)
  }

  async getUserCompanies(user: Partial<User>): Promise<any> {
    return this.userRepository.findByEmail(user.email as string) || []
  }
}
