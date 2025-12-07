<template>
  <div class="page-container">
    <n-card title="排班管理" :bordered="false">
      <!-- 操作栏 -->
      <div class="action-bar">
        <n-space>
          <n-button type="primary" @click="handleAdd">
            <template #icon><n-icon :component="AddOutline" /></template>
            新增排班
          </n-button>
        </n-space>
        <n-space>
          <n-select v-model:value="searchDeptId" :options="departmentOptions" placeholder="选择科室" clearable style="width: 150px" @update:value="loadDoctors" />
          <n-select v-model:value="searchDoctorId" :options="doctorOptions" placeholder="选择医生" clearable style="width: 150px" />
          <n-date-picker v-model:value="searchDate" type="date" placeholder="选择日期" clearable style="width: 150px" />
          <n-button @click="loadData">查询</n-button>
        </n-space>
      </div>

      <!-- 数据表格 -->
      <n-data-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: any) => row.id"
        @update:page="handlePageChange"
      />
    </n-card>

    <!-- 新增/编辑弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="isEdit ? '编辑排班' : '新增排班'" style="width: 500px;">
      <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="80">
        <n-form-item label="选择科室" path="departmentId">
          <n-select v-model:value="formData.departmentId" :options="departmentOptions" placeholder="请选择科室" @update:value="loadFormDoctors" />
        </n-form-item>
        <n-form-item label="选择医生" path="doctorId">
          <n-select v-model:value="formData.doctorId" :options="formDoctorOptions" placeholder="请选择医生" />
        </n-form-item>
        <n-form-item label="排班日期" path="scheduleDate">
          <n-date-picker v-model:value="formData.scheduleDate" type="date" placeholder="请选择日期" style="width: 100%" />
        </n-form-item>
        <n-form-item label="时间段" path="period">
          <n-select v-model:value="formData.period" :options="periodOptions" placeholder="请选择时间段" />
        </n-form-item>
        <n-form-item label="最大预约数" path="maxAppointments">
          <n-input-number v-model:value="formData.maxAppointments" :min="1" :max="100" style="width: 100%" />
        </n-form-item>
        <n-form-item label="状态" path="status">
          <n-switch v-model:value="formData.status" :checked-value="1" :unchecked-value="0" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NCard, NButton, NSpace, NIcon, NDataTable, NModal, NForm, NFormItem,
  NSelect, NSwitch, NInputNumber, NDatePicker, NTag, useMessage, useDialog, FormInst
} from 'naive-ui'
import { AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { getScheduleList, createSchedule, updateSchedule, deleteSchedule } from '@/api/schedule'
import { getDepartmentList } from '@/api/department'
import { getDoctorsByDepartment, getDoctorList } from '@/api/doctor'

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const submitLoading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const searchDeptId = ref<number | null>(null)
const searchDoctorId = ref<number | null>(null)
const searchDate = ref<number | null>(null)
const tableData = ref<any[]>([])
const formRef = ref<FormInst | null>(null)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
})

const formData = ref({
  id: 0,
  departmentId: null as number | null,
  doctorId: null as number | null,
  scheduleDate: null as number | null,
  period: '',
  maxAppointments: 20,
  status: 1
})

const rules = {
  departmentId: { required: true, type: 'number', message: '请选择科室', trigger: 'change' },
  doctorId: { required: true, type: 'number', message: '请选择医生', trigger: 'change' },
  scheduleDate: { required: true, type: 'number', message: '请选择日期', trigger: 'change' },
  period: { required: true, message: '请选择时间段', trigger: 'change' }
}

const departmentOptions = ref<any[]>([])
const doctorOptions = ref<any[]>([])
const formDoctorOptions = ref<any[]>([])

const periodOptions = [
  { label: '上午 (08:00-12:00)', value: 'morning' },
  { label: '下午 (14:00-18:00)', value: 'afternoon' },
  { label: '晚上 (18:00-21:00)', value: 'evening' }
]

