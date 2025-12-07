<template>
  <div class="home-page">
    <!-- 顶部搜索栏 -->
    <div class="header-section">
      <div class="header-top">
        <div class="location">
          <n-icon :component="LocationOutline" :size="16" />
          <span>智慧医疗中心</span>
        </div>
        <div class="header-icons">
          <n-badge :value="unreadCount" :max="99" :show="unreadCount > 0">
            <n-icon :component="NotificationsOutline" :size="22" @click="router.push('/message')" />
          </n-badge>
        </div>
      </div>
      <div class="search-bar" @click="router.push('/appointment/departments')">
        <n-icon :component="SearchOutline" :size="18" />
        <span>搜索科室、医生、疾病</span>
      </div>
    </div>

    <!-- 轮播图 -->
    <div class="banner-section">
      <n-carousel autoplay :interval="4000" dot-type="line" draggable>
        <div v-for="(banner, index) in banners" :key="index" class="banner-item" :style="{ background: banner.gradient }">
          <div class="banner-content">
            <h2>{{ banner.title }}</h2>
            <p>{{ banner.subtitle }}</p>
          </div>
          <div class="banner-icon">
            <n-icon :component="banner.icon" :size="80" />
          </div>
        </div>
      </n-carousel>
    </div>

    <!-- 快捷服务 -->
    <div class="quick-services">
      <div
        v-for="item in quickServices"
        :key="item.path"
        class="service-item"
        @click="router.push(item.path)"
      >
        <div class="service-icon" :style="{ background: item.bgColor }">
          <n-icon :component="item.icon" :size="24" color="#fff" />
        </div>
        <span>{{ item.label }}</span>
      </div>
    </div>

    <!-- 热门科室 -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">
          <div class="title-icon"></div>
          <h3>热门科室</h3>
        </div>
        <span class="more" @click="router.push('/appointment/departments')">
          全部科室 <n-icon :component="ChevronForward" :size="14" />
        </span>
      </div>
      <div class="department-grid" v-if="departments.length > 0">
        <div
          v-for="(dept, index) in departments"
          :key="dept.id"
          class="dept-card"
          @click="handleDepartmentClick(dept)"
        >
          <div class="dept-icon" :style="{ background: deptColors[index % 8].bg }">
            <n-icon :component="deptIcons[index % 8]" :size="24" :color="deptColors[index % 8].color" />
          </div>
          <div class="dept-info">
            <h4>{{ dept.name }}</h4>
            <p>{{ dept.doctorCount || 0 }}位医生</p>
          </div>
        </div>
      </div>
      <div class="empty-placeholder" v-else>
        <n-icon :component="MedicalOutline" :size="40" color="#ddd" />
        <p>暂无科室数据</p>
      </div>
    </div>

    <!-- 推荐医生 -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">
          <div class="title-icon" style="background: #2080f0"></div>
          <h3>推荐医生</h3>
        </div>
        <span class="more" @click="router.push('/appointment/doctors')">
          更多医生 <n-icon :component="ChevronForward" :size="14" />
        </span>
      </div>
      <div class="doctor-scroll" v-if="doctors.length > 0">
        <div
          v-for="doctor in doctors"
          :key="doctor.id"
          class="doctor-card"
          @click="handleDoctorClick(doctor)"
        >
          <div class="doctor-avatar">
            <n-avatar :size="56" :src="doctor.avatar" round />
            <div class="doctor-badge" v-if="doctor.title?.includes('主任')">专家</div>
          </div>
          <h4>{{ doctor.name }}</h4>
          <p class="doctor-title">{{ doctor.title }}</p>
          <p class="doctor-dept">{{ doctor.department }}</p>
          <div class="doctor-specialty">
            <n-tag size="small" :bordered="false" type="success">
              {{ doctor.specialty?.split('、')[0] || '专业诊疗' }}
            </n-tag>
          </div>
        </div>
      </div>
      <div class="empty-placeholder" v-else>
        <n-icon :component="PeopleOutline" :size="40" color="#ddd" />
        <p>暂无推荐医生</p>
      </div>
    </div>

    <!-- 健康资讯 -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">
          <div class="title-icon" style="background: #f0a020"></div>
          <h3>健康资讯</h3>
        </div>
      </div>
      <div class="news-list" v-if="newsList.length > 0">
        <div
          v-for="(news, index) in newsList"
          :key="news.id"
          class="news-card"
          @click="handleNewsClick(news)"
        >
          <div class="news-cover" :style="{ background: newsColors[index % 3] }">
            <n-icon :component="NewspaperOutline" :size="32" color="rgba(255,255,255,0.8)" />
          </div>
          <div class="news-info">
            <h4>{{ news.title }}</h4>
            <p>{{ news.summary }}</p>
            <div class="news-meta">
              <span><n-icon :component="TimeOutline" :size="12" /> {{ news.publishTime }}</span>
              <span v-if="news.isTop" class="top-tag">置顶</span>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-placeholder" v-else>
        <n-icon :component="NewspaperOutline" :size="40" color="#ddd" />
        <p>暂无资讯</p>
      </div>
    </div>

    <!-- 底部服务 -->
    <div class="bottom-services">
      <div class="service-card" @click="router.push('/payment')">
        <div class="service-left">
          <n-icon :component="WalletOutline" :size="32" color="#18a058" />
        </div>
        <div class="service-right">
          <h4>便捷缴费</h4>
          <p>在线支付，快速便捷</p>
        </div>
      </div>
      <div class="service-card" @click="router.push('/medical-records')">
        <div class="service-left">
          <n-icon :component="DocumentTextOutline" :size="32" color="#2080f0" />
        </div>
        <div class="service-right">
          <h4>电子病历</h4>
          <p>随时查看诊疗记录</p>
        </div>
      </div>
    </div>

    <!-- 底部安全间距 -->
    <div class="bottom-safe"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NCarousel, NIcon, NAvatar, NTag, NBadge } from 'naive-ui'
