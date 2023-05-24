import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: 'http://localhost:8080/api', 
  // 封装接口的基地址，并加统一前缀api
  timeout: 5000 // 请求延时
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在每次ajax请求时携带token，到服务器验证token是否过期
    if (store.getters.token) {
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    console.log(error) 
    return Promise.reject(error)
  }
)

// 响应预处理
service.interceptors.response.use(
  response => {
    const code = response.status
    const res = response.data
    if (code !== 200 || !res.success) {
      Message({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err:' + error) // debug 使用
    Message({
      message: error.response.data.msg || error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
