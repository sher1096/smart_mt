import request from '@/utils/request'

// 科室列表
export const getDepartmentList = (params?: any) => {
  return request({
    url: '/departments',
    method: 'get',
    params
  })
}

// 科室详情
export const getDepartmentDetail = (id: number) => {
  return request({
    url: `/departments/${id}`,
    method: 'get'
  })
}

// 获取科室分类
export const getDepartmentCategories = () => {
  return request({
    url: '/departments/categories',
    method: 'get'
  })
}

// 根据科室获取医生
export const getDoctorsByDepartment = (departmentId: number, params?: any) => {
  return request({
    url: `/doctors/department/${departmentId}`,
    method: 'get',
    params
  })
}
