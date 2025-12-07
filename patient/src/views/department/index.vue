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
        round
      >
        <template #prefix>
          <n-icon :component="SearchOutline" color="#999" />
        </template>
      </n-input>
    </div>

    <!-- 热门科室 -->
    <div class="hot-section" v-if="!searchKeyword">
      <div class="section-title">
        <div class="title-bar"></div>
        <h3>热门科室</h3>
      </div>
      <div class="hot-grid">
        <div
          v-for="(dept, index) in hotDepartments"
          :key="dept.id"
          class="hot-item"
          @click="handleDepartmentClick(dept)"
        >
          <div class="hot-icon" :style="{ background: deptColors[index % 8].bg }">
            <n-icon :component="deptIcons[index % 8]" :size="24" :color="deptColors[index % 8].color" />
          </div>
          <span>{{ dept.name }}</span>
        </div>
      </div>
    </div>

    <!-- 全部科室 -->
    <div class="section-title list-title">
      <div class="title-bar" style="background: #2080f0"></div>
      <h3>{{ searchKeyword ? '搜索结果' : '全部科室' }}</h3>
      <span class="dept-count">共 {{ filteredDepartments.length }} 个科室</span>
    </div>

    <div class="department-list">
      <div
        v-for="(dept, index) in filteredDepartments"
        :key="dept.id"
        class="department-card"
        @click="handleDepartmentClick(dept)"
      >
        <div class="dept-icon-wrapper">
          <div class="dept-icon" :style="{ background: deptColors[index % 8].bg }">
            <n-icon :component="deptIcons[index % 8]" :size="28" :color="deptColors[index % 8].color" />
          </div>
        </div>
        <div class="dept-content">
          <div class="dept-header">
            <h4>{{ dept.name }}</h4>
            <n-tag v-if="dept.isHot" size="small" type="error" :bordered="false">热门</n-tag>
          </div>
          <p class="dept-description">{{ dept.description || '提供专业诊疗服务' }}</p>
          <div class="dept-stats">
            <span class="stat">
              <n-icon :component="PeopleOutline" :size="14" />
              {{ dept.doctorCount || Math.floor(Math.random() * 10 + 3) }} 位医生
            </span>
            <span class="stat">
              <n-icon :component="TimeOutline" :size="14" />
              今日可预约
            </span>
          </div>
        </div>
        <div class="dept-action">
          <n-icon :size="20" :component="ChevronForward" color="#ccc" />
        </div>
      </div>
    </div>

    <n-empty v-if="filteredDepartments.length === 0" description="暂无科室" class="empty-state" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NInput, NIcon, NEmpty, NTag } from 'naive-ui'
import {
  ArrowBackOutline,
  SearchOutline,
  ChevronForward,
  HeartOutline,
  PulseOutline,
  BodyOutline,
  EyeOutline,
  BandageOutline,
  ThermometerOutline,
  FitnessOutline,
  NutritionOutline,
  PeopleOutline,
  TimeOutline
} from '@vicons/ionicons5'
import { getDepartmentList } from '@/api'

const router = useRouter()

const searchKeyword = ref('')
const departments = ref<any[]>([])

// 科室颜色配置
const deptColors = [
  { bg: 'rgba(24, 160, 88, 0.1)', color: '#18a058' },
  { bg: 'rgba(32, 128, 240, 0.1)', color: '#2080f0' },
  { bg: 'rgba(240, 160, 32, 0.1)', color: '#f0a020' },
  { bg: 'rgba(208, 48, 80, 0.1)', color: '#d03050' },
  { bg: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' },
  { bg: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' },
  { bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' },
  { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }
]

// 科室图标
const deptIcons = [
  HeartOutline, PulseOutline, BodyOutline, EyeOutline,
  BandageOutline, ThermometerOutline, FitnessOutline, NutritionOutline
]

// 热门科室（取前8个）
const hotDepartments = computed(() => {
  return departments.value.slice(0, 8)
})

const filteredDepartments = computed(() => {
  if (!searchKeyword.value) return departments.value
  return departments.value.filter(dept =>
    dept.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const loadDepartments = async () => {
  try {
    const res = await getDepartmentList()
    departments.value = (res.data?.list || res.data || []).map((dept: any, index: number) => ({
      ...dept,
      isHot: index < 4
    }))
  } catch (error) {
    console.error('加载科室列表失败', error)
  }
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
  background: linear-gradient(180deg, #f8faf9 0%, #f0f2f5 100%);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
  color: #fff;
}

.back-btn {
  cursor: pointer;
  padding: 5px;
  color: #fff;
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
  padding: 12px 16px;
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
  padding-top: 0;
}

.search-bar :deep(.n-input) {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 热门科室 */
.hot-section {
  background: #fff;
  margin: 12px;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.title-bar {
  width: 4px;
  height: 16px;
  background: #18a058;
  border-radius: 2px;
}

.section-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.hot-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.hot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px 0;
  border-radius: 12px;
  transition: all 0.2s;
}

.hot-item:active {
  background: #f5f5f5;
  transform: scale(0.98);
}

.hot-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.hot-item:active .hot-icon {
  transform: scale(0.95);
}

.hot-item span {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

/* 列表标题 */
.list-title {
  padding: 0 16px;
  margin: 16px 0 12px;
}

.dept-count {
  margin-left: auto;
  font-size: 13px;
  color: #999;
}

/* 科室列表 */
.department-list {
  padding: 0 12px 20px;
}

.department-card {
  display: flex;
  gap: 14px;
  background: #fff;
  padding: 16px;
  margin-bottom: 10px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.department-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #18a058 0%, #36ad6a 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.department-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(24, 160, 88, 0.12);
}

.department-card:hover::before {
  opacity: 1;
}

.department-card:active {
  transform: scale(0.99);
}

.dept-icon-wrapper {
  flex-shrink: 0;
}

.dept-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dept-content {
  flex: 1;
  min-width: 0;
}

.dept-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.dept-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.dept-description {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dept-stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #18a058;
}

.dept-action {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.empty-state {
  margin-top: 60px;
}
</style>
