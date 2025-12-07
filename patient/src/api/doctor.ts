import request from '@/utils/request'

// 医生列表
export const getDoctorList = (params?: any) => {
  return request({
    url: '/doctors',
    method: 'get',
    params
  })
}

// 医生详情
export const getDoctorDetail = (id: number) => {
  return request({
    url: `/doctors/${id}`,
    method: 'get'
  })
}

// 获取医生排班
export const getDoctorSchedule = (doctorId: number, params?: { date?: string }) => {
  return request({
    url: '/schedules/available',
    method: 'get',
    params: { doctorId, ...params }
  })
}

// 获取推荐医生（使用医生列表接口，按status排序）
export const getRecommendedDoctors = (limit?: number) => {
  return request({
    url: '/doctors',
    method: 'get',
    params: { limit: limit || 4, page: 1 }
  })
}
