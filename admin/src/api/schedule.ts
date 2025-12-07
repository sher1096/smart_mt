import { request } from '@/utils/request'

// 获取排班列表
export const getScheduleList = (params?: any) => {
  return request.get('/schedules', { params })
}

// 获取排班详情
export const getScheduleDetail = (id: number) => {
  return request.get(`/schedules/${id}`)
}

// 创建排班
export const createSchedule = (data: any) => {
  return request.post('/schedules', data)
}

// 更新排班
export const updateSchedule = (id: number, data: any) => {
  return request.put(`/schedules/${id}`, data)
}

// 删除排班
export const deleteSchedule = (id: number) => {
  return request.delete(`/schedules/${id}`)
}

// 批量创建排班
export const batchCreateSchedule = (data: any) => {
  return request.post('/schedules/batch', data)
}

// 获取医生排班
export const getDoctorSchedules = (doctorId: number, params?: any) => {
  return request.get(`/schedules/doctor/${doctorId}`, { params })
}