const getPeriodText = (period: string) => {
  const textMap: Record<string, string> = {
    morning: '上午',
    afternoon: '下午',
    evening: '晚上'
  }
  return textMap[period] || period
}

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '医生', key: 'doctor.name', width: 100, render: (row: any) => row.doctor?.name || '-' },
  { title: '科室', key: 'doctor.department.name', width: 100, render: (row: any) => row.doctor?.department?.name || '-' },
  { title: '排班日期', key: 'scheduleDate', width: 110 },
  { title: '时间段', key: 'period', width: 80, render: (row: any) => getPeriodText(row.period) },
  { title: '最大预约', key: 'maxAppointments', width: 80 },
  { title: '已预约', key: 'currentAppointments', width: 80 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: any) => h(NTag, { type: row.status === 1 ? 'success' : 'error', size: 'small' }, () => row.status === 1 ? '启用' : '停用')
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row: any) => h(NSpace, {}, () => [
      h(NButton, { text: true, type: 'primary', onClick: () => handleEdit(row) }, { default: () => '编辑', icon: () => h(NIcon, { component: CreateOutline }) }),
      h(NButton, { text: true, type: 'error', onClick: () => handleDelete(row) }, { default: () => '删除', icon: () => h(NIcon, { component: TrashOutline }) })
    ])
  }
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    if (searchDeptId.value) {
      params.departmentId = searchDeptId.value
    }
    if (searchDoctorId.value) {
      params.doctorId = searchDoctorId.value
    }
    if (searchDate.value) {
      params.date = new Date(searchDate.value).toISOString().split('T')[0]
    }
    const res = await getScheduleList(params)
    tableData.value = res.data?.list || res.list || []
    pagination.itemCount = res.data?.total || res.total || 0
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const loadDepartments = async () => {
  try {
    const res = await getDepartmentList({ pageSize: 100 })
    const list = res.data?.list || res.list || []
    departmentOptions.value = list.map((dept: any) => ({
      label: dept.name,
      value: dept.id
    }))
  } catch (error) {
    console.error('加载科室失败', error)
  }
}

const loadDoctors = async () => {
  doctorOptions.value = []
  if (!searchDeptId.value) return
  try {
    const res = await getDoctorsByDepartment(searchDeptId.value)
    const list = res.data || res || []
    doctorOptions.value = list.map((doc: any) => ({
      label: doc.name,
      value: doc.id
    }))
  } catch (error) {
    console.error('加载医生失败', error)
  }
}

const loadFormDoctors = async () => {
  formDoctorOptions.value = []
  formData.value.doctorId = null
  if (!formData.value.departmentId) return
  try {
    const res = await getDoctorsByDepartment(formData.value.departmentId)
    const list = res.data || res || []
    formDoctorOptions.value = list.map((doc: any) => ({
      label: doc.name,
      value: doc.id
    }))
  } catch (error) {
    console.error('加载医生失败', error)
  }
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  formData.value = { id: 0, departmentId: null, doctorId: null, scheduleDate: null, period: '', maxAppointments: 20, status: 1 }
  formDoctorOptions.value = []
  showModal.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  formData.value = {
    ...row,
    departmentId: row.doctor?.departmentId,
    scheduleDate: new Date(row.scheduleDate).getTime()
  }
  loadFormDoctors()
  showModal.value = true
}

const handleDelete = (row: any) => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除该排班记录吗？此操作不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteSchedule(row.id)
        message.success('删除成功')
        loadData()
      } catch (error: any) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true

    const submitData = {
      ...formData.value,
      scheduleDate: formData.value.scheduleDate ? new Date(formData.value.scheduleDate).toISOString().split('T')[0] : ''
    }

    if (isEdit.value) {
      await updateSchedule(formData.value.id, submitData)
      message.success('更新成功')
    } else {
      await createSchedule(submitData)
      message.success('创建成功')
    }
    showModal.value = false
    loadData()
  } catch (error: any) {
    if (!error?.errors) {
      message.error(error.message || '操作失败')
    }
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadData()
  loadDepartments()
})
</script>

<style scoped>
.page-container {
  width: 100%;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
</style>
