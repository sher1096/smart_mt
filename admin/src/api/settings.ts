import { request } from '@/utils/request'

// 获取系统设置
export const getSystemSettings = () => {
  return request.get('/settings')
}

// 保存基础设置
export const saveBasicSettings = (data: any) => {
  return request.post('/settings/basic', data)
}

// 保存预约设置
export const saveAppointmentSettings = (data: any) => {
  return request.post('/settings/appointment', data)
}

// 保存通知设置
export const saveNotificationSettings = (data: any) => {
  return request.post('/settings/notification', data)
}

// 保存安全设置
export const saveSecuritySettings = (data: any) => {
  return request.post('/settings/security', data)
}

// 清理缓存
export const clearCache = () => {
  return request.post('/settings/clear-cache')
}

// 数据备份
export const backupData = () => {
  return request.post('/settings/backup')
}

// 获取系统日志
export const getSystemLogs = (params?: any) => {
  return request.get('/settings/logs', { params })
}
