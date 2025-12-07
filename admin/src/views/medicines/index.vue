<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>药品管理</h2>
        <p>管理医院药品库存和信息</p>
      </div>
      <n-space>
        <n-button @click="showCategoryModal = true">
          <template #icon><n-icon :component="FolderOutline" /></template>
          分类管理
        </n-button>
        <n-button type="primary" @click="handleAdd">
          <template #icon><n-icon :component="AddOutline" /></template>
          新增药品
        </n-button>
      </n-space>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card stat-card-1">
        <div class="stat-icon">
          <n-icon :component="MedkitOutline" :size="28" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.totalMedicines }}</div>
          <div class="stat-label">药品总数</div>
        </div>
      </div>
      <div class="stat-card stat-card-2">
        <div class="stat-icon">
          <n-icon :component="LayersOutline" :size="28" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.totalCategories }}</div>
          <div class="stat-label">药品分类</div>
        </div>
      </div>
      <div class="stat-card stat-card-3">
        <div class="stat-icon">
          <n-icon :component="AlertCircleOutline" :size="28" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.lowStockCount }}</div>
          <div class="stat-label">库存预警</div>
        </div>
      </div>
      <div class="stat-card stat-card-4">
        <div class="stat-icon">
          <n-icon :component="BanOutline" :size="28" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.outOfStockCount }}</div>
          <div class="stat-label">缺货药品</div>
        </div>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <n-card :bordered="false" class="filter-card">
      <n-space justify="space-between" align="center">
        <n-space>
          <n-select
            v-model:value="searchCategoryId"
            :options="categoryOptions"
            placeholder="选择分类"
            clearable
            style="width: 150px"
          />
          <n-select
            v-model:value="searchStatus"
            :options="statusOptions"
            placeholder="状态"
            clearable
            style="width: 120px"
          />
          <n-input
            v-model:value="searchText"
            placeholder="搜索药品名称/编号"
            clearable
            style="width: 200px"
            @keyup.enter="loadData"
          >
            <template #prefix><n-icon :component="SearchOutline" /></template>
          </n-input>
          <n-button type="primary" @click="loadData">查询</n-button>
          <n-button @click="resetSearch">重置</n-button>
        </n-space>
        <n-space>
          <n-button @click="showLowStock = !showLowStock" :type="showLowStock ? 'warning' : 'default'">
            <template #icon><n-icon :component="AlertCircleOutline" /></template>
            {{ showLowStock ? '显示全部' : '低库存预警' }}
          </n-button>
        </n-space>
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
        @update:page-size="handlePageSizeChange"
      />
    </n-card>

    <!-- 新增/编辑弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="isEdit ? '编辑药品' : '新增药品'" style="width: 650px;">
      <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="100">
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="药品名称" path="name">
              <n-input v-model:value="formData.name" placeholder="请输入药品名称" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="药品编号" path="code">
              <n-input v-model:value="formData.code" placeholder="请输入药品编号" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="药品分类" path="categoryId">
              <n-select v-model:value="formData.categoryId" :options="categoryOptions" placeholder="请选择分类" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="规格" path="specification">
              <n-input v-model:value="formData.specification" placeholder="如：10mg*30粒/盒" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="单位" path="unit">
              <n-select v-model:value="formData.unit" :options="unitOptions" placeholder="请选择单位" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="生产厂家" path="manufacturer">
              <n-input v-model:value="formData.manufacturer" placeholder="请输入生产厂家" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="售价" path="price">
              <n-input-number v-model:value="formData.price" :precision="2" :min="0" style="width: 100%">
                <template #prefix>¥</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="进价" path="costPrice">
              <n-input-number v-model:value="formData.costPrice" :precision="2" :min="0" style="width: 100%">
                <template #prefix>¥</template>
              </n-input-number>
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="库存数量" path="stock">
              <n-input-number v-model:value="formData.stock" :min="0" style="width: 100%" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="预警库存" path="minStock">
              <n-input-number v-model:value="formData.minStock" :min="0" style="width: 100%" />
            </n-form-item>
          </n-gi>
          <n-gi :span="2">
            <n-form-item label="用法用量" path="usage">
              <n-input v-model:value="formData.usage" type="textarea" :rows="2" placeholder="请输入用法用量说明" />
            </n-form-item>
          </n-gi>
          <n-gi :span="2">
            <n-form-item label="药品说明" path="description">
              <n-input v-model:value="formData.description" type="textarea" :rows="2" placeholder="请输入药品说明" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="状态" path="status">
              <n-switch v-model:value="formData.status" :checked-value="1" :unchecked-value="0">
                <template #checked>上架</template>
                <template #unchecked>下架</template>
              </n-switch>
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 分类管理弹窗 -->
    <n-modal v-model:show="showCategoryModal" preset="card" title="药品分类管理" style="width: 500px;">
      <n-space vertical :size="16">
        <n-space>
          <n-input v-model:value="newCategoryName" placeholder="输入分类名称" style="width: 200px" />
          <n-button type="primary" @click="handleAddCategory" :loading="categoryLoading">添加分类</n-button>
        </n-space>
        <n-list bordered>
          <n-list-item v-for="cat in categories" :key="cat.id">
            <template #prefix>
              <n-icon :component="FolderOpenOutline" color="#18a058" />
            </template>
            <n-thing :title="cat.name" :description="`${cat._count?.medicines || 0} 种药品`" />
            <template #suffix>
              <n-button text type="error" @click="handleDeleteCategory(cat)" :disabled="cat._count?.medicines > 0">
                <n-icon :component="TrashOutline" />
              </n-button>
            </template>
          </n-list-item>
          <n-empty v-if="categories.length === 0" description="暂无分类" />
        </n-list>
      </n-space>
    </n-modal>

    <!-- 库存调整弹窗 -->
    <n-modal v-model:show="showStockModal" preset="card" title="库存调整" style="width: 400px;">
      <n-form label-placement="left" label-width="80">
        <n-form-item label="药品名称">
          <span>{{ currentMedicine?.name }}</span>
        </n-form-item>
        <n-form-item label="当前库存">
          <span>{{ currentMedicine?.stock }} {{ currentMedicine?.unit }}</span>
        </n-form-item>
        <n-form-item label="调整类型">
          <n-radio-group v-model:value="stockAdjust.type">
            <n-radio value="in">入库</n-radio>
            <n-radio value="out">出库</n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="调整数量">
          <n-input-number v-model:value="stockAdjust.quantity" :min="1" style="width: 100%" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showStockModal = false">取消</n-button>
          <n-button type="primary" :loading="stockLoading" @click="handleStockSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h, computed } from 'vue'
