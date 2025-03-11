import app from '@/app'
import { connectDB } from '@/config/db'
import { config } from '@/config/env'

connectDB()

const isDevMode = process.env.NODE_ENV === 'development'
app.listen(config.PORT, () => {
  console.log(`Server running${isDevMode ?  ' on port ' + config.PORT: '' }`)
})