import {
  CalendarOutline,
  DocumentTextOutline,
  MedicalOutline,
  CardOutline,
  ClipboardOutline,
  ChevronForward,
  LocationOutline,
  SearchOutline,
  NotificationsOutline,
  HeartOutline,
  PeopleOutline,
  NewspaperOutline,
  TimeOutline,
  WalletOutline,
  PulseOutline,
  EyeOutline,
  BodyOutline,
  FitnessOutline,
  BandageOutline,
  ThermometerOutline,
  NutritionOutline
} from '@vicons/ionicons5'
import { getDepartmentList, getRecommendedDoctors, getNewsList, getUnreadCount } from '@/api'

const router = useRouter()

// 未读消息数
const unreadCount = ref(0)

// 轮播图数据
const banners = ref([
  {
    title: '智慧医疗',
    subtitle: '专业医疗服务 · 贴心健康守护',
    gradient: 'linear-gradient(135deg, #18a058 0%, #36ad6a 100%)',
    icon: HeartOutline
  },
  {
    title: '在线预约',
    subtitle: '随时随地 · 轻松挂号',
    gradient: 'linear-gradient(135deg, #2080f0 0%, #36a2eb 100%)',
    icon: CalendarOutline
  },
  {
    title: '健康管理',
    subtitle: '科学养生 · 健康生活',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    icon: PulseOutline
  }
])

// 快捷服务
const quickServices = [
  { label: '预约挂号', path: '/appointment/departments', icon: CalendarOutline, bgColor: 'linear-gradient(135deg, #18a058, #36ad6a)' },
  { label: '我的挂号', path: '/my-appointments', icon: ClipboardOutline, bgColor: 'linear-gradient(135deg, #2080f0, #36a2eb)' },
  { label: '检查报告', path: '/examination', icon: DocumentTextOutline, bgColor: 'linear-gradient(135deg, #f0a020, #ffc107)' },
  { label: '缴费记录', path: '/payment', icon: CardOutline, bgColor: 'linear-gradient(135deg, #d03050, #f43f5e)' }
]

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

// 新闻颜色
const newsColors = [
  'linear-gradient(135deg, #18a058, #36ad6a)',
  'linear-gradient(135deg, #2080f0, #36a2eb)',
  'linear-gradient(135deg, #f0a020, #ffc107)'
]

// 科室列表
const departments = ref<any[]>([])

// 推荐医生
const doctors = ref<any[]>([])

// 新闻列表
const newsList = ref<any[]>([])

