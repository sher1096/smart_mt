import { request } from '@/utils/request'

// 获取新闻列表
export const getNewsList = (params?: any) => {
  return request.get('/news', { params })
}

// 获取新闻详情
export const getNewsDetail = (id: number) => {
  return request.get(`/news/${id}`)
}

// 创建新闻
export const createNews = (data: any) => {
  return request.post('/news', data)
}

// 更新新闻
export const updateNews = (id: number, data: any) => {
  return request.put(`/news/${id}`, data)
}

// 删除新闻
export const deleteNews = (id: number) => {
  return request.delete(`/news/${id}`)
}

// 发布/取消发布新闻
export const toggleNewsStatus = (id: number, status: number) => {
  return request.put(`/news/${id}`, { status })
}
