<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>处方管理</h2>
        <p>查看和管理患者处方记录</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card stat-card-1">
        <div class="stat-icon">
          <n-icon :component="DocumentTextOutline" :size="28" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">处方总数</div>
        </div>
      </div>
      <div class="stat-card stat-card-2">
        <div class="stat-icon">
          <n-icon :component="HourglassOutline" :size="28" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">待取药</div>
        </div>
      </div>
      <div class="stat-card stat-card-3">
        <div class="stat-icon">
          <n-icon :component="CheckmarkCircleOutline" :size="28" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.dispensed }}</div>
          <div class="stat-label">已发药</div>
        </div>
      </div>
      <div class="stat-card stat-card-4">
        <div class="stat-icon">
          <n-icon :component="TodayOutline" :size="28" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.today }}</div>
          <div class="stat-label">今日处方</div>
        </div>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <n-card :bordered="false" class="filter-card">
      <n-space>
        <n-select
          v-model:value="searchStatus"
          :options="statusOptions"
          placeholder="处方状态"
          clearable
          style="width: 120px"
        />
        <n-input
          v-model:value="searchText"
          placeholder="搜索患者/医生/处方号"
          clearable
          style="width: 200px"
          @keyup.enter="loadData"
        >
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-date-picker
          v-model:value="searchDateRange"
          type="daterange"
          clearable
          style="width: 260px"
        />
        <n-button type="primary" @click="loadData">查询</n-button>
        <n-button @click="resetSearch">重置</n-button>
      </n-space>
    </n-card>

    <!-- 数据表格 -->
    <n-card :bordered="false" class="table-card">
      <n-data-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: any) => row.id"
        :scroll-x="1200"
        @update:page="handlePageChange"
      />
    </n-card>

    <!-- 处方详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="处方详情" style="width: 750px;">
      <div v-if="currentPrescription" class="prescription-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4><n-icon :component="InformationCircleOutline" /> 基本信息</h4>
          <n-descriptions :column="2" label-placement="left" bordered>
            <n-descriptions-item label="处方编号">{{ currentPrescription.prescriptionNo }}</n-descriptions-item>
            <n-descriptions-item label="处方状态">
              <n-tag :type="getStatusType(currentPrescription.status)">{{ getStatusText(currentPrescription.status) }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="患者姓名">{{ currentPrescription.patient?.name || '-' }}</n-descriptions-item>
            <n-descriptions-item label="就诊卡号">{{ currentPrescription.patient?.medicalCardNo || '-' }}</n-descriptions-item>
            <n-descriptions-item label="开方医生">{{ currentPrescription.doctor?.name || '-' }}</n-descriptions-item>
            <n-descriptions-item label="所属科室">{{ currentPrescription.department?.name || '-' }}</n-descriptions-item>
            <n-descriptions-item label="诊断">{{ currentPrescription.diagnosis || '-' }}</n-descriptions-item>
            <n-descriptions-item label="开方时间">{{ formatTime(currentPrescription.createdAt) }}</n-descriptions-item>
          </n-descriptions>
        </div>

        <!-- 药品清单 -->
        <div class="detail-section">
          <h4><n-icon :component="MedkitOutline" /> 药品清单</h4>
          <n-data-table
            :columns="medicineColumns"
            :data="currentPrescription.items || []"
            :bordered="true"
            size="small"
          />
          <div class="total-price">
            处方总金额：<span class="price">¥{{ calculateTotal(currentPrescription.items) }}</span>
          </div>
        </div>

        <!-- 用药说明 -->
        <div class="detail-section" v-if="currentPrescription.notes">
          <h4><n-icon :component="AlertCircleOutline" /> 用药说明</h4>
          <p class="notes-text">{{ currentPrescription.notes }}</p>
        </div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetail = false">关闭</n-button>
          <n-button v-if="currentPrescription?.status === 'pending'" type="warning" @click="handleDispense">
            <template #icon><n-icon :component="CheckmarkDoneOutline" /></template>
            确认发药
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NCard, NButton, NSpace, NInput, NIcon, NDataTable, NModal, NSelect,
  NDatePicker, NDescriptions, NDescriptionsItem, NTag, useMessage, useDialog
} from 'naive-ui'
import {
  SearchOutline, EyeOutline, DocumentTextOutline, HourglassOutline,
  CheckmarkCircleOutline, TodayOutline, InformationCircleOutline,
  MedkitOutline, AlertCircleOutline, CheckmarkDoneOutline
} from '@vicons/ionicons5'
import { getPrescriptionList, updatePrescriptionStatus } from '@/api/prescription'

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const showDetail = ref(false)
const searchText = ref('')
const searchStatus = ref<string | null>(null)
const searchDateRange = ref<[number, number] | null>(null)
const tableData = ref<any[]>([])
const currentPrescription = ref<any>(null)

const stats = ref({
  total: 0,
  pending: 0,
  dispensed: 0,
  today: 0
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
})

const statusOptions = [
  { label: '待取药', value: 'pending' },
  { label: '已发药', value: 'dispensed' },
  { label: '已取消', value: 'cancelled' }
]

