//import axios
import axios from 'axios'
//import js cookie
import Cookies from 'js-cookie'

const Api = axios.create({
  //set endpoint API
  baseURL: import.meta.env.VITE_APP_BASEURL,
  //set header axios
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

//selalu sertakan token (jika ada) di setiap request
Api.interceptors.request.use((config) => {
  const token = Cookies.get('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

//handle unauthenticated
Api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const isLoginCall = error.config?.url?.includes('/api/auth/login')

    if (status === 401 && !isLoginCall) {
      //remove token
      Cookies.remove('token')
      //redirect "/login"
      window.location = '/login'
    }
    return Promise.reject(error)
  },
)

export default Api
