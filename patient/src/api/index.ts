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
    url: '/medical-record/my',
    method: 'get',
    params
  })
}

export const getMedicalRecordDetail = (id: number) => {
  return request({
    url: `/medical-record/${id}`,
    method: 'get'
  })
}

// 处方相关
export const getPrescriptions = (params?: any) => {
  return request({
    url: '/prescription/my',
    method: 'get',
    params
  })
}

export const getPrescriptionDetail = (id: number) => {
  return request({
    url: `/prescription/${id}`,
    method: 'get'
  })
}

// 体检相关
export const getExaminations = (params?: any) => {
  return request({
    url: '/examination/my',
    method: 'get',
    params
  })
}

export const getExaminationDetail = (id: number) => {
  return request({
    url: `/examination/${id}`,
    method: 'get'
  })
}

// 缴费相关
export const getPayments = (params?: any) => {
  return request({
    url: '/payment/my',
    method: 'get',
    params
  })
}

export const createPayment = (data: any) => {
  return request({
    url: '/payment',
    method: 'post',
    data
  })
}

export const getPaymentDetail = (id: number) => {
  return request({
    url: `/payment/${id}`,
    method: 'get'
  })
}

// 消息相关
export const getMessages = (params?: any) => {
  return request({
    url: '/message/my',
    method: 'get',
    params
  })
}

export const markMessageRead = (id: number) => {
  return request({
    url: `/message/${id}/read`,
    method: 'put'
  })
}

export const getUnreadCount = () => {
  return request({
    url: '/message/unread-count',
    method: 'get'
  })
}

// 新闻资讯
export const getNewsList = (params?: any) => {
  return request({
    url: '/news/list',
    method: 'get',
    params
  })
}

export const getNewsDetail = (id: number) => {
  return request({
    url: `/news/${id}`,
    method: 'get'
  })
}
