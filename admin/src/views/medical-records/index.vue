<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>病历管理</h2>
        <p>查看和管理患者病历记录</p>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <n-card :bordered="false" class="filter-card">
      <n-space>
        <n-input
          v-model:value="searchPatient"
          placeholder="搜索患者姓名/就诊卡号"
          clearable
          style="width: 200px"
          @keyup.enter="loadData"
        >
          <template #prefix><n-icon :component="SearchOutline" /></template>
        </n-input>
        <n-select
          v-model:value="searchDeptId"
          :options="departmentOptions"
          placeholder="选择科室"
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

    <!-- 数据表格 -->
    <n-card :bordered="false" class="table-card">
      <n-data-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: any) => row.id"
        :scroll-x="1100"
        @update:page="handlePageChange"
      />
    </n-card>

    <!-- 病历详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" title="病历详情" style="width: 700px;">
      <div v-if="currentRecord" class="record-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4><n-icon :component="PersonOutline" /> 患者信息</h4>
          <n-descriptions :column="2" label-placement="left" bordered>
            <n-descriptions-item label="患者姓名">{{ currentRecord.patient?.name || '-' }}</n-descriptions-item>
            <n-descriptions-item label="就诊卡号">{{ currentRecord.patient?.medicalCardNo || '-' }}</n-descriptions-item>
            <n-descriptions-item label="性别">{{ currentRecord.patient?.gender === 'male' ? '男' : '女' }}</n-descriptions-item>
            <n-descriptions-item label="年龄">{{ calculateAge(currentRecord.patient?.birthDate) }}岁</n-descriptions-item>
          </n-descriptions>
        </div>

        <!-- 就诊信息 -->
        <div class="detail-section">
          <h4><n-icon :component="CalendarOutline" /> 就诊信息</h4>
          <n-descriptions :column="2" label-placement="left" bordered>
            <n-descriptions-item label="就诊医生">{{ currentRecord.doctor?.name || '-' }}</n-descriptions-item>
            <n-descriptions-item label="就诊科室">{{ currentRecord.department?.name || '-' }}</n-descriptions-item>
            <n-descriptions-item label="就诊日期">{{ formatDate(currentRecord.visitDate) }}</n-descriptions-item>
            <n-descriptions-item label="病历编号">{{ currentRecord.recordNo || '-' }}</n-descriptions-item>
          </n-descriptions>
        </div>

        <!-- 诊断信息 -->
        <div class="detail-section">
          <h4><n-icon :component="DocumentTextOutline" /> 诊断信息</h4>
          <n-descriptions :column="1" label-placement="left" bordered>
            <n-descriptions-item label="主诉">
              <p class="content-text">{{ currentRecord.chiefComplaint || '-' }}</p>
            </n-descriptions-item>
            <n-descriptions-item label="现病史">
              <p class="content-text">{{ currentRecord.presentIllness || '-' }}</p>
            </n-descriptions-item>
            <n-descriptions-item label="既往史">
              <p class="content-text">{{ currentRecord.pastHistory || '-' }}</p>
            </n-descriptions-item>
            <n-descriptions-item label="体格检查">
              <p class="content-text">{{ currentRecord.physicalExam || '-' }}</p>
            </n-descriptions-item>
            <n-descriptions-item label="诊断结果">
              <n-tag type="info" size="medium">{{ currentRecord.diagnosis || '-' }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="治疗方案">
              <p class="content-text">{{ currentRecord.treatment || '-' }}</p>
            </n-descriptions-item>
          </n-descriptions>
        </div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetail = false">关闭</n-button>
          <n-button type="primary" @click="handlePrint">
            <template #icon><n-icon :component="PrintOutline" /></template>
            打印病历
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
  NDatePicker, NDescriptions, NDescriptionsItem, NTag, useMessage
} from 'naive-ui'
import {
  SearchOutline, EyeOutline, PersonOutline, CalendarOutline,
  DocumentTextOutline, PrintOutline
} from '@vicons/ionicons5'
import { getMedicalRecordList } from '@/api/medical-record'
import { getDepartmentList } from '@/api/department'

const message = useMessage()

const loading = ref(false)
const showDetail = ref(false)
const searchPatient = ref('')
const searchDeptId = ref<number | null>(null)
const searchDateRange = ref<[number, number] | null>(null)
const tableData = ref<any[]>([])
const currentRecord = ref<any>(null)
const departmentOptions = ref<any[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
})

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

