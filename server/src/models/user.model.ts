import mongoose, { Document } from 'mongoose'
import { Company } from '@/types/api'

export interface User {
  name: string
  email: string
  picture?: string
}

export interface UserDocument extends Document {
  lastUpdated: Date
  name: string
  email: string
  picture: string
  companiesList: Company[]
}

const UserSchema = new mongoose.Schema(
  {
    lastUpdated: { type: Date, default: Date.now },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    picture: { type: String, required: false },
    companiesList: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
)

export const UserModel = mongoose.model<UserDocument>('User', UserSchema)
export default UserModel
