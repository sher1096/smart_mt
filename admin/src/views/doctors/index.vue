<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header-card">
      <div class="page-header-content">
        <div class="page-header-info">
          <div class="page-header-icon">
            <n-icon :component="MedicalOutline" :size="28" color="#fff" />
          </div>
          <div class="page-header-text">
            <h1>医生管理</h1>
            <p>管理医院医生信息，包括基本资料、科室分配和排班设置</p>
          </div>
        </div>
        <div class="page-header-stats">
          <div class="page-header-stat">
            <div class="page-header-stat-value">{{ pagination.itemCount }}</div>
            <div class="page-header-stat-label">医生总数</div>
          </div>
          <div class="page-header-stat">
            <div class="page-header-stat-value">{{ activeCount }}</div>
            <div class="page-header-stat-label">在职医生</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <n-card :bordered="false" class="main-card">
      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="action-bar-left">
          <n-button type="primary" class="primary-action-btn" @click="handleAdd">
            <template #icon><n-icon :component="AddOutline" /></template>
            新增医生
          </n-button>
          <n-button quaternary @click="loadData">
            <template #icon><n-icon :component="RefreshOutline" :class="{ 'refresh-spin': loading }" /></template>
            刷新
          </n-button>
        </div>
        <div class="action-bar-right">
          <n-select
            v-model:value="searchDeptId"
            :options="departmentOptions"
            placeholder="选择科室"
            clearable
            class="filter-select"
            @update:value="loadData"
          />
          <n-input
            v-model:value="searchText"
            placeholder="搜索医生姓名/工号"
            clearable
            class="search-input"
            @keyup.enter="loadData"
          >
            <template #prefix><n-icon :component="SearchOutline" color="#999" /></template>
          </n-input>
          <n-button type="primary" ghost @click="loadData">
            <template #icon><n-icon :component="SearchOutline" /></template>
            搜索
          </n-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-container">
        <n-data-table
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :pagination="pagination"
          :row-key="(row: any) => row.id"
          :scroll-x="1100"
          class="custom-table"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </n-card>

    <!-- 新增/编辑弹窗 -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="isEdit ? '编辑医生' : '新增医生'"
      style="width: 640px;"
      :mask-closable="false"
      :segmented="{ content: true, footer: 'soft' }"
    >
      <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="80">
        <n-grid :cols="2" :x-gap="20">
          <n-gi>
            <n-form-item label="姓名" path="name">
              <n-input v-model:value="formData.name" placeholder="请输入姓名" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="工号" path="employeeNo">
              <n-input v-model:value="formData.employeeNo" placeholder="请输入工号" :disabled="isEdit" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="所属科室" path="departmentId">
              <n-select v-model:value="formData.departmentId" :options="departmentOptions" placeholder="请选择科室" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="职称" path="title">
              <n-select v-model:value="formData.title" :options="titleOptions" placeholder="请选择职称" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="手机号" path="phone">
              <n-input v-model:value="formData.phone" placeholder="请输入手机号" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="挂号费" path="consultFee">
              <n-input-number
                v-model:value="formData.consultFee"
                :min="0"
                placeholder="请输入"
                style="width: 100%"
              >
                <template #prefix>¥</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
          <n-gi :span="2">
            <n-form-item label="专长" path="specialty">
              <n-input v-model:value="formData.specialty" placeholder="请输入专长领域" />
            </n-form-item>
          </n-gi>
          <n-gi :span="2">
            <n-form-item label="简介" path="introduction">
              <n-input
                v-model:value="formData.introduction"
                type="textarea"
                placeholder="请输入医生简介"
                :rows="3"
                :autosize="{ minRows: 3, maxRows: 6 }"
              />
            </n-form-item>
          </n-gi>
          <n-gi v-if="!isEdit">
            <n-form-item label="登录密码" path="password">
              <n-input
                v-model:value="formData.password"
                type="password"
                show-password-on="click"
                placeholder="请输入密码"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="状态" path="status">
              <n-switch v-model:value="formData.status" :checked-value="1" :unchecked-value="0">
                <template #checked>在职</template>
                <template #unchecked>离职</template>
              </n-switch>
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '创建医生' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="医生详情"
      style="width: 600px;"
    >
      <n-descriptions :column="2" label-placement="left" bordered v-if="currentDoctor">
        <n-descriptions-item label="姓名">
          <div class="detail-user">
            <n-avatar :size="40" round>{{ currentDoctor.name?.[0] }}</n-avatar>
            <span>{{ currentDoctor.name }}</span>
          </div>
        </n-descriptions-item>
        <n-descriptions-item label="工号">{{ currentDoctor.employeeNo }}</n-descriptions-item>
        <n-descriptions-item label="科室">{{ currentDoctor.department?.name || '-' }}</n-descriptions-item>
        <n-descriptions-item label="职称">{{ currentDoctor.title }}</n-descriptions-item>
        <n-descriptions-item label="手机号">{{ currentDoctor.phone }}</n-descriptions-item>
        <n-descriptions-item label="挂号费">¥{{ currentDoctor.consultFee || 0 }}</n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag :type="currentDoctor.status === 1 ? 'success' : 'error'" size="small">
            {{ currentDoctor.status === 1 ? '在职' : '离职' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="专长" :span="2">{{ currentDoctor.specialty || '-' }}</n-descriptions-item>
        <n-descriptions-item label="简介" :span="2">{{ currentDoctor.introduction || '-' }}</n-descriptions-item>
      </n-descriptions>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h, computed } from 'vue'
import {
  NCard, NButton, NSpace, NInput, NIcon, NDataTable, NModal, NForm, NFormItem,
  NSelect, NSwitch, NInputNumber, NGrid, NGi, NTag, NAvatar, NDescriptions,
  NDescriptionsItem, useMessage, useDialog, FormInst
} from 'naive-ui'
import {
  AddOutline, SearchOutline, CreateOutline, TrashOutline, MedicalOutline,
  RefreshOutline, EyeOutline
} from '@vicons/ionicons5'
import { getDoctorList, createDoctor, updateDoctor, deleteDoctor } from '@/api/doctor'
import { getDepartmentList } from '@/api/department'

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const submitLoading = ref(false)
const showModal = ref(false)
const showDetailModal = ref(false)
const isEdit = ref(false)
const searchText = ref('')
const searchDeptId = ref<number | null>(null)
const tableData = ref<any[]>([])
const formRef = ref<FormInst | null>(null)
const currentDoctor = ref<any>(null)

// 统计在职医生数
const activeCount = computed(() => tableData.value.filter(d => d.status === 1).length)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  prefix: ({ itemCount }: any) => `共 ${itemCount} 条`
})