const formatTime = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const calculateAge = (birthDate: string) => {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '病历编号', key: 'recordNo', width: 140 },
  { title: '患者姓名', key: 'patient.name', width: 100, render: (row: any) => row.patient?.name || '-' },
  { title: '就诊卡号', key: 'patient.medicalCardNo', width: 130, render: (row: any) => row.patient?.medicalCardNo || '-' },
  { title: '就诊医生', key: 'doctor.name', width: 100, render: (row: any) => row.doctor?.name || '-' },
  { title: '就诊科室', key: 'department.name', width: 100, render: (row: any) => row.department?.name || '-' },
  {
    title: '诊断',
    key: 'diagnosis',
    width: 150,
    ellipsis: { tooltip: true },
    render: (row: any) => row.diagnosis || '-'
  },
  { title: '就诊日期', key: 'visitDate', width: 100, render: (row: any) => formatDate(row.visitDate) },
  { title: '创建时间', key: 'createdAt', width: 160, render: (row: any) => formatTime(row.createdAt) },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    fixed: 'right',
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
    if (searchPatient.value) params.keyword = searchPatient.value
    if (searchDeptId.value) params.departmentId = searchDeptId.value
    if (searchDateRange.value) {
      params.startDate = new Date(searchDateRange.value[0]).toISOString().split('T')[0]
      params.endDate = new Date(searchDateRange.value[1]).toISOString().split('T')[0]
    }

    const res = await getMedicalRecordList(params)
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
    const res = await getDepartmentList({ page: 1, pageSize: 100 })
    const list = res.data?.list || res.list || []
    departmentOptions.value = list.map((dept: any) => ({
      label: dept.name,
      value: dept.id
    }))
  } catch (error) {
    console.error('加载科室失败', error)
  }
}

const resetSearch = () => {
  searchPatient.value = ''
  searchDeptId.value = null
  searchDateRange.value = null
  pagination.page = 1
  loadData()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadData()
}

const handleView = (row: any) => {
  currentRecord.value = row
  showDetail.value = true
}

const handlePrint = () => {
  if (!currentRecord.value) return

  const record = currentRecord.value
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    message.error('无法打开打印窗口，请检查浏览器设置')
    return
  }

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>病历打印 - ${record.recordNo || ''}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: "Microsoft YaHei", "SimSun", sans-serif; padding: 40px; color: #333; }
        .print-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .print-header h1 { font-size: 24px; margin-bottom: 8px; }
        .print-header p { font-size: 14px; color: #666; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 16px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .info-item { display: flex; }
        .info-label { width: 80px; color: #666; flex-shrink: 0; }
        .info-value { flex: 1; }
        .content-block { margin-bottom: 16px; }
        .content-label { font-weight: 500; margin-bottom: 4px; color: #666; }
        .content-text { padding: 8px 12px; background: #f9f9f9; border-radius: 4px; line-height: 1.6; min-height: 40px; }
        .diagnosis-tag { display: inline-block; background: #e6f7ff; color: #1890ff; padding: 4px 12px; border-radius: 4px; }
        .print-footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; }
        .signature-line { width: 150px; border-bottom: 1px solid #333; margin-top: 30px; }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>门 诊 病 历</h1>
        <p>智慧医疗中心</p>
      </div>

      <div class="section">
        <div class="section-title">患者信息</div>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">姓名：</span><span class="info-value">${record.patient?.name || '-'}</span></div>
          <div class="info-item"><span class="info-label">就诊卡号：</span><span class="info-value">${record.patient?.medicalCardNo || '-'}</span></div>
          <div class="info-item"><span class="info-label">性别：</span><span class="info-value">${record.patient?.gender === 'male' ? '男' : '女'}</span></div>
          <div class="info-item"><span class="info-label">年龄：</span><span class="info-value">${calculateAge(record.patient?.birthDate)}岁</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">就诊信息</div>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">就诊医生：</span><span class="info-value">${record.doctor?.name || '-'}</span></div>
          <div class="info-item"><span class="info-label">就诊科室：</span><span class="info-value">${record.department?.name || '-'}</span></div>
          <div class="info-item"><span class="info-label">就诊日期：</span><span class="info-value">${formatDate(record.visitDate)}</span></div>
          <div class="info-item"><span class="info-label">病历编号：</span><span class="info-value">${record.recordNo || '-'}</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">诊断信息</div>
        <div class="content-block">
          <div class="content-label">主诉</div>
          <div class="content-text">${record.chiefComplaint || '-'}</div>
        </div>
        <div class="content-block">
          <div class="content-label">现病史</div>
          <div class="content-text">${record.presentIllness || '-'}</div>
        </div>
        <div class="content-block">
          <div class="content-label">既往史</div>
          <div class="content-text">${record.pastHistory || '-'}</div>
        </div>
        <div class="content-block">
          <div class="content-label">体格检查</div>
          <div class="content-text">${record.physicalExam || '-'}</div>
        </div>
        <div class="content-block">
          <div class="content-label">诊断结果</div>
          <div><span class="diagnosis-tag">${record.diagnosis || '-'}</span></div>
        </div>
        <div class="content-block">
          <div class="content-label">治疗方案</div>
          <div class="content-text">${record.treatment || '-'}</div>
        </div>
      </div>

      <div class="print-footer">
        <div>
          <p>医生签名：</p>
          <div class="signature-line"></div>
        </div>
        <div>
          <p>打印日期：${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      <\/script>
    </body>
    </html>
  `

  printWindow.document.write(printContent)
  printWindow.document.close()
  message.success('正在打开打印预览...')
}

onMounted(() => {
  loadDepartments()
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

.filter-card {
  margin-bottom: 16px;
}

.table-card :deep(.n-data-table-th) {
  font-weight: 600;
}

.record-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

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

.content-text {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #333;
}
</style>
