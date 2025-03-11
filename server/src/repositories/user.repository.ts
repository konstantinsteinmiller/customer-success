import { UserModel } from '@/models/user.model'

export class UserRepository {
  async create(user: any) {
    return UserModel.create(user)
  }

  async findByEmail(email: string) {
    return UserModel.findOne({ email })
  }

  async getAllUsers() {
    return UserModel.find()
  }
}
