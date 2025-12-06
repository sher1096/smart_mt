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
    url: '/patient/login',
    method: 'post',
    data
  })
}

// 注册
export const register = (data: RegisterParams) => {
  return request({
    url: '/patient/register',
    method: 'post',
    data
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/patient/info',
    method: 'get'
  })
}

// 更新用户信息
export const updateUserInfo = (data: any) => {
  return request({
    url: '/patient/info',
    method: 'put',
    data
  })
}

// 修改密码
export const changePassword = (data: { oldPassword: string; newPassword: string }) => {
  return request({
    url: '/patient/password',
    method: 'put',
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
