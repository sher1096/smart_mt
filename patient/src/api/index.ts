// 统一导出所有 API 模块
export * from './auth'
export * from './department'
export * from './doctor'
export * from './appointment'

// 其他 API 模块
import request from '@/utils/request'

// 病历相关
export const getMedicalRecords = (params?: any) => {
  return request({
    url: '/medical-records/patient/my',
    method: 'get',
    params
  })
}

export const getMedicalRecordDetail = (id: number) => {
  return request({
    url: `/medical-records/${id}`,
    method: 'get'
  })
}

// 处方相关
export const getPrescriptions = (params?: any) => {
  return request({
    url: '/prescriptions/patient',
    method: 'get',
    params
  })
}

export const getPrescriptionDetail = (id: number) => {
  return request({
    url: `/prescriptions/${id}`,
    method: 'get'
  })
}

// 体检相关
export const getExaminations = (params?: any) => {
  return request({
    url: '/examinations/my',
    method: 'get',
    params
  })
}

export const getExaminationDetail = (id: number) => {
  return request({
    url: `/examinations/${id}`,
    method: 'get'
  })
}

// 缴费相关
export const getPayments = (params?: any) => {
  return request({
    url: '/payments/my',
    method: 'get',
    params
  })
}

export const createPayment = (data: any) => {
  return request({
    url: '/payments',
    method: 'post',
    data
  })
}

export const getPaymentDetail = (id: number) => {
  return request({
    url: `/payments/${id}`,
    method: 'get'
  })
}

// 消息相关
export const getMessages = (params?: any) => {
  return request({
    url: '/messages/my/list',
    method: 'get',
    params
  })
}

export const markMessageRead = (ids: number[]) => {
  return request({
    url: '/messages/my/mark-read',
    method: 'patch',
    data: { ids }
  })
}

export const getUnreadCount = () => {
  return request({
    url: '/messages/my/unread-count',
    method: 'get'
  })
}

// 新闻资讯
export const getNewsList = (params?: any) => {
  return request({
    url: '/news',
    method: 'get',
    params
  })
}

export const getLatestNews = (limit?: number) => {
  return request({
    url: '/news/latest',
    method: 'get',
    params: { limit }
  })
}

export const getNewsDetail = (id: number) => {
  return request({
    url: `/news/${id}`,
    method: 'get'
  })
}