// 生成医生头像SVG
const generateAvatarSvg = (name: string, index: number) => {
  const initial = name?.[0] || '医'
  const colors = ['#18a058', '#2080f0', '#7c3aed', '#f0a020']
  const color = colors[index % 4]
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${color}"/><stop offset="100%" style="stop-color:${color}99"/></linearGradient></defs><circle cx="30" cy="30" r="30" fill="url(#g)"/><text x="30" y="38" font-size="24" fill="#fff" text-anchor="middle" font-family="sans-serif" font-weight="500">${initial}</text></svg>`)}`
}

// 加载科室列表
const loadDepartments = async () => {
  try {
    const res = await getDepartmentList({ limit: 8, page: 1 })
    const list = res?.list || res?.data?.list || res?.data || []
    departments.value = Array.isArray(list) ? list : []
  } catch (error) {
    console.error('加载科室列表失败', error)
    // 使用默认数据展示
    departments.value = [
      { id: 1, name: '心内科', doctorCount: 8 },
      { id: 2, name: '呼吸内科', doctorCount: 6 },
      { id: 3, name: '消化内科', doctorCount: 5 },
      { id: 4, name: '神经内科', doctorCount: 7 },
      { id: 5, name: '骨科', doctorCount: 9 },
      { id: 6, name: '妇产科', doctorCount: 10 },
      { id: 7, name: '儿科', doctorCount: 8 },
      { id: 8, name: '眼科', doctorCount: 4 }
    ]
  }
}

// 加载推荐医生
const loadDoctors = async () => {
  try {
    const res = await getRecommendedDoctors(4)
    const list = res?.list || res?.data?.list || res?.data || []
    doctors.value = (Array.isArray(list) ? list : []).map((item: any, index: number) => ({
      ...item,
      department: item.department?.name || '',
      avatar: item.avatar || generateAvatarSvg(item.name, index)
    }))
  } catch (error) {
    console.error('加载推荐医生失败', error)
    // 使用默认数据展示
    doctors.value = [
      { id: 1, name: '张明', title: '主任医师', department: '心内科', specialty: '冠心病、高血压', avatar: generateAvatarSvg('张', 0) },
      { id: 2, name: '李华', title: '副主任医师', department: '呼吸内科', specialty: '哮喘、肺癌', avatar: generateAvatarSvg('李', 1) },
      { id: 3, name: '王强', title: '主任医师', department: '骨科', specialty: '关节置换', avatar: generateAvatarSvg('王', 2) },
      { id: 4, name: '赵雪', title: '副主任医师', department: '妇科', specialty: '妇科肿瘤', avatar: generateAvatarSvg('赵', 3) }
    ]
  }
}

// 加载新闻列表
const loadNews = async () => {
  try {
    const res = await getNewsList({ limit: 3, page: 1 })
    const list = res?.list || res?.data?.list || res?.data || []
    newsList.value = (Array.isArray(list) ? list : []).map((item: any) => ({
      ...item,
      publishTime: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '最新'
    }))
  } catch (error) {
    console.error('加载新闻列表失败', error)
    // 使用默认数据展示
    newsList.value = [
      { id: 1, title: '我院引进最新CT设备', summary: '为提升诊疗水平，我院引进最新设备', publishTime: '2024-01-15', isTop: true },
      { id: 2, title: '春季养生小贴士', summary: '春季养生注意事项，健康生活从细节开始', publishTime: '2024-01-10' },
      { id: 3, title: '专家义诊活动通知', summary: '本周末将举行大型专家义诊活动', publishTime: '2024-01-08' }
    ]
  }
}

// 加载未读消息数
const loadUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    unreadCount.value = res?.count || res?.data?.count || 0
  } catch (error) {
    // 忽略错误
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
  console.log('查看新闻', news)
}

onMounted(() => {
  loadDepartments()
  loadDoctors()
  loadNews()
  loadUnreadCount()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8faf9 0%, #f0f2f5 100%);
  padding-bottom: 70px;
}

/* 顶部搜索栏 */
.header-section {
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
  padding: 12px 16px 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.location {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  font-size: 14px;
}

.header-icons {
  color: #fff;
  cursor: pointer;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 10px 16px;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 轮播图 */
.banner-section {
  margin: 12px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.banner-item {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  color: #fff;
}

.banner-content h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.banner-content p {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

.banner-icon {
  opacity: 0.3;
}

/* 快捷服务 */
.quick-services {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 16px;
  background: #fff;
  margin: 0 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.service-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.service-item:active .service-icon {
  transform: scale(0.95);
}

.service-item span {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

/* 通用区块样式 */
.section {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  width: 4px;
  height: 16px;
  background: #18a058;
  border-radius: 2px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.more {
  font-size: 13px;
  color: #18a058;
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

/* 科室网格 */
.department-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.dept-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s;
}

.dept-card:active {
  background: #f5f5f5;
  transform: scale(0.98);
}

.dept-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dept-info {
  text-align: center;
}

.dept-info h4 {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin: 0 0 2px 0;
}

.dept-info p {
  font-size: 11px;
  color: #999;
  margin: 0;
}

/* 医生横向滚动 */
.doctor-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

.doctor-scroll::-webkit-scrollbar {
  display: none;
}

.doctor-card {
  flex-shrink: 0;
  width: 110px;
  background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #f0f0f0;
}

.doctor-card:active {
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.doctor-avatar {
  position: relative;
  display: inline-block;
  margin-bottom: 8px;
}

.doctor-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: linear-gradient(135deg, #f0a020, #ffc107);
  color: #fff;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
}

.doctor-card h4 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.doctor-title {
  font-size: 11px;
  color: #18a058;
  margin: 0 0 2px 0;
}

.doctor-dept {
  font-size: 11px;
  color: #999;
  margin: 0 0 8px 0;
}

.doctor-specialty {
  margin-top: 4px;
}

/* 新闻列表 */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.news-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fafbfc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.news-card:active {
  background: #f0f2f5;
}

.news-cover {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.news-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.news-info h4 {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-info p {
  font-size: 12px;
  color: #666;
  margin: 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #999;
}

.news-meta span {
  display: flex;
  align-items: center;
  gap: 3px;
}

.top-tag {
  background: #fff1f0;
  color: #ff4d4f;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
}

/* 底部服务卡片 */
.bottom-services {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 12px;
  margin-top: 12px;
}

.service-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
}

.service-card:active {
  transform: scale(0.98);
}

.service-right h4 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.service-right p {
  font-size: 11px;
  color: #999;
  margin: 0;
}

/* 空状态 */
.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  color: #ccc;
}

.empty-placeholder p {
  margin: 10px 0 0 0;
  font-size: 13px;
}

/* 底部安全间距 */
.bottom-safe {
  height: 20px;
}
</style>
