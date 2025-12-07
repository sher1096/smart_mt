<template>
  <div class="page-container">
    <n-card title="预约挂号管理" :bordered="false">
      <!-- 操作栏 -->
      <div class="action-bar">
        <n-space>
          <n-select v-model:value="searchStatus" :options="statusOptions" placeholder="预约状态" clearable style="width: 120px" />
          <n-date-picker v-model:value="searchDate" type="date" placeholder="选择日期" clearable style="width: 150px" />
          <n-input v-model:value="searchText" placeholder="搜索患者/医生" clearable style="width: 150px">
            <template #prefix><n-icon :component="SearchOutline" /></template>
          </n-input>
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

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="预约详情" style="width: 500px;">
      <n-descriptions :column="1" label-placement="left" bordered v-if="currentRow">
        <n-descriptions-item label="预约编号">{{ currentRow.appointmentNo }}</n-descriptions-item>
        <n-descriptions-item label="患者姓名">{{ currentRow.patientName }}</n-descriptions-item>
        <n-descriptions-item label="患者电话">{{ currentRow.patientPhone }}</n-descriptions-item>
        <n-descriptions-item label="预约医生">{{ currentRow.doctor?.name }}</n-descriptions-item>
        <n-descriptions-item label="预约科室">{{ currentRow.department?.name }}</n-descriptions-item>
        <n-descriptions-item label="预约日期">{{ currentRow.appointmentDate }}</n-descriptions-item>
        <n-descriptions-item label="预约时段">{{ currentRow.timeSlot }}</n-descriptions-item>
        <n-descriptions-item label="挂号费">¥{{ currentRow.fee || 0 }}</n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="getStatusType(currentRow.status)">{{ getStatusText(currentRow.status) }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ formatTime(currentRow.createdAt) }}</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetail = false">关闭</n-button>
          <n-button v-if="currentRow?.status === 'pending'" type="primary" @click="handleConfirm">确认预约</n-button>
          <n-button v-if="currentRow?.status === 'confirmed'" type="success" @click="handleComplete">完成就诊</n-button>
          <n-button v-if="['pending', 'confirmed'].includes(currentRow?.status)" type="error" @click="handleCancel">取消预约</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NCard, NButton, NSpace, NInput, NIcon, NDataTable, NModal, NSelect,
  NDatePicker, NDescriptions, NDescriptionsItem, NTag, useMessage
} from 'naive-ui'
import { SearchOutline, EyeOutline } from '@vicons/ionicons5'
import { getAppointmentList, confirmAppointment, completeAppointment, cancelAppointment } from '@/api/appointment'

const message = useMessage()

const loading = ref(false)
const showDetail = ref(false)
const searchText = ref('')
const searchStatus = ref<string | null>(null)
const searchDate = ref<number | null>(null)
const tableData = ref<any[]>([])
const currentRow = ref<any>(null)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
})

const statusOptions = [
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const getStatusType = (status: string) => {
  const typeMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    pending: 'warning',
    confirmed: 'info',
    completed: 'success',
    cancelled: 'error'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleString()
}

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '预约编号', key: 'appointmentNo', width: 140 },
  { title: '患者姓名', key: 'patientName', width: 100 },
  { title: '患者电话', key: 'patientPhone', width: 120 },
  { title: '预约医生', key: 'doctor.name', width: 100, render: (row: any) => row.doctor?.name || '-' },
  { title: '预约科室', key: 'department.name', width: 100, render: (row: any) => row.department?.name || '-' },
  { title: '预约日期', key: 'appointmentDate', width: 110 },
  { title: '时段', key: 'timeSlot', width: 100 },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render: (row: any) => h(NTag, { type: getStatusType(row.status), size: 'small' }, () => getStatusText(row.status))
  },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    render: (row: any) => h(NButton, { text: true, type: 'primary', onClick: () => handleView(row) }, { default: () => '详情', icon: () => h(NIcon, { component: EyeOutline }) })
  }
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    if (searchText.value) {
      params.keyword = searchText.value
    }
    if (searchStatus.value) {
      params.status = searchStatus.value
    }
    if (searchDate.value) {
      params.date = new Date(searchDate.value).toISOString().split('T')[0]
    }
    const res = await getAppointmentList(params)
    tableData.value = res.data?.list || res.list || []
    pagination.itemCount = res.data?.total || res.total || 0
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadData()
}

const handleView = (row: any) => {
  currentRow.value = row
  showDetail.value = true
}

const handleConfirm = async () => {
  try {
    await confirmAppointment(currentRow.value.id)
    message.success('确认成功')
    showDetail.value = false
    loadData()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

const handleComplete = async () => {
  try {
    await completeAppointment(currentRow.value.id)
    message.success('完成就诊')
    showDetail.value = false
    loadData()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

const handleCancel = async () => {
  try {
    await cancelAppointment(currentRow.value.id)
    message.success('取消成功')
    showDetail.value = false
    loadData()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  width: 100%;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
</style>
