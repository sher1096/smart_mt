<template>
  <div class="page-container">
    <n-card title="新闻资讯管理" :bordered="false">
      <!-- 操作栏 -->
      <div class="action-bar">
        <n-space>
          <n-button type="primary" @click="handleAdd">
            <template #icon><n-icon :component="AddOutline" /></template>
            发布新闻
          </n-button>
        </n-space>
        <n-space>
          <n-input v-model:value="searchText" placeholder="搜索标题" clearable style="width: 200px" @keyup.enter="loadData">
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

    <!-- 新增/编辑弹窗 -->
    <n-modal v-model:show="showModal" preset="card" :title="isEdit ? '编辑新闻' : '发布新闻'" style="width: 700px;">
      <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="80">
        <n-form-item label="新闻标题" path="title">
          <n-input v-model:value="formData.title" placeholder="请输入新闻标题" />
        </n-form-item>
        <n-form-item label="新闻摘要" path="summary">
          <n-input v-model:value="formData.summary" type="textarea" placeholder="请输入新闻摘要" :rows="2" />
        </n-form-item>
        <n-form-item label="新闻内容" path="content">
          <n-input v-model:value="formData.content" type="textarea" placeholder="请输入新闻内容" :rows="8" />
        </n-form-item>
        <n-form-item label="封面图片" path="image">
          <n-input v-model:value="formData.image" placeholder="请输入图片URL（可选）" />
        </n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-gi>
            <n-form-item label="是否置顶" path="isTop">
              <n-switch v-model:value="formData.isTop" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="发布状态" path="status">
              <n-switch v-model:value="formData.status" :checked-value="1" :unchecked-value="0">
                <template #checked>已发布</template>
                <template #unchecked>草稿</template>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import {
  NCard, NButton, NSpace, NInput, NIcon, NDataTable, NModal, NForm, NFormItem,
  NSwitch, NGrid, NGi, NTag, useMessage, useDialog, FormInst
} from 'naive-ui'
import { AddOutline, SearchOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { getNewsList, createNews, updateNews, deleteNews } from '@/api/news'

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const submitLoading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const searchText = ref('')
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
  title: '',
  summary: '',
  content: '',
  image: '',
  isTop: false,
  status: 1
})

const rules = {
  title: { required: true, message: '请输入新闻标题', trigger: 'blur' },
  summary: { required: true, message: '请输入新闻摘要', trigger: 'blur' },
  content: { required: true, message: '请输入新闻内容', trigger: 'blur' }
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleDateString()
}

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '标题', key: 'title', width: 200, ellipsis: { tooltip: true } },
  { title: '摘要', key: 'summary', width: 250, ellipsis: { tooltip: true } },
  { title: '浏览量', key: 'viewCount', width: 80 },
  {
    title: '置顶',
    key: 'isTop',
    width: 70,
    render: (row: any) => h(NTag, { type: row.isTop ? 'warning' : 'default', size: 'small' }, () => row.isTop ? '置顶' : '否')
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: any) => h(NTag, { type: row.status === 1 ? 'success' : 'default', size: 'small' }, () => row.status === 1 ? '已发布' : '草稿')
  },
  { title: '发布时间', key: 'publishedAt', width: 110, render: (row: any) => formatTime(row.publishedAt) },
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
    if (searchText.value) {
      params.keyword = searchText.value
    }
    const res = await getNewsList(params)
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

const handleAdd = () => {
  isEdit.value = false
  formData.value = { id: 0, title: '', summary: '', content: '', image: '', isTop: false, status: 1 }
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
    content: `确定要删除新闻「${row.title}」吗？此操作不可恢复。`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteNews(row.id)
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
      await updateNews(formData.value.id, formData.value)
      message.success('更新成功')
    } else {
      await createNews(formData.value)
      message.success('发布成功')
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
