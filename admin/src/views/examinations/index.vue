<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>体检管理</h2>
        <p>管理体检项目和体检预约</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <n-grid :cols="4" :x-gap="16" :y-gap="16" class="stats-grid">
      <n-gi>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <n-icon :component="FitnessOutline" :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalItems }}</div>
            <div class="stat-label">体检项目</div>
          </div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <n-icon :component="CalendarOutline" :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalAppointments }}</div>
            <div class="stat-label">体检预约</div>
          </div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <n-icon :component="TimeOutline" :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pendingCount }}</div>
            <div class="stat-label">待体检</div>
          </div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            <n-icon :component="CheckmarkCircleOutline" :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.completedCount }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
      </n-gi>
    </n-grid>

    <!-- 标签页切换 -->
    <n-card :bordered="false" class="main-card">
      <n-tabs v-model:value="activeTab" type="line">
        <!-- 体检项目管理 -->
        <n-tab-pane name="items" tab="体检项目">
          <div class="tab-toolbar">
            <n-space>
              <n-input
                v-model:value="itemSearch"
                placeholder="搜索项目名称"
                clearable
                style="width: 200px"
              >
                <template #prefix><n-icon :component="SearchOutline" /></template>
              </n-input>
              <n-button type="primary" @click="handleAddItem">
                <template #icon><n-icon :component="AddOutline" /></template>
                新增项目
              </n-button>
            </n-space>
          </div>
          <n-data-table
            :columns="itemColumns"
            :data="filteredItems"
            :loading="itemsLoading"
            :pagination="itemPagination"
            :row-key="(row: any) => row.id"
          />
        </n-tab-pane>

        <!-- 体检预约管理 -->
        <n-tab-pane name="appointments" tab="体检预约">
          <div class="tab-toolbar">
            <n-space>
              <n-input
                v-model:value="appointmentSearch"
                placeholder="搜索患者姓名/手机号"
                clearable
                style="width: 200px"
              >
                <template #prefix><n-icon :component="SearchOutline" /></template>
              </n-input>
              <n-select
                v-model:value="statusFilter"
                :options="statusOptions"
                placeholder="预约状态"
                clearable
                style="width: 120px"
              />
              <n-date-picker
                v-model:value="dateRange"
                type="daterange"
                clearable
                style="width: 260px"
              />
              <n-button type="primary" @click="loadAppointments">查询</n-button>
              <n-button @click="resetAppointmentSearch">重置</n-button>
            </n-space>
          </div>
          <n-data-table
            :columns="appointmentColumns"
            :data="appointments"
            :loading="appointmentsLoading"
            :pagination="appointmentPagination"
            :row-key="(row: any) => row.id"
            @update:page="handleAppointmentPageChange"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- 新增/编辑体检项目弹窗 -->
    <n-modal v-model:show="showItemModal" preset="card" :title="isEditItem ? '编辑体检项目' : '新增体检项目'" style="width: 500px;">
      <n-form ref="itemFormRef" :model="itemForm" :rules="itemRules" label-placement="left" label-width="80">
        <n-form-item label="项目名称" path="name">
          <n-input v-model:value="itemForm.name" placeholder="请输入项目名称" />
        </n-form-item>
        <n-form-item label="项目价格" path="price">
          <n-input-number v-model:value="itemForm.price" :min="0" :precision="2" placeholder="请输入价格" style="width: 100%;">
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="项目描述" path="description">
          <n-input v-model:value="itemForm.description" type="textarea" :rows="3" placeholder="请输入项目描述" />
        </n-form-item>
        <n-form-item label="注意事项" path="notes">
          <n-input v-model:value="itemForm.notes" type="textarea" :rows="2" placeholder="请输入注意事项" />
        </n-form-item>
        <n-form-item label="项目状态" path="status">
          <n-switch v-model:value="itemForm.status" :checked-value="1" :unchecked-value="0">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showItemModal = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmitItem">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 体检预约详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="体检预约详情" style="width: 600px;">
      <div v-if="currentAppointment" class="detail-content">
        <n-descriptions :column="2" label-placement="left" bordered>
          <n-descriptions-item label="预约编号">{{ currentAppointment.appointmentNo || '-' }}</n-descriptions-item>
          <n-descriptions-item label="预约状态">
            <n-tag :type="getStatusType(currentAppointment.status)">{{ getStatusText(currentAppointment.status) }}</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="患者姓名">{{ currentAppointment.patient?.name || '-' }}</n-descriptions-item>
          <n-descriptions-item label="联系电话">{{ currentAppointment.patient?.phone || '-' }}</n-descriptions-item>
          <n-descriptions-item label="预约日期">{{ formatDate(currentAppointment.appointmentDate) }}</n-descriptions-item>
          <n-descriptions-item label="预约时段">{{ currentAppointment.timeSlot || '-' }}</n-descriptions-item>
          <n-descriptions-item label="体检项目" :span="2">
            <n-space>
              <n-tag v-for="item in currentAppointment.items" :key="item.id" type="info">
                {{ item.name }}
              </n-tag>
            </n-space>
          </n-descriptions-item>
          <n-descriptions-item label="总金额">
            <span class="price-text">¥{{ currentAppointment.totalPrice?.toFixed(2) || '0.00' }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="创建时间">{{ formatTime(currentAppointment.createdAt) }}</n-descriptions-item>
          <n-descriptions-item v-if="currentAppointment.remark" label="备注" :span="2">
            {{ currentAppointment.remark }}
          </n-descriptions-item>
        </n-descriptions>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
          <n-button v-if="currentAppointment?.status === 'pending'" type="warning" @click="handleConfirmAppointment">
            确认预约
          </n-button>
          <n-button v-if="currentAppointment?.status === 'confirmed'" type="primary" @click="handleStartExam">
            开始体检
          </n-button>
          <n-button v-if="currentAppointment?.status === 'in_progress'" type="success" @click="handleCompleteExam">
            完成体检
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 取消预约弹窗 -->
    <n-modal v-model:show="showCancelModal" preset="dialog" title="取消预约" positive-text="确认取消" negative-text="返回" @positive-click="confirmCancel">
      <n-form>
        <n-form-item label="取消原因">
          <n-input v-model:value="cancelReason" type="textarea" :rows="3" placeholder="请输入取消原因（选填）" />
        </n-form-item>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import {
  NCard, NButton, NSpace, NInput, NIcon, NDataTable, NModal, NForm, NFormItem,
  NInputNumber, NSwitch, NSelect, NDatePicker, NTabs, NTabPane, NGrid, NGi,
  NDescriptions, NDescriptionsItem, NTag, NPopconfirm, useMessage, type FormInst
} from 'naive-ui'
import {
  SearchOutline, AddOutline, FitnessOutline, CalendarOutline, TimeOutline,
  CheckmarkCircleOutline, CreateOutline, TrashOutline, EyeOutline, CloseCircleOutline
} from '@vicons/ionicons5'
import {
  getExaminationItems, createExaminationItem, updateExaminationItem, deleteExaminationItem,
  getExaminationList, updateExaminationStatus, cancelExamination
} from '@/api/examination'

const message = useMessage()

const activeTab = ref('items')
const itemsLoading = ref(false)
const appointmentsLoading = ref(false)
const submitting = ref(false)
const showItemModal = ref(false)
const showDetailModal = ref(false)
const showCancelModal = ref(false)
const isEditItem = ref(false)
const itemSearch = ref('')
const appointmentSearch = ref('')
const statusFilter = ref<string | null>(null)
const dateRange = ref<[number, number] | null>(null)
const cancelReason = ref('')
const cancelingId = ref<number | null>(null)

const items = ref<any[]>([])
const appointments = ref<any[]>([])
const currentAppointment = ref<any>(null)
const itemFormRef = ref<FormInst | null>(null)

const stats = reactive({
  totalItems: 0,
  totalAppointments: 0,
  pendingCount: 0,
  completedCount: 0
})

const itemPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0
})

const appointmentPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
})

const itemForm = reactive({
  id: null as number | null,
  name: '',
  price: 0,
  description: '',
  notes: '',
  status: 1
})

const itemRules = {
  name: { required: true, message: '请输入项目名称', trigger: 'blur' },
  price: { required: true, type: 'number', min: 0, message: '请输入有效价格', trigger: 'blur' }
}

const statusOptions = [
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

const formatTime = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const getStatusType = (status: string) => {
  const types: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    pending: 'warning',
    confirmed: 'info',
    in_progress: 'default',
    completed: 'success',
    cancelled: 'error'
  }
  return types[status] || 'default'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

const filteredItems = computed(() => {
  if (!itemSearch.value) return items.value
  const keyword = itemSearch.value.toLowerCase()
  return items.value.filter(item => item.name?.toLowerCase().includes(keyword))
})

const itemColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '项目名称', key: 'name', width: 150 },
  {
    title: '价格',
    key: 'price',
    width: 100,
    render: (row: any) => `¥${row.price?.toFixed(2) || '0.00'}`
  },
  {
    title: '项目描述',
    key: 'description',
    ellipsis: { tooltip: true },
    render: (row: any) => row.description || '-'
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: any) => h(NTag, { type: row.status === 1 ? 'success' : 'default', size: 'small' }, { default: () => row.status === 1 ? '启用' : '禁用' })
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row: any) => h(NSpace, {}, {
      default: () => [
        h(NButton, { text: true, type: 'primary', onClick: () => handleEditItem(row) }, { default: () => '编辑', icon: () => h(NIcon, { component: CreateOutline }) }),
        h(NPopconfirm, { onPositiveClick: () => handleDeleteItem(row.id) }, {
          trigger: () => h(NButton, { text: true, type: 'error' }, { default: () => '删除', icon: () => h(NIcon, { component: TrashOutline }) }),
          default: () => '确定要删除该项目吗？'
        })
      ]
    })
  }
]

const appointmentColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '预约编号', key: 'appointmentNo', width: 140 },
  { title: '患者姓名', key: 'patient.name', width: 100, render: (row: any) => row.patient?.name || '-' },
  { title: '联系电话', key: 'patient.phone', width: 120, render: (row: any) => row.patient?.phone || '-' },
  { title: '预约日期', key: 'appointmentDate', width: 100, render: (row: any) => formatDate(row.appointmentDate) },
  { title: '时段', key: 'timeSlot', width: 80 },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render: (row: any) => h(NTag, { type: getStatusType(row.status), size: 'small' }, { default: () => getStatusText(row.status) })
  },
  {
    title: '金额',
    key: 'totalPrice',
    width: 100,
    render: (row: any) => `¥${row.totalPrice?.toFixed(2) || '0.00'}`
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render: (row: any) => h(NSpace, {}, {
      default: () => [
        h(NButton, { text: true, type: 'primary', onClick: () => handleViewAppointment(row) }, { default: () => '详情', icon: () => h(NIcon, { component: EyeOutline }) }),
        row.status !== 'completed' && row.status !== 'cancelled' ?
          h(NButton, { text: true, type: 'error', onClick: () => handleCancelAppointment(row.id) }, { default: () => '取消', icon: () => h(NIcon, { component: CloseCircleOutline }) }) : null
      ].filter(Boolean)
    })
  }
]

const loadItems = async () => {
  itemsLoading.value = true
  try {
    const res = await getExaminationItems({ page: 1, pageSize: 100 })
    items.value = res.data?.list || res.list || []
    stats.totalItems = items.value.length
    itemPagination.itemCount = items.value.length
  } catch (error) {
    console.error('加载体检项目失败', error)
  } finally {
    itemsLoading.value = false
  }
}

const loadAppointments = async () => {
  appointmentsLoading.value = true
  try {
    const params: any = {
      page: appointmentPagination.page,
      pageSize: appointmentPagination.pageSize
    }
    if (appointmentSearch.value) params.keyword = appointmentSearch.value
    if (statusFilter.value) params.status = statusFilter.value
    if (dateRange.value) {
      params.startDate = new Date(dateRange.value[0]).toISOString().split('T')[0]
      params.endDate = new Date(dateRange.value[1]).toISOString().split('T')[0]
    }

    const res = await getExaminationList(params)
    appointments.value = res.data?.list || res.list || []
    appointmentPagination.itemCount = res.data?.total || res.total || 0

    // 更新统计
    stats.totalAppointments = appointmentPagination.itemCount
    stats.pendingCount = appointments.value.filter((a: any) => a.status === 'pending' || a.status === 'confirmed').length
    stats.completedCount = appointments.value.filter((a: any) => a.status === 'completed').length
  } catch (error) {
    console.error('加载预约列表失败', error)
  } finally {
    appointmentsLoading.value = false
  }
}

