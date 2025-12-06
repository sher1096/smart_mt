import request from '@/utils/request'

// 医生列表
export const getDoctorList = (params?: any) => {
  return request({
    url: '/doctor/list',
    method: 'get',
    params
  })
}

// 医生详情
export const getDoctorDetail = (id: number) => {
  return request({
    url: `/doctor/${id}`,
    method: 'get'
  })
}

// 获取医生排班
export const getDoctorSchedule = (doctorId: number, params?: { date?: string }) => {
  return request({
    url: `/doctor/${doctorId}/schedule`,
    method: 'get',
    params
  })
}

// 获取推荐医生
export const getRecommendedDoctors = (limit?: number) => {
  return request({
    url: '/doctor/recommended',
    method: 'get',
    params: { limit }
  })
}