import {
  NCard, NButton, NSpace, NInput, NIcon, NDataTable, NModal, NForm, NFormItem,
  NSelect, NSwitch, NInputNumber, NGrid, NGi, NTag, NList, NListItem, NThing,
  NEmpty, NRadioGroup, NRadio, useMessage, useDialog, FormInst
} from 'naive-ui'
import {
  AddOutline, SearchOutline, CreateOutline, TrashOutline, MedkitOutline,
  LayersOutline, AlertCircleOutline, BanOutline, FolderOutline, FolderOpenOutline,
  SwapVerticalOutline
} from '@vicons/ionicons5'
import {
  getMedicineList, getMedicineCategories, createMedicine, updateMedicine, deleteMedicine,
  createMedicineCategory, deleteMedicineCategory, updateMedicineStock, getMedicineStatistics
} from '@/api/medicine'

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const submitLoading = ref(false)
const categoryLoading = ref(false)
const stockLoading = ref(false)
const showModal = ref(false)
const showCategoryModal = ref(false)
const showStockModal = ref(false)
const showLowStock = ref(false)
const isEdit = ref(false)
const searchText = ref('')
const searchCategoryId = ref<number | null>(null)
const searchStatus = ref<number | null>(null)
const tableData = ref<any[]>([])
const categories = ref<any[]>([])
const newCategoryName = ref('')
const formRef = ref<FormInst | null>(null)
const currentMedicine = ref<any>(null)

const statistics = ref({
  totalMedicines: 0,
  totalCategories: 0,
  lowStockCount: 0,
  outOfStockCount: 0
})

const stockAdjust = ref({
  type: 'in' as 'in' | 'out',
  quantity: 1
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
})

const formData = ref({
  id: 0,
  name: '',
  code: '',
  categoryId: null as number | null,
  specification: '',
  unit: '盒',
  manufacturer: '',
  price: 0,
  costPrice: 0,
  stock: 0,
  minStock: 10,
  usage: '',
  description: '',
  status: 1
})

const rules = {
  name: { required: true, message: '请输入药品名称', trigger: 'blur' },
  code: { required: true, message: '请输入药品编号', trigger: 'blur' },
  categoryId: { required: true, type: 'number', message: '请选择分类', trigger: 'change' },
  price: { required: true, type: 'number', message: '请输入售价', trigger: 'blur' }
}

const statusOptions = [
  { label: '上架', value: 1 },
  { label: '下架', value: 0 }
]

const unitOptions = [
  { label: '盒', value: '盒' },
  { label: '瓶', value: '瓶' },
  { label: '袋', value: '袋' },
  { label: '支', value: '支' },
  { label: '片', value: '片' },
  { label: '粒', value: '粒' },
  { label: '剂', value: '剂' }
]

const categoryOptions = computed(() => {
  return categories.value.map(cat => ({
    label: cat.name,
    value: cat.id
  }))
})

