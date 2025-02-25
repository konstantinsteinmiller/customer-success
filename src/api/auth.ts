import { createAuth } from 'vue-auth3'
// import driverAuthBearer from 'vue-auth3/drivers/auth/bearer'
import driverAuthBasic from 'vue-auth3/drivers/auth/basic'
import driverHttpAxios from 'vue-auth3/drivers/http/axios'
import router from '@/router'

export const auth = createAuth({
  plugins: {
    router,
  },
  fetchData: {
    enabled: true, // send a request to `/api/user` if the user information stored in the cookie is not visible
    cache: true, //save user information to localStorage for use
    enabledInBackground: true, // refresh user information in the background
  },
  refreshToken: {
    enabled: false, // refresh token in goto page
    enabledInBackground: true, // refresh token in background
  },
  drivers: {
    auth: driverAuthBasic,
    http: driverHttpAxios,
  },
  tokenDefaultKey: 'access_token',
  tokenImpersonateKey: 'access_token_impersonate',
  stores: ['storage', 'cookie'],
})
