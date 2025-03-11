import app from './app.ts'
import { connectDB } from './config/db.ts'
import { config } from './config/env.ts'

connectDB()

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})
