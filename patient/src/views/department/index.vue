<template>
  <div class="department-page">
    <div class="page-header">
      <n-icon :component="ArrowBackOutline" :size="24" class="back-btn" @click="router.back()" />
      <h2>选择科室</h2>
      <div class="placeholder"></div>
    </div>

    <div class="search-bar">
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索科室名称"
        clearable
        @update:value="handleSearch"
      >
        <template #prefix>
          <n-icon :component="SearchOutline" />
        </template>
      </n-input>
    </div>

    <div class="department-list">
      <div
        v-for="dept in filteredDepartments"
        :key="dept.id"
        class="department-item"
        @click="handleDepartmentClick(dept)"
      >
        <div class="dept-info">
          <n-icon :size="28" :color="getRandomColor()" :component="MedicalOutline" />
          <div class="dept-detail">
            <h4>{{ dept.name }}</h4>
            <p>{{ dept.description || '暂无描述' }}</p>
          </div>
        </div>
        <n-icon :size="20" :component="ChevronForward" color="#ccc" />
      </div>
    </div>

    <n-empty v-if="filteredDepartments.length === 0" description="暂无科室" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NInput, NIcon, NEmpty } from 'naive-ui'
import { ArrowBackOutline, SearchOutline, MedicalOutline, ChevronForward } from '@vicons/ionicons5'
import { getDepartmentList } from '@/api'

const router = useRouter()

const searchKeyword = ref('')
const departments = ref<any[]>([])

const colors = ['#18a058', '#2080f0', '#f0a020', '#d03050', '#7c3aed']
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)]

const filteredDepartments = computed(() => {
  if (!searchKeyword.value) return departments.value
  return departments.value.filter(dept =>
    dept.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const loadDepartments = async () => {
  try {
    const res = await getDepartmentList()
    departments.value = res.data?.list || res.data || []
  } catch (error) {
    console.error('加载科室列表失败', error)
  }
}

const handleSearch = () => {
  // 搜索逻辑已通过 computed 实现
}

const handleDepartmentClick = (dept: any) => {
  router.push({
    path: '/appointment/doctors',
    query: { departmentId: dept.id, departmentName: dept.name }
  })
}

onMounted(() => {
  loadDepartments()
})
</script>

<style scoped>
.department-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.back-btn {
  cursor: pointer;
  padding: 5px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.placeholder {
  width: 34px;
}

.search-bar {
  padding: 15px;
  background-color: #fff;
}

.department-list {
  padding: 10px 15px;
}

.department-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.department-item:active {
  transform: scale(0.98);
}

.dept-info {
  display: flex;
  gap: 12px;
  flex: 1;
}

.dept-detail {
  flex: 1;
}

.dept-detail h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.dept-detail p {
  margin: 0;
  font-size: 13px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
