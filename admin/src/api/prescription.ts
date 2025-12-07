import { request } from '@/utils/request'

// 获取处方列表
export const getPrescriptionList = (params?: any) => {
  return request.get('/prescriptions', { params })
}

// 获取处方详情
export const getPrescriptionDetail = (id: number) => {
  return request.get(`/prescriptions/${id}`)
}

// 创建处方
export const createPrescription = (data: any) => {
  return request.post('/prescriptions', data)
}

// 更新处方状态
export const updatePrescriptionStatus = (id: number, status: string) => {
  return request.patch(`/prescriptions/${id}/status`, { status })
}
