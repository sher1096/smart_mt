<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header-card">
      <div class="page-header-content">
        <div class="page-header-info">
          <div class="page-header-icon">
            <n-icon :component="BusinessOutline" :size="28" color="#fff" />
          </div>
          <div class="page-header-text">
            <h1>科室管理</h1>
            <p>管理医院科室信息，设置科室分类和基本资料</p>
          </div>
        </div>
        <div class="page-header-stats">
          <div class="page-header-stat">
            <div class="page-header-stat-value">{{ pagination.itemCount }}</div>
            <div class="page-header-stat-label">科室总数</div>
          </div>
          <div class="page-header-stat">
            <div class="page-header-stat-value">{{ categories.length }}</div>
            <div class="page-header-stat-label">分类数</div>
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
            新增科室
          </n-button>
          <n-button secondary @click="handleAddCategory">
            <template #icon><n-icon :component="FolderOutline" /></template>
            管理分类
          </n-button>
          <n-button quaternary @click="loadData">
            <template #icon><n-icon :component="RefreshOutline" :class="{ 'refresh-spin': loading }" /></template>
            刷新
          </n-button>
        </div>
        <div class="action-bar-right">
          <n-select
            v-model:value="searchCategoryId"
            :options="categoryOptions"
            placeholder="选择分类"
            clearable
            class="filter-select"
            @update:value="loadData"
          />
          <n-input
            v-model:value="searchText"
            placeholder="搜索科室名称"
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
          :scroll-x="1000"
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
      :title="isEdit ? '编辑科室' : '新增科室'"
      style="width: 560px;"
      :mask-closable="false"
      :segmented="{ content: true, footer: 'soft' }"
    >
      <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="80">
        <n-grid :cols="2" :x-gap="20">
          <n-gi>
            <n-form-item label="科室名称" path="name">
              <n-input v-model:value="formData.name" placeholder="请输入科室名称" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="科室编码" path="code">
              <n-input v-model:value="formData.code" placeholder="请输入编码" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="所属分类" path="categoryId">
              <n-select v-model:value="formData.categoryId" :options="categoryOptions" placeholder="请选择分类" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="联系电话" path="phone">
              <n-input v-model:value="formData.phone" placeholder="请输入电话" />
            </n-form-item>
          </n-gi>
          <n-gi :span="2">
            <n-form-item label="科室位置" path="location">
              <n-input v-model:value="formData.location" placeholder="请输入科室位置，如：门诊楼3层" />
            </n-form-item>
          </n-gi>
          <n-gi :span="2">
            <n-form-item label="科室描述" path="description">
              <n-input
                v-model:value="formData.description"
                type="textarea"
                placeholder="请输入科室描述"
                :rows="3"
                :autosize="{ minRows: 3, maxRows: 6 }"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="状态" path="status">
              <n-switch v-model:value="formData.status" :checked-value="1" :unchecked-value="0">
                <template #checked>启用</template>
                <template #unchecked>停用</template>
              </n-switch>
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '创建科室' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 分类管理弹窗 -->
    <n-modal
      v-model:show="showCategoryModal"
      preset="card"
      title="科室分类管理"
      style="width: 560px;"
      :segmented="{ content: true }"
    >
      <div class="category-manager">
        <div class="category-add">
          <n-input-group>
            <n-input v-model:value="newCategoryName" placeholder="输入新分类名称" />
            <n-button type="primary" :disabled="!newCategoryName.trim()" @click="handleCreateCategory">
              <template #icon><n-icon :component="AddOutline" /></template>
              添加
            </n-button>
          </n-input-group>
        </div>
        <div class="category-list">
          <div v-if="categories.length === 0" class="category-empty">
            <n-empty description="暂无分类" size="small" />
          </div>
          <div v-else class="category-items">
            <div v-for="cat in categories" :key="cat.id" class="category-item">
              <div class="category-info">
                <n-icon :component="FolderOutline" :size="18" color="#18a058" />
                <span class="category-name">{{ cat.name }}</span>
                <n-tag size="tiny" type="info" :bordered="false">排序: {{ cat.sort }}</n-tag>
              </div>
              <n-button text type="error" size="small" @click="handleDeleteCategory(cat.id)">
                <template #icon><n-icon :component="TrashOutline" /></template>
                删除
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NCard, NButton, NSpace, NInput, NInputGroup, NIcon, NDataTable, NModal, NForm, NFormItem,
  NSelect, NSwitch, NTag, NGrid, NGi, NEmpty, useMessage, useDialog, FormInst
} from 'naive-ui'
import {
  AddOutline, SearchOutline, FolderOutline, CreateOutline, TrashOutline,
  BusinessOutline, RefreshOutline, EyeOutline, LocationOutline, CallOutline
} from '@vicons/ionicons5'
import {
  getDepartmentList, getDepartmentCategories, createDepartment, updateDepartment,
  deleteDepartment, createDepartmentCategory, deleteDepartmentCategory
} from '@/api/department'

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const submitLoading = ref(false)
const showModal = ref(false)
const showCategoryModal = ref(false)
const isEdit = ref(false)
const searchText = ref('')
const searchCategoryId = ref<number | null>(null)
const tableData = ref<any[]>([])
const categories = ref<any[]>([])
const newCategoryName = ref('')
const formRef = ref<FormInst | null>(null)

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
  code: '',
  categoryId: null as number | null,
  location: '',
  phone: '',
  description: '',
  status: 1
})