const formData = ref({
  id: 0,
  name: '',
  employeeNo: '',
  departmentId: null as number | null,
  title: '',
  phone: '',
  specialty: '',
  introduction: '',
  consultFee: 50,
  password: '',
  status: 1
})

const rules = {
  name: { required: true, message: '请输入姓名', trigger: 'blur' },
  employeeNo: { required: true, message: '请输入工号', trigger: 'blur' },
  departmentId: { required: true, type: 'number', message: '请选择科室', trigger: 'change' },
  title: { required: true, message: '请选择职称', trigger: 'change' },
  phone: { required: true, message: '请输入手机号', trigger: 'blur' }
}

const departmentOptions = ref<any[]>([])

const titleOptions = [
  { label: '主任医师', value: '主任医师' },
  { label: '副主任医师', value: '副主任医师' },
  { label: '主治医师', value: '主治医师' },
  { label: '住院医师', value: '住院医师' }
]

const columns = [
  { title: 'ID', key: 'id', width: 70, align: 'center' as const },
  {
    title: '医生信息',
    key: 'name',
    width: 200,
    render: (row: any) => h('div', { class: 'table-user-info' }, [
      h('div', { class: 'table-user-avatar' }, row.name?.[0] || '医'),
      h('div', { class: 'table-user-details' }, [
        h('div', { class: 'table-user-name' }, row.name),
        h('div', { class: 'table-user-sub' }, `工号: ${row.employeeNo}`)
      ])
    ])
  },
  {
    title: '科室',
    key: 'department.name',
    width: 120,
    render: (row: any) => h(NTag, { type: 'info', size: 'small', bordered: false }, () => row.department?.name || '-')
  },
  {
    title: '职称',
    key: 'title',
    width: 100,
    render: (row: any) => h('span', { style: 'font-weight: 500;' }, row.title)
  },
  { title: '手机号', key: 'phone', width: 130 },
  {
    title: '挂号费',
    key: 'consultFee',
    width: 90,
    align: 'right' as const,
    render: (row: any) => h('span', { style: 'color: #d03050; font-weight: 600;' }, `¥${row.consultFee || 0}`)
  },
  {
    title: '专长',
    key: 'specialty',
    width: 150,
    ellipsis: { tooltip: true },
    render: (row: any) => h('span', { style: 'color: #666;' }, row.specialty || '-')
  },
  {
    title: '状态',
    key: 'status',
    width: 90,
    align: 'center' as const,
    render: (row: any) => h(NTag, {
      type: row.status === 1 ? 'success' : 'error',
      size: 'small',
      round: true,
      bordered: false
    }, () => row.status === 1 ? '在职' : '离职')
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right' as const,
    render: (row: any) => h('div', { class: 'table-actions' }, [
      h(NButton, {
        text: true,
        type: 'info',
        size: 'small',
        onClick: () => handleView(row)
      }, {
        default: () => '详情',
        icon: () => h(NIcon, { component: EyeOutline, size: 16 })
      }),
      h(NButton, {
        text: true,
        type: 'primary',
        size: 'small',
        onClick: () => handleEdit(row)
      }, {
        default: () => '编辑',
        icon: () => h(NIcon, { component: CreateOutline, size: 16 })
      }),
      h(NButton, {
        text: true,
        type: 'error',
        size: 'small',
        onClick: () => handleDelete(row)
      }, {
        default: () => '删除',
        icon: () => h(NIcon, { component: TrashOutline, size: 16 })
      })
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
    if (searchDeptId.value) {
      params.departmentId = searchDeptId.value
    }
    const res = await getDoctorList(params)
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

const handlePageChange = (page: number) => {
  pagination.page = page
  loadData()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  formData.value = {
    id: 0, name: '', employeeNo: '', departmentId: null, title: '',
    phone: '', specialty: '', introduction: '', consultFee: 50, password: '', status: 1
  }
  showModal.value = true
}

const handleView = (row: any) => {
  currentDoctor.value = row
  showDetailModal.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  formData.value = { ...row, password: '' }
  showModal.value = true
}

const handleDelete = (row: any) => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除医生「${row.name}」吗？此操作不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    positiveButtonProps: { type: 'error' },
    onPositiveClick: async () => {
      try {
        await deleteDoctor(row.id)
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

    const submitData = { ...formData.value }
    if (isEdit.value && !submitData.password) {
      delete (submitData as any).password
    }

    if (isEdit.value) {
      await updateDoctor(formData.value.id, submitData)
      message.success('更新成功')
    } else {
      await createDoctor(submitData)
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
.detail-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-user span {
  font-weight: 600;
  font-size: 15px;
}

/* 增强表格操作按钮样式 */
.table-actions :deep(.n-button) {
  padding: 4px 8px;
}

.table-actions :deep(.n-button + .n-button) {
  margin-left: 4px;
}

/* 刷新按钮旋转动画 */
.refresh-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
