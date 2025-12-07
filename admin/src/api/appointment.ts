import { request } from '@/utils/request'

// 获取预约列表
export const getAppointmentList = (params?: any) => {
  return request.get('/appointments', { params })
}

// 获取预约详情
export const getAppointmentDetail = (id: number) => {
  return request.get(`/appointments/${id}`)
}

// 取消预约
export const cancelAppointment = (id: number) => {
  return request.put(`/appointments/${id}/cancel`)
}

// 确认预约
export const confirmAppointment = (id: number) => {
  return request.put(`/appointments/${id}/confirm`)
}

// 完成预约
export const completeAppointment = (id: number) => {
  return request.put(`/appointments/${id}/complete`)
}

// 获取预约统计
export const getAppointmentStats = () => {
  return request.get('/appointments/stats')
}
