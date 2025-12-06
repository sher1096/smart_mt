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
      >
        <template #prefix>
          <n-icon :component="SearchOutline" />
        </template>
      </n-input>
    </div>

    <div class="doctor-list">
      <div
        v-for="doctor in filteredDoctors"
        :key="doctor.id"
        class="doctor-card"
        @click="handleDoctorClick(doctor)"
      >
        <n-avatar :size="70" :src="doctor.avatar" />
        <div class="doctor-info">
          <h4>{{ doctor.name }}</h4>
          <p class="doctor-title">{{ doctor.title }} | {{ doctor.department }}</p>
          <p class="doctor-specialty">擅长：{{ doctor.specialty || '暂无' }}</p>
        </div>
        <n-icon :size="20" :component="ChevronForward" color="#ccc" />
      </div>
    </div>

    <n-empty v-if="filteredDoctors.length === 0" description="暂无医生" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NInput, NIcon, NAvatar, NEmpty } from 'naive-ui'
import { ArrowBackOutline, SearchOutline, ChevronForward } from '@vicons/ionicons5'
import { getDoctorList, getDoctorsByDepartment } from '@/api'

const router = useRouter()
const route = useRoute()

const searchKeyword = ref('')
const doctors = ref<any[]>([])
const departmentId = ref(route.query.departmentId as string)
const departmentName = ref(route.query.departmentName as string)

const filteredDoctors = computed(() => {
  if (!searchKeyword.value) return doctors.value
  return doctors.value.filter(doctor =>
    doctor.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const loadDoctors = async () => {
  try {
    let res
    if (departmentId.value) {
      res = await getDoctorsByDepartment(Number(departmentId.value))
    } else {
      res = await getDoctorList()
    }
    doctors.value = res.data?.list || res.data || []
  } catch (error) {
    console.error('加载医生列表失败', error)
  }
}

const handleDoctorClick = (doctor: any) => {
  router.push({
    path: '/appointment/booking',
    query: {
      doctorId: doctor.id,
      doctorName: doctor.name,
      departmentId: departmentId.value
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

.doctor-list {
  padding: 10px 15px;
}

.doctor-card {
  display: flex;
  gap: 12px;
  align-items: center;
  background-color: #fff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.doctor-card:active {
  transform: scale(0.98);
}

.doctor-info {
  flex: 1;
}

.doctor-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.doctor-title {
  margin: 0 0 5px 0;
  font-size: 13px;
  color: #666;
}

.doctor-specialty {
  margin: 0;
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
