import { request } from '@/utils/request'

// 获取缴费列表
export const getPaymentList = (params?: any) => {
  return request.get('/payments', { params })
}

// 获取缴费详情
export const getPaymentDetail = (id: number) => {
  return request.get(`/payments/${id}`)
}

// 确认缴费
export const confirmPayment = (id: number) => {
  return request.put(`/payments/${id}/confirm`)
}

// 获取缴费统计
export const getPaymentStats = () => {
  return request.get('/payments/stats')
}
