import { request } from '@/utils/request'

// 获取体检项目列表
export const getExaminationItems = (params?: any) => {
  return request.get('/examinations/items', { params })
}

// 创建体检项目
export const createExaminationItem = (data: any) => {
  return request.post('/examinations/items', data)
}

// 更新体检项目
export const updateExaminationItem = (id: number, data: any) => {
  return request.patch(`/examinations/items/${id}`, data)
}

// 删除体检项目
export const deleteExaminationItem = (id: number) => {
  return request.delete(`/examinations/items/${id}`)
}

// 获取体检预约列表
export const getExaminationList = (params?: any) => {
  return request.get('/examinations', { params })
}

// 获取体检详情
export const getExaminationDetail = (id: number) => {
  return request.get(`/examinations/${id}`)
}

// 更新体检状态
export const updateExaminationStatus = (id: number, status: string) => {
  return request.patch(`/examinations/${id}/status`, { status })
}

// 取消体检
export const cancelExamination = (id: number, reason?: string) => {
  return request.post(`/examinations/${id}/admin-cancel`, { reason })
}
