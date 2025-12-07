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
    url: '/appointments',
    method: 'post',
    data
  })
}

// 我的预约列表
export const getMyAppointments = (params?: { status?: string; page?: number; limit?: number }) => {
  return request({
    url: '/appointments/my',
    method: 'get',
    params
  })
}

// 预约详情
export const getAppointmentDetail = (id: number) => {
  return request({
    url: `/appointments/${id}`,
    method: 'get'
  })
}

// 取消预约
export const cancelAppointment = (id: number, reason?: string) => {
  return request({
    url: `/appointments/${id}/cancel`,
    method: 'post',
    data: { reason }
  })
}

// 获取可预约时间段
export const getAvailableTimeSlots = (doctorId: number, date: string) => {
  return request({
    url: '/schedules/available',
    method: 'get',
    params: { doctorId, date }
  })
}
