<template>
  <div class="home-page">
    <!-- 顶部轮播 -->
    <div class="banner-section">
      <n-carousel autoplay show-arrow>
        <img
          v-for="(banner, index) in banners"
          :key="index"
          class="carousel-img"
          :src="banner"
        />
      </n-carousel>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-access">
      <div
        v-for="item in quickAccess"
        :key="item.path"
        class="quick-item"
        @click="router.push(item.path)"
      >
        <n-icon :size="32" :color="item.color" :component="item.icon" />
        <span>{{ item.label }}</span>
      </div>
    </div>

    <!-- 科室导航 -->
    <div class="section">
      <div class="section-header">
        <h3>热门科室</h3>
        <span class="more" @click="router.push('/appointment/departments')">
          更多 <n-icon :component="ChevronForward" />
        </span>
      </div>
      <div class="department-grid">
        <div
          v-for="dept in departments"
          :key="dept.id"
          class="department-item"
          @click="handleDepartmentClick(dept)"
        >
          <n-icon :size="28" :color="dept.color" :component="MedicalOutline" />
          <span>{{ dept.name }}</span>
        </div>
      </div>
    </div>

    <!-- 推荐医生 -->
    <div class="section">
      <div class="section-header">
        <h3>推荐医生</h3>
        <span class="more" @click="router.push('/appointment/doctors')">
          更多 <n-icon :component="ChevronForward" />
        </span>
      </div>
      <div class="doctor-list">
        <div
          v-for="doctor in doctors"
          :key="doctor.id"
          class="doctor-card"
          @click="handleDoctorClick(doctor)"
        >
          <n-avatar :size="60" :src="doctor.avatar" />
          <div class="doctor-info">
            <h4>{{ doctor.name }}</h4>
            <p class="doctor-title">{{ doctor.title }} | {{ doctor.department }}</p>
            <p class="doctor-desc">{{ doctor.specialty }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 医疗资讯 -->
    <div class="section">
      <div class="section-header">
        <h3>医疗资讯</h3>
      </div>
      <div class="news-list">
        <div
          v-for="news in newsList"
          :key="news.id"
          class="news-item"
          @click="handleNewsClick(news)"
        >
          <img :src="news.cover" class="news-cover" />
          <div class="news-content">
            <h4>{{ news.title }}</h4>
            <p class="news-desc">{{ news.summary }}</p>
            <span class="news-time">{{ news.publishTime }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NCarousel, NIcon, NAvatar } from 'naive-ui'
import {
  CalendarOutline,
  DocumentTextOutline,
  MedicalOutline,
  CardOutline,
  ClipboardOutline,
  ChevronForward
} from '@vicons/ionicons5'
import { getDepartmentList, getRecommendedDoctors, getNewsList } from '@/api'

const router = useRouter()

// 轮播图
const banners = ref([
  'https://via.placeholder.com/750x300/18A058/fff?text=Banner+1',
  'https://via.placeholder.com/750x300/36AD6A/fff?text=Banner+2',
  'https://via.placeholder.com/750x300/0C7A43/fff?text=Banner+3'
])

// 快捷入口
const quickAccess = [
  { label: '预约挂号', path: '/appointment/departments', icon: CalendarOutline, color: '#18a058' },
  { label: '我的挂号', path: '/my-appointments', icon: DocumentTextOutline, color: '#2080f0' },
  { label: '我的病历', path: '/medical-records', icon: ClipboardOutline, color: '#f0a020' },
  { label: '缴费中心', path: '/payment', icon: CardOutline, color: '#d03050' }
]

// 科室列表
const departments = ref<any[]>([])

// 推荐医生
const doctors = ref<any[]>([])

// 新闻列表
const newsList = ref<any[]>([])

// 加载科室列表
const loadDepartments = async () => {
  try {
    const res = await getDepartmentList({ limit: 8 })
    departments.value = (res.data?.list || res.data || []).map((item: any, index: number) => ({
      ...item,
      color: ['#18a058', '#2080f0', '#f0a020', '#d03050', '#18a058', '#2080f0', '#f0a020', '#d03050'][index % 8]
    }))
  } catch (error) {
    console.error('加载科室列表失败', error)
  }
}

// 加载推荐医生
const loadDoctors = async () => {
  try {
    const res = await getRecommendedDoctors(4)
    doctors.value = res.data?.list || res.data || []
  } catch (error) {
    console.error('加载推荐医生失败', error)
  }
}

// 加载新闻列表
const loadNews = async () => {
  try {
    const res = await getNewsList({ limit: 5 })
    newsList.value = res.data?.list || res.data || []
  } catch (error) {
    console.error('加载新闻列表失败', error)
  }
}

// 点击科室
const handleDepartmentClick = (dept: any) => {
  router.push({
    path: '/appointment/doctors',
    query: { departmentId: dept.id }
  })
}

// 点击医生
const handleDoctorClick = (doctor: any) => {
  router.push({
    path: '/appointment/booking',
    query: { doctorId: doctor.id }
  })
}

// 点击新闻
const handleNewsClick = (news: any) => {
  // 可以跳转到新闻详情页
  console.log('查看新闻', news)
}

onMounted(() => {
  loadDepartments()
  loadDoctors()
  loadNews()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;
}

.banner-section {
  width: 100%;
  height: 180px;
  background-color: #fff;
}

.carousel-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.quick-access {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  background-color: #fff;
  padding: 20px 0;
  margin-bottom: 10px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.quick-item:active {
  transform: scale(0.95);
}

.quick-item span {
  font-size: 13px;
  color: #333;
}

.section {
  background-color: #fff;
  margin-bottom: 10px;
  padding: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.more {
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

.department-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.department-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}

.department-item:active {
  transform: scale(0.95);
}

.department-item span {
  font-size: 13px;
  color: #333;
}

.doctor-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.doctor-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.doctor-card:active {
  background-color: #f0f0f0;
}

.doctor-info {
  flex: 1;
}

.doctor-info h4 {
  margin: 0 0 5px 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.doctor-title {
  margin: 0 0 5px 0;
  font-size: 12px;
  color: #666;
}

.doctor-desc {
  margin: 0;
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.news-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
}

.news-cover {
  width: 100px;
  height: 70px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.news-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.news-content h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.news-desc {
  margin: 0;
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-time {
  font-size: 11px;
  color: #ccc;
}
</style>
