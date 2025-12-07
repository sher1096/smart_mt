<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>消息管理</h2>
        <p>管理系统通知和消息推送</p>
      </div>
      <div class="header-right">
        <n-button type="primary" @click="handleSendMessage">
          <template #icon><n-icon :component="SendOutline" /></template>
          发送消息
        </n-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <n-grid :cols="4" :x-gap="16" :y-gap="16" class="stats-grid">
      <n-gi>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <n-icon :component="MailOutline" :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalMessages }}</div>
            <div class="stat-label">总消息数</div>
          </div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <n-icon :component="NotificationsOutline" :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.systemMessages }}</div>
            <div class="stat-label">系统通知</div>
          </div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <n-icon :component="ChatbubblesOutline" :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.appointmentMessages }}</div>
            <div class="stat-label">预约提醒</div>
          </div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            <n-icon :component="CheckmarkDoneOutline" :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.readRate }}%</div>
            <div class="stat-label">已读率</div>
          </div>
        </div>
      </n-gi>
    </n-grid>

    <!-- 搜索筛选 -->
    <n-card :bordered="false" class="filter-card">
      <n-space>
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索消息标题/内容"
          clearable
          style="width: 200px"
          @keyup.enter="loadData"
        >
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select
          v-model:value="searchType"
          :options="messageTypeOptions"
          placeholder="消息类型"
          clearable
          style="width: 150px"
        />
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

    <!-- 消息列表 -->
    <n-card :bordered="false" class="table-card">
      <n-data-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: any) => row.id"
        :scroll-x="1000"
        @update:page="handlePageChange"
      />
    </n-card>

    <!-- 发送消息弹窗 -->
    <n-modal v-model:show="showSendModal" preset="card" title="发送消息" style="width: 600px;">
      <n-form ref="messageFormRef" :model="messageForm" :rules="messageRules" label-placement="left" label-width="80">
        <n-form-item label="发送方式" path="sendType">
          <n-radio-group v-model:value="messageForm.sendType">
            <n-radio value="single">单个用户</n-radio>
            <n-radio value="batch">批量发送</n-radio>
            <n-radio value="all">全部用户</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="messageForm.sendType === 'single'" label="接收用户" path="receiverId">
          <n-select
            v-model:value="messageForm.receiverId"
            :options="patientOptions"
            filterable
            placeholder="搜索选择用户"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item v-if="messageForm.sendType === 'batch'" label="接收用户" path="receiverIds">
          <n-select
            v-model:value="messageForm.receiverIds"
            :options="patientOptions"
            filterable
            multiple
            placeholder="搜索选择多个用户"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="消息类型" path="type">
          <n-select
            v-model:value="messageForm.type"
            :options="messageTypeOptions"
            placeholder="选择消息类型"
          />
        </n-form-item>
        <n-form-item label="消息标题" path="title">
          <n-input v-model:value="messageForm.title" placeholder="请输入消息标题" />
        </n-form-item>
        <n-form-item label="消息内容" path="content">
          <n-input
            v-model:value="messageForm.content"
            type="textarea"
            :rows="5"
            placeholder="请输入消息内容"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showSendModal = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmitMessage">发送</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 消息详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="消息详情" style="width: 550px;">
      <div v-if="currentMessage" class="message-detail">
        <n-descriptions :column="1" label-placement="left" bordered>
          <n-descriptions-item label="消息ID">{{ currentMessage.id }}</n-descriptions-item>
          <n-descriptions-item label="消息类型">
            <n-tag :type="getTypeTagType(currentMessage.type)">{{ getTypeLabel(currentMessage.type) }}</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="接收用户">{{ currentMessage.receiver?.name || '-' }}</n-descriptions-item>
          <n-descriptions-item label="消息标题">{{ currentMessage.title || '-' }}</n-descriptions-item>
          <n-descriptions-item label="消息内容">
            <p class="content-text">{{ currentMessage.content || '-' }}</p>
          </n-descriptions-item>
          <n-descriptions-item label="阅读状态">
            <n-tag :type="currentMessage.isRead ? 'success' : 'warning'" size="small">
              {{ currentMessage.isRead ? '已读' : '未读' }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="发送时间">{{ formatTime(currentMessage.createdAt) }}</n-descriptions-item>
          <n-descriptions-item v-if="currentMessage.readAt" label="阅读时间">{{ formatTime(currentMessage.readAt) }}</n-descriptions-item>
        </n-descriptions>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NCard, NButton, NSpace, NInput, NIcon, NDataTable, NModal, NForm, NFormItem,
  NSelect, NDatePicker, NRadioGroup, NRadio, NGrid, NGi, NDescriptions,
  NDescriptionsItem, NTag, useMessage, type FormInst
} from 'naive-ui'
import {
  SearchOutline, SendOutline, MailOutline, NotificationsOutline,
  ChatbubblesOutline, CheckmarkDoneOutline, EyeOutline
} from '@vicons/ionicons5'
import { getMessageList, sendMessage, sendBatchMessage } from '@/api/message'
import { getPatientList } from '@/api/patient'

const message = useMessage()

const loading = ref(false)
const submitting = ref(false)
const showSendModal = ref(false)
const showDetailModal = ref(false)
const searchKeyword = ref('')
const searchType = ref<string | null>(null)
const searchDateRange = ref<[number, number] | null>(null)
const tableData = ref<any[]>([])
const currentMessage = ref<any>(null)
const patientOptions = ref<any[]>([])
const messageFormRef = ref<FormInst | null>(null)

const stats = reactive({
  totalMessages: 0,
  systemMessages: 0,
  appointmentMessages: 0,
  readRate: 0
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
})