const getStockStatus = (row: any) => {
  if (row.stock === 0) return { type: 'error', text: '缺货' }
  if (row.stock <= row.minStock) return { type: 'warning', text: '库存低' }
  return { type: 'success', text: '充足' }
}

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '药品编号', key: 'code', width: 100 },
  { title: '药品名称', key: 'name', width: 150, ellipsis: { tooltip: true } },
  { title: '分类', key: 'category.name', width: 100, render: (row: any) => row.category?.name || '-' },
  { title: '规格', key: 'specification', width: 120 },
  { title: '单位', key: 'unit', width: 60 },
  {
    title: '售价',
    key: 'price',
    width: 90,
    render: (row: any) => h('span', { style: 'color: #f0a020; font-weight: 500;' }, `¥${row.price}`)
  },
  {
    title: '库存',
    key: 'stock',
    width: 100,
    render: (row: any) => {
      const status = getStockStatus(row)
      return h(NSpace, { align: 'center', size: 4 }, () => [
        h('span', {}, row.stock),
        h(NTag, { type: status.type as any, size: 'small', round: true }, () => status.text)
      ])
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: any) => h(NTag, { type: row.status === 1 ? 'success' : 'default', size: 'small' }, () => row.status === 1 ? '上架' : '下架')
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (row: any) => h(NSpace, { size: 4 }, () => [
      h(NButton, { text: true, type: 'info', onClick: () => handleStock(row) }, { default: () => '库存', icon: () => h(NIcon, { component: SwapVerticalOutline }) }),
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
    if (searchText.value) params.keyword = searchText.value
    if (searchCategoryId.value) params.categoryId = searchCategoryId.value
    if (searchStatus.value !== null) params.status = searchStatus.value
    if (showLowStock.value) params.lowStock = true

    const res = await getMedicineList(params)
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
    const res = await getMedicineCategories()
    categories.value = res.data?.list || res.data || res.list || res || []
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

const loadStatistics = async () => {
  try {
    const res = await getMedicineStatistics()
    const data = res.data || res || {}
    statistics.value = {
      totalMedicines: data.totalMedicines || data.total || 0,
      totalCategories: data.totalCategories || categories.value.length,
      lowStockCount: data.lowStockCount || 0,
      outOfStockCount: data.outOfStockCount || 0
    }
  } catch (error) {
    console.error('加载统计失败', error)
  }
}

const resetSearch = () => {
  searchText.value = ''
  searchCategoryId.value = null
  searchStatus.value = null
  showLowStock.value = false
  pagination.page = 1
  loadData()
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
    id: 0, name: '', code: '', categoryId: null, specification: '',
    unit: '盒', manufacturer: '', price: 0, costPrice: 0, stock: 0,
    minStock: 10, usage: '', description: '', status: 1
  }
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
    content: `确定要删除药品「${row.name}」吗？此操作不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteMedicine(row.id)
        message.success('删除成功')
        loadData()
        loadStatistics()
      } catch (error: any) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

const handleStock = (row: any) => {
  currentMedicine.value = row
  stockAdjust.value = { type: 'in', quantity: 1 }
  showStockModal.value = true
}

const handleStockSubmit = async () => {
  stockLoading.value = true
  try {
    await updateMedicineStock(currentMedicine.value.id, stockAdjust.value)
    message.success('库存调整成功')
    showStockModal.value = false
    loadData()
    loadStatistics()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  } finally {
    stockLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await updateMedicine(formData.value.id, formData.value)
      message.success('更新成功')
    } else {
      await createMedicine(formData.value)
      message.success('创建成功')
    }
    showModal.value = false
    loadData()
    loadStatistics()
  } catch (error: any) {
    if (!Array.isArray(error)) {
      message.error(error.message || '操作失败')
    }
  } finally {
    submitLoading.value = false
  }
}

const handleAddCategory = async () => {
  if (!newCategoryName.value.trim()) {
    message.warning('请输入分类名称')
    return
  }
  categoryLoading.value = true
  try {
    await createMedicineCategory({ name: newCategoryName.value.trim() })
    message.success('添加成功')
    newCategoryName.value = ''
    loadCategories()
  } catch (error: any) {
    message.error(error.message || '添加失败')
  } finally {
    categoryLoading.value = false
  }
}

const handleDeleteCategory = (cat: any) => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除分类「${cat.name}」吗？`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteMedicineCategory(cat.id)
        message.success('删除成功')
        loadCategories()
      } catch (error: any) {
        message.error(error.message || '删除失败')
      }
    }
  })
}

onMounted(() => {
  loadCategories()
  loadData()
  loadStatistics()
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

.stat-card-1 .stat-icon { background: linear-gradient(135deg, #18a058, #36ad6a); }
.stat-card-2 .stat-icon { background: linear-gradient(135deg, #2080f0, #36a2eb); }
.stat-card-3 .stat-icon { background: linear-gradient(135deg, #f0a020, #ffc107); }
.stat-card-4 .stat-icon { background: linear-gradient(135deg, #d03050, #f43f5e); }

.stat-info {
  flex: 1;
}

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

.filter-card {
  margin-bottom: 16px;
}

.table-card :deep(.n-data-table-th) {
  font-weight: 600;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
