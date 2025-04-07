import { User, UserModel } from '@/models/user.model'
import { Company } from '@/types/api'

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

  async saveUserCompanies(user: Partial<User>, companies: Company[]) {
    return UserModel.findOneAndUpdate(
      { email: user.email },
      {
        $set: { lastUpdated: new Date(), companiesList: companies }, // Update the lastUpdated field
      },
      { upsert: true }
    )
  }
}