const getStatusType = (status: string) => {
  const typeMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    pending: 'warning',
    dispensed: 'success',
    cancelled: 'error'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待取药',
    dispensed: '已发药',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

const formatTime = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const calculateTotal = (items: any[]) => {
  if (!items || items.length === 0) return '0.00'
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
}

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '处方编号', key: 'prescriptionNo', width: 150 },
  { title: '患者姓名', key: 'patient.name', width: 100, render: (row: any) => row.patient?.name || '-' },
  { title: '开方医生', key: 'doctor.name', width: 100, render: (row: any) => row.doctor?.name || '-' },
  { title: '诊断', key: 'diagnosis', width: 150, ellipsis: { tooltip: true } },
  {
    title: '药品数',
    key: 'itemCount',
    width: 80,
    render: (row: any) => h(NTag, { type: 'info', size: 'small' }, () => `${row.items?.length || 0}种`)
  },
  {
    title: '总金额',
    key: 'totalPrice',
    width: 100,
    render: (row: any) => h('span', { style: 'color: #f0a020; font-weight: 500;' }, `¥${calculateTotal(row.items)}`)
  },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render: (row: any) => h(NTag, { type: getStatusType(row.status), size: 'small' }, () => getStatusText(row.status))
  },
  { title: '开方时间', key: 'createdAt', width: 160, render: (row: any) => formatTime(row.createdAt) },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: (row: any) => h(NSpace, { size: 4 }, () => [
      h(NButton, { text: true, type: 'primary', onClick: () => handleView(row) }, { default: () => '详情', icon: () => h(NIcon, { component: EyeOutline }) }),
      row.status === 'pending' ? h(NButton, { text: true, type: 'success', onClick: () => handleDispenseDirect(row) }, { default: () => '发药' }) : null
    ])
  }
]

const medicineColumns = [
  { title: '药品名称', key: 'medicine.name', render: (row: any) => row.medicine?.name || row.medicineName || '-' },
  { title: '规格', key: 'medicine.specification', render: (row: any) => row.medicine?.specification || '-' },
  { title: '数量', key: 'quantity' },
  { title: '单位', key: 'medicine.unit', render: (row: any) => row.medicine?.unit || row.unit || '-' },
  { title: '单价', key: 'price', render: (row: any) => `¥${row.price}` },
  { title: '金额', key: 'total', render: (row: any) => `¥${(row.price * row.quantity).toFixed(2)}` },
  { title: '用法', key: 'usage', ellipsis: { tooltip: true } }
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    if (searchText.value) params.keyword = searchText.value
    if (searchStatus.value) params.status = searchStatus.value
    if (searchDateRange.value) {
      params.startDate = new Date(searchDateRange.value[0]).toISOString().split('T')[0]
      params.endDate = new Date(searchDateRange.value[1]).toISOString().split('T')[0]
    }

    const res = await getPrescriptionList(params)
    tableData.value = res.data?.list || res.list || []
    pagination.itemCount = res.data?.total || res.total || 0

    // 更新统计
    stats.value.total = pagination.itemCount
    stats.value.pending = tableData.value.filter((p: any) => p.status === 'pending').length
    stats.value.dispensed = tableData.value.filter((p: any) => p.status === 'dispensed').length
    stats.value.today = tableData.value.filter((p: any) => {
      const date = new Date(p.createdAt).toDateString()
      return date === new Date().toDateString()
    }).length
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchText.value = ''
  searchStatus.value = null
  searchDateRange.value = null
  pagination.page = 1
  loadData()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadData()
}

const handleView = (row: any) => {
  currentPrescription.value = row
  showDetail.value = true
}

const handleDispense = async () => {
  dialog.warning({
    title: '确认发药',
    content: '确定已完成该处方的药品发放吗？',
    positiveText: '确认发药',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await updatePrescriptionStatus(currentPrescription.value.id, 'dispensed')
        message.success('发药成功')
        showDetail.value = false
        loadData()
      } catch (error: any) {
        message.error(error.message || '操作失败')
      }
    }
  })
}

const handleDispenseDirect = (row: any) => {
  currentPrescription.value = row
  handleDispense()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.page-header p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-card-1 .stat-icon { background: linear-gradient(135deg, #2080f0, #36a2eb); }
.stat-card-2 .stat-icon { background: linear-gradient(135deg, #f0a020, #ffc107); }
.stat-card-3 .stat-icon { background: linear-gradient(135deg, #18a058, #36ad6a); }
.stat-card-4 .stat-icon { background: linear-gradient(135deg, #7c3aed, #a855f7); }

.stat-info { flex: 1; }

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.filter-card { margin-bottom: 16px; }

.table-card :deep(.n-data-table-th) { font-weight: 600; }

.prescription-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child { margin-bottom: 0; }

.detail-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.total-price {
  text-align: right;
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

.total-price .price {
  font-size: 20px;
  font-weight: 700;
  color: #f0a020;
}

.notes-text {
  margin: 0;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  line-height: 1.6;
  color: #666;
}

@media (max-width: 1200px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .stats-row { grid-template-columns: 1fr; }
}
</style>
