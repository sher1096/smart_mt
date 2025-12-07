import { request } from '@/utils/request'

// 获取医生列表
export const getDoctorList = (params?: any) => {
  return request.get('/doctors', { params })
}

// 获取医生详情
export const getDoctorDetail = (id: number) => {
  return request.get(`/doctors/${id}`)
}

// 创建医生
export const createDoctor = (data: any) => {
  return request.post('/doctors', data)
}

// 更新医生
export const updateDoctor = (id: number, data: any) => {
  return request.put(`/doctors/${id}`, data)
}

// 删除医生
export const deleteDoctor = (id: number) => {
  return request.delete(`/doctors/${id}`)
}

// 根据科室获取医生
export const getDoctorsByDepartment = (departmentId: number) => {
  return request.get(`/doctors/department/${departmentId}`)
}
