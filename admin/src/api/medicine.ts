import { request } from '@/utils/request'

// 获取药品分类列表
export const getMedicineCategories = () => {
  return request.get('/medicines/categories')
}

// 创建药品分类
export const createMedicineCategory = (data: any) => {
  return request.post('/medicines/categories', data)
}

// 更新药品分类
export const updateMedicineCategory = (id: number, data: any) => {
  return request.patch(`/medicines/categories/${id}`, data)
}

// 删除药品分类
export const deleteMedicineCategory = (id: number) => {
  return request.delete(`/medicines/categories/${id}`)
}

// 获取药品列表
export const getMedicineList = (params?: any) => {
  return request.get('/medicines', { params })
}

// 获取药品详情
export const getMedicineDetail = (id: number) => {
  return request.get(`/medicines/${id}`)
}

// 创建药品
export const createMedicine = (data: any) => {
  return request.post('/medicines', data)
}

// 更新药品
export const updateMedicine = (id: number, data: any) => {
  return request.patch(`/medicines/${id}`, data)
}

// 删除药品
export const deleteMedicine = (id: number) => {
  return request.delete(`/medicines/${id}`)
}

// 更新库存
export const updateMedicineStock = (id: number, data: { quantity: number; type: 'in' | 'out' }) => {
  return request.patch(`/medicines/${id}/stock`, data)
}

// 获取低库存药品
export const getLowStockMedicines = () => {
  return request.get('/medicines/low-stock')
}

// 获取药品统计
export const getMedicineStatistics = () => {
  return request.get('/medicines/statistics')
}
