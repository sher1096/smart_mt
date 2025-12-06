import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  id: number
  username: string
  name: string
  phone: string
  idCard?: string
  avatar?: string
  gender?: number
  birthday?: string
  address?: string
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('patient_token') || '')
  const userInfo = ref<UserInfo | null>(
    localStorage.getItem('patient_userInfo')
      ? JSON.parse(localStorage.getItem('patient_userInfo')!)
      : null
  )

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name || userInfo.value?.username || '未登录')

  // 方法
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('patient_token', newToken)
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    localStorage.setItem('patient_userInfo', JSON.stringify(info))
  }

  const login = (newToken: string, info: UserInfo) => {
    setToken(newToken)
    setUserInfo(info)
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('patient_token')
    localStorage.removeItem('patient_userInfo')
  }

  const updateUserInfo = (info: Partial<UserInfo>) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
      localStorage.setItem('patient_userInfo', JSON.stringify(userInfo.value))
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    userName,
    setToken,
    setUserInfo,
    login,
    logout,
    updateUserInfo
  }
})