const rules = {
  name: { required: true, message: '请输入科室名称', trigger: 'blur' },
  code: { required: true, message: '请输入科室编码', trigger: 'blur' },
  categoryId: { required: true, type: 'number', message: '请选择所属分类', trigger: 'change' }
}

const categoryOptions = ref<any[]>([])

const columns = [
  { title: 'ID', key: 'id', width: 70, align: 'center' as const },
  {
    title: '科室信息',
    key: 'name',
    width: 180,
    render: (row: any) => h('div', { class: 'table-user-info' }, [
      h('div', {
        class: 'table-user-avatar',
        style: 'background: linear-gradient(135deg, #2080f0, #36a2eb);'
      }, row.name?.[0] || '科'),
      h('div', { class: 'table-user-details' }, [
        h('div', { class: 'table-user-name' }, row.name),
        h('div', { class: 'table-user-sub' }, `编码: ${row.code}`)
      ])
    ])
  },
  {
    title: '所属分类',
    key: 'category.name',
    width: 110,
    render: (row: any) => h(NTag, { type: 'warning', size: 'small', bordered: false }, () => row.category?.name || '-')
  },
  {
    title: '位置',
    key: 'location',
    width: 140,
    render: (row: any) => row.location ? h('div', { style: 'display: flex; align-items: center; gap: 4px; color: #666;' }, [
      h(NIcon, { component: LocationOutline, size: 14 }),
      h('span', null, row.location)
    ]) : '-'
  },
  {
    title: '联系电话',
    key: 'phone',
    width: 130,
    render: (row: any) => row.phone ? h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
      h(NIcon, { component: CallOutline, size: 14, color: '#18a058' }),
      h('span', null, row.phone)
    ]) : '-'
  },
  {
    title: '医生数',
    key: '_count.doctors',
    width: 90,
    align: 'center' as const,
    render: (row: any) => h(NTag, {
      type: 'info',
      size: 'small',
      round: true
    }, () => `${row._count?.doctors || 0} 人`)
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
    }, () => row.status === 1 ? '启用' : '停用')
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right' as const,
    render: (row: any) => h('div', { class: 'table-actions' }, [
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
    if (searchCategoryId.value) {
      params.categoryId = searchCategoryId.value
    }
    const res = await getDepartmentList(params)
    tableData.value = res.data?.list || res.list || []
    pagination.itemCount = res.data?.total || res.total || 0
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await getDepartmentCategories()
    categories.value = res.data || res || []
    categoryOptions.value = categories.value.map((cat: any) => ({
      label: cat.name,
      value: cat.id
    }))
  } catch (error) {
    console.error('加载分类失败', error)
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
  formData.value = { id: 0, name: '', code: '', categoryId: null, location: '', phone: '', description: '', status: 1 }
  showModal.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  formData.value = { ...row }
  showModal.value = true
}

const handleDelete = (row: any) => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除科室「${row.name}」吗？此操作不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    positiveButtonProps: { type: 'error' },
    onPositiveClick: async () => {
      try {
        await deleteDepartment(row.id)
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

    if (isEdit.value) {
      await updateDepartment(formData.value.id, formData.value)
      message.success('更新成功')
    } else {
      await createDepartment(formData.value)
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

const handleAddCategory = () => {
  showCategoryModal.value = true
}

const handleCreateCategory = async () => {
  if (!newCategoryName.value.trim()) {
    message.warning('请输入分类名称')
    return
  }
  try {
    await createDepartmentCategory({ name: newCategoryName.value, sort: categories.value.length + 1 })
    message.success('创建成功')
    newCategoryName.value = ''
    loadCategories()
  } catch (error: any) {
    message.error(error.message || '创建失败')
  }
}

const handleDeleteCategory = (id: number) => {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除该分类吗？此操作不可恢复。',
    positiveText: '确定删除',
    negativeText: '取消',
    positiveButtonProps: { type: 'error' },
    onPositiveClick: async () => {
      try {
        await deleteDepartmentCategory(id)
        message.success('删除成功')
        loadCategories()
      } catch (error: any) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

onMounted(() => {
  loadData()
  loadCategories()
})
</script>

<style scoped>
/* 分类管理样式 */
.category-manager {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-add {
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.category-list {
  max-height: 400px;
  overflow-y: auto;
}

.category-empty {
  padding: 40px 0;
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fafbfc;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.category-item:hover {
  background: #f5f7fa;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-name {
  font-weight: 500;
  color: #333;
}

/* 刷新按钮旋转动画 */
.refresh-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 表格操作按钮 */
.table-actions :deep(.n-button) {
  padding: 4px 8px;
}

.table-actions :deep(.n-button + .n-button) {
  margin-left: 4px;
}
</style>
