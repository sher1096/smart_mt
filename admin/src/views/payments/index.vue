<template>
  <div class="page-container">
    <n-card title="缴费管理" :bordered="false">
      <!-- 统计卡片 -->
      <div class="stats-row">
        <n-card class="stat-card">
          <div class="stat-value">{{ stats.todayCount }}</div>
          <div class="stat-label">今日缴费笔数</div>
        </n-card>
        <n-card class="stat-card">
          <div class="stat-value">¥{{ stats.todayAmount }}</div>
          <div class="stat-label">今日缴费金额</div>
        </n-card>
        <n-card class="stat-card">
          <div class="stat-value">{{ stats.pendingCount }}</div>
          <div class="stat-label">待确认缴费</div>
        </n-card>
        <n-card class="stat-card">
          <div class="stat-value">¥{{ stats.totalAmount }}</div>
          <div class="stat-label">总缴费金额</div>
        </n-card>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <n-space>
          <n-select v-model:value="searchStatus" :options="statusOptions" placeholder="缴费状态" clearable style="width: 120px" />
          <n-select v-model:value="searchType" :options="typeOptions" placeholder="缴费类型" clearable style="width: 120px" />
          <n-date-picker v-model:value="searchDateRange" type="daterange" placeholder="选择日期范围" clearable style="width: 260px" />
          <n-input v-model:value="searchText" placeholder="搜索患者/订单号" clearable style="width: 150px">
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
    <n-modal v-model:show="showDetail" preset="card" title="缴费详情" style="width: 550px;">
      <n-descriptions :column="1" label-placement="left" bordered v-if="currentRow">
        <n-descriptions-item label="订单编号">{{ currentRow.orderNo }}</n-descriptions-item>
        <n-descriptions-item label="患者姓名">{{ currentRow.patientName }}</n-descriptions-item>
        <n-descriptions-item label="患者电话">{{ currentRow.patientPhone }}</n-descriptions-item>
        <n-descriptions-item label="缴费类型">
          <n-tag :type="getTypeTagType(currentRow.type)">{{ getTypeText(currentRow.type) }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="缴费金额">
          <span style="color: #f0a020; font-weight: bold;">¥{{ currentRow.amount }}</span>
        </n-descriptions-item>
        <n-descriptions-item label="支付方式">{{ getPayMethodText(currentRow.payMethod) }}</n-descriptions-item>
        <n-descriptions-item label="关联预约" v-if="currentRow.appointment">
          {{ currentRow.appointment.appointmentNo }} - {{ currentRow.appointment.doctor?.name }}
        </n-descriptions-item>
        <n-descriptions-item label="缴费状态">
          <n-tag :type="getStatusType(currentRow.status)">{{ getStatusText(currentRow.status) }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="备注" v-if="currentRow.remark">{{ currentRow.remark }}</n-descriptions-item>
        <n-descriptions-item label="创建时间">{{ formatTime(currentRow.createdAt) }}</n-descriptions-item>
        <n-descriptions-item label="支付时间" v-if="currentRow.paidAt">{{ formatTime(currentRow.paidAt) }}</n-descriptions-item>
      </n-descriptions>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetail = false">关闭</n-button>
          <n-button v-if="currentRow?.status === 'pending'" type="primary" @click="handleConfirm">确认到账</n-button>
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
import { SearchOutline, EyeOutline, CheckmarkCircleOutline } from '@vicons/ionicons5'
import { getPaymentList, confirmPayment, getPaymentStats } from '@/api/payment'

const message = useMessage()

const loading = ref(false)
const showDetail = ref(false)
const searchText = ref('')
const searchStatus = ref<string | null>(null)
const searchType = ref<string | null>(null)
const searchDateRange = ref<[number, number] | null>(null)
const tableData = ref<any[]>([])
const currentRow = ref<any>(null)

const stats = ref({
  todayCount: 0,
  todayAmount: 0,
  pendingCount: 0,
  totalAmount: 0
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
})

const statusOptions = [
  { label: '待支付', value: 'pending' },
  { label: '已支付', value: 'paid' },
  { label: '已取消', value: 'cancelled' },
  { label: '已退款', value: 'refunded' }
]

const typeOptions = [
  { label: '挂号费', value: 'registration' },
  { label: '诊疗费', value: 'treatment' },
  { label: '药品费', value: 'medicine' },
  { label: '检查费', value: 'examination' },
  { label: '其他', value: 'other' }
]

const getStatusType = (status: string) => {
  const typeMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    pending: 'warning',
    paid: 'success',
    cancelled: 'error',
    refunded: 'info'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return textMap[status] || status
}

const getTypeTagType = (type: string) => {
  const typeMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    registration: 'info',
    treatment: 'success',
    medicine: 'warning',
    examination: 'default',
    other: 'default'
  }
  return typeMap[type] || 'default'
}

const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    registration: '挂号费',
    treatment: '诊疗费',
    medicine: '药品费',
    examination: '检查费',
    other: '其他'
  }
  return textMap[type] || type
}

