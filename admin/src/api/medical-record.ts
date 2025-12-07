import { request } from '@/utils/request'

// 获取病历列表
export const getMedicalRecordList = (params?: any) => {
  return request.get('/medical-records', { params })
}

// 获取病历详情
export const getMedicalRecordDetail = (id: number) => {
  return request.get(`/medical-records/${id}`)
}

// 创建病历
export const createMedicalRecord = (data: any) => {
  return request.post('/medical-records', data)
}

// 更新病历
export const updateMedicalRecord = (id: number, data: any) => {
  return request.patch(`/medical-records/${id}`, data)
}
