import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface UserInfo {
  id: number
  username: string
  name: string
  role: string
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  const router = useRouter()

  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  // 设置 token
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 设置用户信息
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  // 登录
  const login = async (username: string, password: string) => {
    // 这里会在 API 模块中实现具体的登录逻辑
    // 此处仅为状态管理
    return { username, password }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  // 获取用户信息
  const getUserInfo = async () => {
    // 这里会调用 API 获取用户信息
    // 此处仅为占位
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    login,
    logout,
    getUserInfo
  }
})
