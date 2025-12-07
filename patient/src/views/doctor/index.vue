<template>
  <div class="doctor-page">
    <div class="page-header">
      <n-icon :component="ArrowBackOutline" :size="24" class="back-btn" @click="router.back()" />
      <h2>{{ departmentName || '选择医生' }}</h2>
      <div class="placeholder"></div>
    </div>

    <div class="search-bar">
      <n-input
        v-model:value="searchKeyword"
        placeholder="搜索医生姓名"
        clearable
        round
      >
        <template #prefix>
          <n-icon :component="SearchOutline" color="#999" />
        </template>
      </n-input>
    </div>

    <div v-if="loading" class="loading-container">
      <n-spin size="large" />
      <p>加载中...</p>
    </div>

    <div v-else class="doctor-list">
      <div
        v-for="(doctor, index) in filteredDoctors"
        :key="doctor.id"
        class="doctor-card"
        @click="handleDoctorClick(doctor)"
      >
        <div class="doctor-avatar-section">
          <div class="avatar-wrapper">
            <n-avatar :size="72" :src="getAvatar(doctor, index)" round />
            <div v-if="isExpert(doctor.title)" class="expert-badge">专家</div>
          </div>
        </div>
        <div class="doctor-info">
          <div class="doctor-name-row">
            <h4>{{ doctor.name }}</h4>
            <n-tag :type="getTitleType(doctor.title)" size="small" :bordered="false">
              {{ doctor.title || '医师' }}
            </n-tag>
          </div>
          <p class="doctor-department">
            <n-icon :component="MedicalOutline" :size="14" />
            {{ getDepartmentName(doctor) }}
          </p>
          <div class="doctor-specialty">
            <span class="specialty-label">擅长：</span>
            <span class="specialty-text">{{ doctor.specialty || doctor.description || '专业诊疗服务' }}</span>
          </div>
          <div class="doctor-stats">
            <div class="stat-item">
              <n-icon :component="StarOutline" :size="14" color="#f0a020" />
              <span>{{ doctor.rating || '5.0' }}</span>
            </div>
            <div class="stat-item">
              <n-icon :component="PeopleOutline" :size="14" color="#18a058" />
              <span>{{ getConsultCount(doctor) }}人就诊</span>
            </div>
          </div>
        </div>
        <div class="action-section">
          <n-button type="primary" size="small" round>
            立即预约
          </n-button>
        </div>
      </div>
    </div>

    <n-empty v-if="!loading && filteredDoctors.length === 0" description="暂无医生" class="empty-state" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NInput, NIcon, NAvatar, NEmpty, NTag, NButton, NSpin } from 'naive-ui'
import { ArrowBackOutline, SearchOutline, MedicalOutline, StarOutline, PeopleOutline } from '@vicons/ionicons5'
import { getDoctorList, getDoctorsByDepartment } from '@/api'

const router = useRouter()
const route = useRoute()

const searchKeyword = ref('')
const doctors = ref<any[]>([])
const loading = ref(true)
const departmentId = ref(route.query.departmentId as string)
const departmentName = ref(route.query.departmentName as string)

const filteredDoctors = computed(() => {
  if (!searchKeyword.value) return doctors.value
  return doctors.value.filter(doctor =>
    doctor.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 生成医生头像SVG
const generateAvatarSvg = (name: string, index: number) => {
  const initial = name?.[0] || '医'
  const colors = ['#18a058', '#2080f0', '#7c3aed', '#f0a020', '#d03050']
  const color = colors[index % 5]
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><defs><linearGradient id="g${index}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${color}"/><stop offset="100%" style="stop-color:${color}99"/></linearGradient></defs><circle cx="36" cy="36" r="36" fill="url(#g${index})"/><text x="36" y="44" font-size="28" fill="#fff" text-anchor="middle" font-family="sans-serif" font-weight="500">${initial}</text></svg>`)}`
}

// 获取头像
const getAvatar = (doctor: any, index: number) => {
  if (doctor.avatar && doctor.avatar.startsWith('http')) {
    return doctor.avatar
  }
  return generateAvatarSvg(doctor.name, index)
}

// 获取科室名称
const getDepartmentName = (doctor: any) => {
  if (typeof doctor.department === 'string') {
    return doctor.department
  }
  if (doctor.department?.name) {
    return doctor.department.name
  }
  return departmentName.value || '综合科'
}

// 获取就诊人数
const getConsultCount = (doctor: any) => {
  if (doctor.consultCount) return doctor.consultCount
  if (doctor._count?.appointments) return doctor._count.appointments
  // 根据医生ID生成稳定的随机数
  return 100 + (doctor.id * 37) % 400
}

// 判断是否是专家
const isExpert = (title: string) => {
  if (!title) return false
  return title.includes('主任') && !title.includes('副主任')
}

// 根据职称返回标签类型
const getTitleType = (title: string) => {
  if (!title) return 'success'
  if (title.includes('主任') && !title.includes('副主任')) return 'warning'
  if (title.includes('副主任')) return 'info'
  return 'success'
}

const loadDoctors = async () => {
  loading.value = true
  try {
    let res
    if (departmentId.value) {
      res = await getDoctorsByDepartment(Number(departmentId.value))
    } else {
      res = await getDoctorList()
    }
    const list = res.data?.list || res.data || res.list || []
    doctors.value = Array.isArray(list) ? list : []
  } catch (error) {
    console.error('加载医生列表失败', error)
    doctors.value = []
  } finally {
    loading.value = false
  }
}

const handleDoctorClick = (doctor: any) => {
  router.push({
    path: '/appointment/booking',
    query: {
      doctorId: doctor.id,
      doctorName: doctor.name,
      departmentId: departmentId.value || doctor.departmentId || doctor.department?.id
    }
  })
}

onMounted(() => {
  loadDoctors()
})
</script>

<style scoped>
.doctor-page {
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.loading-container p {
  margin-top: 12px;
  font-size: 14px;
}

.doctor-list {
  padding: 12px 16px;
}

.doctor-card {
  display: flex;
  gap: 16px;
  background: #fff;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.doctor-card::before {
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

.doctor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(24, 160, 88, 0.12);
}

.doctor-card:hover::before {
  opacity: 1;
}

.doctor-card:active {
  transform: scale(0.99);
}

.doctor-avatar-section {
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
}

.expert-badge {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f0a020 0%, #ffc107 100%);
  color: #fff;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(240, 160, 32, 0.3);
}

.doctor-info {
  flex: 1;
  min-width: 0;
}

.doctor-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.doctor-name-row h4 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.doctor-department {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #18a058;
}

.doctor-specialty {
  margin-bottom: 10px;
  font-size: 13px;
  line-height: 1.5;
}

.specialty-label {
  color: #999;
}

.specialty-text {
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.doctor-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.action-section {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.action-section :deep(.n-button) {
  font-size: 13px;
  padding: 0 16px;
}

.empty-state {
  margin-top: 60px;
}
</style>