const resetItemForm = () => {
  itemForm.id = null
  itemForm.name = ''
  itemForm.price = 0
  itemForm.description = ''
  itemForm.notes = ''
  itemForm.status = 1
}

const handleAddItem = () => {
  isEditItem.value = false
  resetItemForm()
  showItemModal.value = true
}

const handleEditItem = (row: any) => {
  isEditItem.value = true
  itemForm.id = row.id
  itemForm.name = row.name
  itemForm.price = row.price
  itemForm.description = row.description || ''
  itemForm.notes = row.notes || ''
  itemForm.status = row.status
  showItemModal.value = true
}

const handleSubmitItem = async () => {
  try {
    await itemFormRef.value?.validate()
  } catch (error) {
    if (Array.isArray(error)) return
    throw error
  }

  submitting.value = true
  try {
    const data = {
      name: itemForm.name,
      price: itemForm.price,
      description: itemForm.description,
      notes: itemForm.notes,
      status: itemForm.status
    }

    if (isEditItem.value && itemForm.id) {
      await updateExaminationItem(itemForm.id, data)
      message.success('更新成功')
    } else {
      await createExaminationItem(data)
      message.success('创建成功')
    }

    showItemModal.value = false
    loadItems()
  } catch (error) {
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleDeleteItem = async (id: number) => {
  try {
    await deleteExaminationItem(id)
    message.success('删除成功')
    loadItems()
  } catch (error) {
    message.error('删除失败')
  }
}

const resetAppointmentSearch = () => {
  appointmentSearch.value = ''
  statusFilter.value = null
  dateRange.value = null
  appointmentPagination.page = 1
  loadAppointments()
}

const handleAppointmentPageChange = (page: number) => {
  appointmentPagination.page = page
  loadAppointments()
}

const handleViewAppointment = (row: any) => {
  currentAppointment.value = row
  showDetailModal.value = true
}

const handleCancelAppointment = (id: number) => {
  cancelingId.value = id
  cancelReason.value = ''
  showCancelModal.value = true
}

const confirmCancel = async () => {
  if (!cancelingId.value) return
  try {
    await cancelExamination(cancelingId.value, cancelReason.value)
    message.success('取消成功')
    loadAppointments()
  } catch (error) {
    message.error('取消失败')
  }
}

const handleConfirmAppointment = async () => {
  if (!currentAppointment.value) return
  try {
    await updateExaminationStatus(currentAppointment.value.id, 'confirmed')
    message.success('预约已确认')
    showDetailModal.value = false
    loadAppointments()
  } catch (error) {
    message.error('操作失败')
  }
}

const handleStartExam = async () => {
  if (!currentAppointment.value) return
  try {
    await updateExaminationStatus(currentAppointment.value.id, 'in_progress')
    message.success('体检已开始')
    showDetailModal.value = false
    loadAppointments()
  } catch (error) {
    message.error('操作失败')
  }
}

const handleCompleteExam = async () => {
  if (!currentAppointment.value) return
  try {
    await updateExaminationStatus(currentAppointment.value.id, 'completed')
    message.success('体检已完成')
    showDetailModal.value = false
    loadAppointments()
  } catch (error) {
    message.error('操作失败')
  }
}

onMounted(() => {
  loadItems()
  loadAppointments()
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

.stats-grid {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 6px;
}

.main-card {
  min-height: 500px;
}

.tab-toolbar {
  margin-bottom: 16px;
}

.detail-content {
  max-height: 60vh;
  overflow-y: auto;
}

.price-text {
  font-size: 16px;
  font-weight: 600;
  color: #f5222d;
}
</style>
