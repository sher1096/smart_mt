import { request } from '@/utils/request'

// 获取科室分类列表
export const getDepartmentCategories = () => {
  return request.get('/departments/categories')
}

// 获取科室列表
export const getDepartmentList = (params?: any) => {
  return request.get('/departments', { params })
}

// 获取科室详情
export const getDepartmentDetail = (id: number) => {
  return request.get(`/departments/${id}`)
}

// 创建科室
export const createDepartment = (data: any) => {
  return request.post('/departments', data)
}

// 更新科室
export const updateDepartment = (id: number, data: any) => {
  return request.put(`/departments/${id}`, data)
}

// 删除科室
export const deleteDepartment = (id: number) => {
  return request.delete(`/departments/${id}`)
}

// 创建科室分类
export const createDepartmentCategory = (data: any) => {
  return request.post('/departments/categories', data)
}

// 更新科室分类
export const updateDepartmentCategory = (id: number, data: any) => {
  return request.put(`/departments/categories/${id}`, data)
}

// 删除科室分类
export const deleteDepartmentCategory = (id: number) => {
  return request.delete(`/departments/categories/${id}`)
}