const getPayMethodText = (method: string) => {
  const textMap: Record<string, string> = {
    wechat: '微信支付',
    alipay: '支付宝',
    cash: '现金',
    card: '银行卡',
    insurance: '医保'
  }
  return textMap[method] || method || '-'
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleString()
}

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '订单编号', key: 'orderNo', width: 160 },
  { title: '患者姓名', key: 'patientName', width: 100 },
  { title: '患者电话', key: 'patientPhone', width: 120 },
  {
    title: '类型',
    key: 'type',
    width: 90,
    render: (row: any) => h(NTag, { type: getTypeTagType(row.type), size: 'small' }, () => getTypeText(row.type))
  },
  {
    title: '金额',
    key: 'amount',
    width: 100,
    render: (row: any) => h('span', { style: 'color: #f0a020; font-weight: 500;' }, `¥${row.amount}`)
  },
  { title: '支付方式', key: 'payMethod', width: 90, render: (row: any) => getPayMethodText(row.payMethod) },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render: (row: any) => h(NTag, { type: getStatusType(row.status), size: 'small' }, () => getStatusText(row.status))
  },
  { title: '创建时间', key: 'createdAt', width: 160, render: (row: any) => formatTime(row.createdAt) },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    render: (row: any) => h(NSpace, {}, () => [
      h(NButton, { text: true, type: 'primary', onClick: () => handleView(row) }, { default: () => '详情', icon: () => h(NIcon, { component: EyeOutline }) }),
      row.status === 'pending' ? h(NButton, { text: true, type: 'success', onClick: () => handleConfirmDirect(row) }, { default: () => '确认', icon: () => h(NIcon, { component: CheckmarkCircleOutline }) }) : null
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
    if (searchText.value) {
      params.keyword = searchText.value
    }
    if (searchStatus.value) {
      params.status = searchStatus.value
    }
    if (searchType.value) {
      params.type = searchType.value
    }
    if (searchDateRange.value) {
      params.startDate = new Date(searchDateRange.value[0]).toISOString().split('T')[0]
      params.endDate = new Date(searchDateRange.value[1]).toISOString().split('T')[0]
    }
    const res = await getPaymentList(params)
    tableData.value = res.data?.list || res.list || []
    pagination.itemCount = res.data?.total || res.total || 0
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await getPaymentStats()
    const data = res.data || res || {}
    stats.value = {
      todayCount: data.todayCount || 0,
      todayAmount: data.todayAmount || 0,
      pendingCount: data.pendingCount || 0,
      totalAmount: data.totalAmount || 0
    }
  } catch (error) {
    console.error('加载统计数据失败', error)
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
    await confirmPayment(currentRow.value.id)
    message.success('确认成功')
    showDetail.value = false
    loadData()
    loadStats()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

const handleConfirmDirect = async (row: any) => {
  try {
    await confirmPayment(row.id)
    message.success('确认成功')
    loadData()
    loadStats()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<style scoped>
.page-container {
  width: 100%;
}

.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #18a058;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
</style>
