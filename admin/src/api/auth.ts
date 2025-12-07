import { request } from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  code: number
  data: {
    token: string
    userInfo: {
      id: number
      username: string
      name: string
      role: string
      avatar?: string
    }
  }
  message: string
}

export interface UserInfoResponse {
  code: number
  data: {
    id: number
    username: string
    name: string
    role: string
    avatar?: string
  }
  message: string
}

/**
 * 用户登录
 */
export const login = (data: LoginParams) => {
  return request.post<LoginResponse>('/auth/login', { ...data, type: 'admin' })
}

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return request.post<UserInfoResponse>('/auth/profile')
}

/**
 * 用户登出
 */
export const logout = () => {
  return request.post('/auth/logout')
}
