import { request } from '@/utils/request'

// 获取所有消息列表（管理员）
export const getMessageList = (params?: any) => {
  return request.get('/messages/all', { params })
}

// 获取消息详情
export const getMessageDetail = (id: number) => {
  return request.get(`/messages/${id}`)
}

// 发送消息
export const sendMessage = (data: any) => {
  return request.post('/messages', data)
}

// 批量发送消息
export const sendBatchMessage = (data: any) => {
  return request.post('/messages/batch', data)
}
