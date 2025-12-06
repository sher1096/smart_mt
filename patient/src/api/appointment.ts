import request from '@/utils/request'

// 预约挂号参数
export interface AppointmentParams {
  doctorId: number
  scheduleId: number
  patientName: string
  patientPhone: string
  patientIdCard?: string
  appointmentDate: string
  timeSlot: string
  departmentId: number
}

// 创建预约
export const createAppointment = (data: AppointmentParams) => {
  return request({
    url: '/appointment',
    method: 'post',
    data
  })
}

// 我的预约列表
export const getMyAppointments = (params?: { status?: string; page?: number; limit?: number }) => {
  return request({
    url: '/appointment/my',
    method: 'get',
    params
  })
}

// 预约详情
export const getAppointmentDetail = (id: number) => {
  return request({
    url: `/appointment/${id}`,
    method: 'get'
  })
}

// 取消预约
export const cancelAppointment = (id: number, reason?: string) => {
  return request({
    url: `/appointment/${id}/cancel`,
    method: 'put',
    data: { reason }
  })
}

// 获取可预约时间段
export const getAvailableTimeSlots = (doctorId: number, date: string) => {
  return request({
    url: '/appointment/available-slots',
    method: 'get',
    params: { doctorId, date }
  })
}
