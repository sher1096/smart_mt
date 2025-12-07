import { request } from '@/utils/request'

// 获取仪表盘统计数据
export const getDashboardStats = () => {
  return request.get('/system/stats')
}

// 获取今日预约数
export const getTodayAppointments = () => {
  return request.get('/appointments', { params: { date: new Date().toISOString().split('T')[0] } })
}

// 获取待诊患者数
export const getPendingAppointments = () => {
  return request.get('/appointments', { params: { status: 'confirmed' } })
}

// 获取最近活动
export const getRecentActivities = () => {
  return request.get('/appointments', { params: { page: 1, pageSize: 10 } })
}