const messageForm = reactive({
  sendType: 'single',
  receiverId: null as number | null,
  receiverIds: [] as number[],
  type: 'system',
  title: '',
  content: ''
})

const messageRules = {
  type: { required: true, message: '请选择消息类型', trigger: 'change' },
  title: { required: true, message: '请输入消息标题', trigger: 'blur' },
  content: { required: true, message: '请输入消息内容', trigger: 'blur' }
}

const messageTypeOptions = [
  { label: '系统通知', value: 'system' },
  { label: '预约提醒', value: 'appointment' },
  { label: '就诊提醒', value: 'visit' },
  { label: '体检提醒', value: 'examination' },
  { label: '缴费提醒', value: 'payment' },
  { label: '其他', value: 'other' }
]

const formatTime = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const getTypeLabel = (type: string) => {
  const item = messageTypeOptions.find(opt => opt.value === type)
  return item?.label || type
}

const getTypeTagType = (type: string) => {
  const types: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    system: 'info',
    appointment: 'warning',
    visit: 'success',
    examination: 'default',
    payment: 'error',
    other: 'default'
  }
  return types[type] || 'default'
}

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  {
    title: '消息类型',
    key: 'type',
    width: 100,
    render: (row: any) => h(NTag, { type: getTypeTagType(row.type), size: 'small' }, { default: () => getTypeLabel(row.type) })
  },
  { title: '接收用户', key: 'receiver.name', width: 100, render: (row: any) => row.receiver?.name || '-' },
  {
    title: '消息标题',
    key: 'title',
    width: 180,
    ellipsis: { tooltip: true },
    render: (row: any) => row.title || '-'
  },
  {
    title: '消息内容',
    key: 'content',
    ellipsis: { tooltip: true },
    render: (row: any) => row.content || '-'
  },
  {
    title: '状态',
    key: 'isRead',
    width: 80,
    render: (row: any) => h(NTag, { type: row.isRead ? 'success' : 'warning', size: 'small' }, { default: () => row.isRead ? '已读' : '未读' })
  },
  { title: '发送时间', key: 'createdAt', width: 160, render: (row: any) => formatTime(row.createdAt) },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    fixed: 'right',
    render: (row: any) => h(NButton, { text: true, type: 'primary', onClick: () => handleViewMessage(row) }, { default: () => '详情', icon: () => h(NIcon, { component: EyeOutline }) })
  }
]

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (searchType.value) params.type = searchType.value
    if (searchDateRange.value) {
      params.startDate = new Date(searchDateRange.value[0]).toISOString().split('T')[0]
      params.endDate = new Date(searchDateRange.value[1]).toISOString().split('T')[0]
    }

    const res = await getMessageList(params)
    tableData.value = res.data?.list || res.list || []
    pagination.itemCount = res.data?.total || res.total || 0

    // 计算统计数据
    stats.totalMessages = pagination.itemCount
    stats.systemMessages = tableData.value.filter((m: any) => m.type === 'system').length
    stats.appointmentMessages = tableData.value.filter((m: any) => m.type === 'appointment').length
    const readCount = tableData.value.filter((m: any) => m.isRead).length
    stats.readRate = tableData.value.length > 0 ? Math.round((readCount / tableData.value.length) * 100) : 0
  } catch (error) {
    console.error('加载消息列表失败', error)
  } finally {
    loading.value = false
  }
}

const loadPatients = async () => {
  try {
    const res = await getPatientList({ page: 1, pageSize: 500 })
    const list = res.data?.list || res.list || []
    patientOptions.value = list.map((p: any) => ({
      label: `${p.name} (${p.phone || '-'})`,
      value: p.id
    }))
  } catch (error) {
    console.error('加载患者列表失败', error)
  }
}

const resetSearch = () => {
  searchKeyword.value = ''
  searchType.value = null
  searchDateRange.value = null
  pagination.page = 1
  loadData()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadData()
}

const handleViewMessage = (row: any) => {
  currentMessage.value = row
  showDetailModal.value = true
}

const resetMessageForm = () => {
  messageForm.sendType = 'single'
  messageForm.receiverId = null
  messageForm.receiverIds = []
  messageForm.type = 'system'
  messageForm.title = ''
  messageForm.content = ''
}

const handleSendMessage = () => {
  resetMessageForm()
  showSendModal.value = true
}

const handleSubmitMessage = async () => {
  try {
    await messageFormRef.value?.validate()
  } catch (error) {
    if (Array.isArray(error)) return
    throw error
  }

  // 验证接收者
  if (messageForm.sendType === 'single' && !messageForm.receiverId) {
    message.warning('请选择接收用户')
    return
  }
  if (messageForm.sendType === 'batch' && messageForm.receiverIds.length === 0) {
    message.warning('请选择接收用户')
    return
  }

  submitting.value = true
  try {
    const data: any = {
      type: messageForm.type,
      title: messageForm.title,
      content: messageForm.content
    }

    if (messageForm.sendType === 'single') {
      data.receiverId = messageForm.receiverId
      await sendMessage(data)
    } else if (messageForm.sendType === 'batch') {
      data.receiverIds = messageForm.receiverIds
      await sendBatchMessage(data)
    } else {
      // 全部用户
      data.sendToAll = true
      await sendBatchMessage(data)
    }

    message.success('消息发送成功')
    showSendModal.value = false
    loadData()
  } catch (error) {
    message.error('发送失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
  loadPatients()
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

.header-left h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.header-left p {
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

.filter-card {
  margin-bottom: 16px;
}

.table-card :deep(.n-data-table-th) {
  font-weight: 600;
}

.message-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.content-text {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #333;
}
</style>
