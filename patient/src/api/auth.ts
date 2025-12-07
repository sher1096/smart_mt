import request from '@/utils/request'

// 登录参数
export interface LoginParams {
  username: string
  password: string
}

// 注册参数
export interface RegisterParams {
  username: string
  password: string
  name: string
  phone: string
  idCard?: string
}

// 登录
export const login = (data: LoginParams) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data: { ...data, type: 'patient' }
  })
}

// 注册
export const register = (data: RegisterParams) => {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/patients/profile',
    method: 'get'
  })
}

// 更新用户信息
export const updateUserInfo = (data: any) => {
  return request({
    url: '/patients/profile',
    method: 'patch',
    data
  })
}

// 修改密码
export const changePassword = (data: { oldPassword: string; newPassword: string }) => {
  return request({
    url: '/auth/change-password',
    method: 'post',
    data
  })
}

// 发送验证码
export const sendSmsCode = (phone: string) => {
  return request({
    url: '/sms/send',
    method: 'post',
    data: { phone }
  })
}
