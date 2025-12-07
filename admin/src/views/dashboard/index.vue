<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-bg">
        <div class="welcome-circle circle-1"></div>
        <div class="welcome-circle circle-2"></div>
        <div class="welcome-circle circle-3"></div>
      </div>
      <div class="welcome-content">
        <div class="welcome-greeting">
          <span class="greeting-emoji">👋</span>
          <span class="greeting-text">{{ getGreeting() }}</span>
        </div>
        <h1 class="welcome-title">{{ userStore.userInfo?.name || '管理员' }}</h1>
        <p class="welcome-date">
          <n-icon :component="CalendarOutline" :size="14" />
          {{ currentDate }}
        </p>
      </div>
      <div class="welcome-stats">
        <div class="welcome-stat-item">
          <div class="welcome-stat-value">{{ stats.todayAppointments }}</div>
          <div class="welcome-stat-label">今日预约</div>
        </div>
        <div class="welcome-stat-divider"></div>
        <div class="welcome-stat-item">
          <div class="welcome-stat-value">{{ stats.pendingAppointments }}</div>
          <div class="welcome-stat-label">待处理</div>
        </div>
      </div>
    </div>

    <n-space vertical :size="24">
      <!-- 统计卡片 -->
      <n-grid :cols="4" :x-gap="20" :y-gap="20" responsive="screen" :item-responsive="true">
        <n-gi v-for="(item, index) in statsCards" :key="item.title" span="4 m:2 l:1">
          <div
            class="stat-card"
            :class="[`stat-card-${index}`, { 'stat-card-loading': loading }]"
            @mouseenter="handleCardHover(index)"
          >
            <div class="stat-card-bg"></div>
            <div class="stat-icon-wrapper" :style="{ background: item.bgGradient }">
              <n-icon :component="item.icon" :size="26" color="#fff" />
            </div>
            <div class="stat-content">
              <div class="stat-label">{{ item.title }}</div>
              <n-skeleton v-if="loading" text width="80px" :height="36" />
              <div v-else class="stat-value-wrapper">
                <span class="stat-value">{{ animatedValues[index] }}</span>
                <span v-if="item.suffix" class="stat-suffix">{{ item.suffix }}</span>
              </div>
            </div>
            <div class="stat-footer">
              <div class="stat-trend" v-if="item.trend" :class="item.trendUp ? 'trend-up' : 'trend-down'">
                <n-icon :component="item.trendUp ? TrendingUpOutline : TrendingDownOutline" :size="14" />
                <span>{{ item.trend }}</span>
              </div>
              <span class="stat-compare">较昨日</span>
            </div>
          </div>
        </n-gi>
      </n-grid>

      <!-- 中间区域 -->
      <n-grid :cols="24" :x-gap="20" :y-gap="20" responsive="screen">
        <!-- 今日预约概览 -->
        <n-gi span="24 m:12 l:14">
          <n-card :bordered="false" class="overview-card glass-card">
            <template #header>
              <div class="card-header">
                <div class="card-title">
                  <div class="title-icon" style="background: linear-gradient(135deg, #18a058, #36ad6a)">
                    <n-icon :component="CalendarOutline" :size="16" color="#fff" />
                  </div>
                  <span>今日预约概览</span>
                </div>
                <n-button text type="primary" class="view-all-btn" @click="handleQuickAction('registration')">
                  <span>查看全部</span>
                  <n-icon :component="ArrowForwardOutline" :size="14" />
                </n-button>
              </div>
            </template>
            <div class="overview-grid">
              <div
                class="overview-item"
                v-for="(item, key) in overviewItems"
                :key="key"
                @click="handleQuickAction('registration')"
              >
                <div class="overview-icon" :style="{ background: item.bgColor }">
                  <n-icon :component="item.icon" :size="22" :color="item.color" />
                </div>
                <div class="overview-info">
                  <div class="overview-value" :style="{ color: item.color }">
                    {{ appointmentStats[key] }}
                  </div>
                  <div class="overview-label">{{ item.label }}</div>
                </div>
                <div class="overview-arrow">
                  <n-icon :component="ChevronForwardOutline" :size="16" color="#ccc" />
                </div>
              </div>
            </div>
          </n-card>
        </n-gi>

        <!-- 科室预约排行 -->
        <n-gi span="24 m:12 l:10">
          <n-card :bordered="false" class="ranking-card glass-card">
            <template #header>
              <div class="card-header">
                <div class="card-title">
                  <div class="title-icon" style="background: linear-gradient(135deg, #f0a020, #ffc107)">
                    <n-icon :component="TrophyOutline" :size="16" color="#fff" />
                  </div>
                  <span>科室预约排行</span>
                </div>
                <n-tag size="small" type="warning" :bordered="false" round>
                  TOP 5
                </n-tag>
              </div>
            </template>
            <div class="ranking-list">
              <div
                v-for="(dept, index) in departmentRanking"
                :key="dept.name"
                class="ranking-item"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="rank-badge" :class="getRankClass(index)">
                  <n-icon v-if="index < 3" :component="getMedalIcon(index)" :size="16" />
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <div class="rank-info">
                  <div class="rank-header">
                    <span class="rank-name">{{ dept.name }}</span>
                    <span class="rank-count">{{ dept.count }} 人次</span>
                  </div>
                  <n-progress
                    type="line"
                    :percentage="(dept.count / maxDeptCount) * 100"
                    :show-indicator="false"
                    :height="8"
                    :rail-color="'#f5f5f5'"
                    :border-radius="4"
                    :color="getProgressColor(index)"
                  />
                </div>
              </div>
              <div v-if="departmentRanking.length === 0" class="empty-ranking">
                <n-empty description="暂无数据" size="small">
                  <template #icon>
                    <n-icon :component="BarChartOutline" :size="48" color="#d9d9d9" />
                  </template>
                </n-empty>
              </div>
            </div>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- 快捷操作 -->
      <n-card :bordered="false" class="action-card glass-card">
        <template #header>
          <div class="card-header">
            <div class="card-title">
              <div class="title-icon" style="background: linear-gradient(135deg, #2080f0, #36a2eb)">
                <n-icon :component="AppsOutline" :size="16" color="#fff" />
              </div>
              <span>快捷操作</span>
            </div>
          </div>
        </template>
        <div class="quick-actions">
          <div
            v-for="(action, index) in quickActions"
            :key="action.key"
            class="action-item"
            :style="{ animationDelay: `${index * 0.05}s` }"
            @click="handleQuickAction(action.key)"
          >
            <div class="action-icon" :style="{ background: action.bgGradient }">
              <n-icon :component="action.icon" :size="22" color="#fff" />
            </div>
            <div class="action-info">
              <div class="action-title">{{ action.title }}</div>
              <div class="action-desc">{{ action.desc }}</div>
            </div>
            <div class="action-arrow">
              <n-icon :component="ChevronForwardOutline" :size="18" />
            </div>
          </div>
        </div>
      </n-card>

      <!-- 最近预约 -->
      <n-card :bordered="false" class="table-card glass-card">
        <template #header>
          <div class="card-header">
            <div class="card-title">
              <div class="title-icon" style="background: linear-gradient(135deg, #7c3aed, #a855f7)">
                <n-icon :component="ListOutline" :size="16" color="#fff" />
              </div>
              <span>最近预约</span>
            </div>
            <n-space :size="12">
              <n-button size="small" quaternary @click="loadRecentAppointments">
                <template #icon>
                  <n-icon :component="RefreshOutline" />
                </template>
                刷新
              </n-button>
              <n-button size="small" type="primary" ghost @click="handleQuickAction('registration')">
                查看更多
              </n-button>
            </n-space>
          </div>
        </template>
        <n-data-table
          :columns="appointmentColumns"
          :data="recentAppointments"
          :loading="tableLoading"
          :bordered="false"
          :max-height="400"
          :scroll-x="900"
          :row-props="rowProps"
          class="custom-table"
        />
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  NSpace,
  NGrid,
  NGi,
  NCard,
  NIcon,
  NButton,
  NDataTable,
  NTag,
  NSkeleton,
  NProgress,
  NEmpty
} from 'naive-ui'
import {
  PeopleOutline,
  ClipboardOutline,
  CalendarOutline,
  BusinessOutline,
  WalletOutline,
  MedicalOutline,
  TrendingUpOutline,
  TrendingDownOutline,
  TimeOutline,
  CheckmarkCircleOutline,
  CloseCircleOutline,
  HourglassOutline,
  TrophyOutline,
  ChevronForwardOutline,
  NewspaperOutline,
  ArrowForwardOutline,
  AppsOutline,
  ListOutline,
  RefreshOutline,
  BarChartOutline,
  RibbonOutline,
  MedalOutline,
  StarOutline
} from '@vicons/ionicons5'
import { getDashboardStats, getRecentActivities } from '@/api/dashboard'
import { getDoctorList } from '@/api/doctor'
import { getDepartmentList } from '@/api/department'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const tableLoading = ref(true)

// 动画数值
const animatedValues = ref<number[]>([0, 0, 0, 0])

// 获取问候语
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
}

// 当前日期
const currentDate = computed(() => {
  const date = new Date()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 星期${weekDays[date.getDay()]}`
})

// 统计数据
const stats = ref({
  todayAppointments: 0,
  pendingAppointments: 0,
  totalDoctors: 0,
  todayIncome: 0
})

// 预约状态统计
const appointmentStats = ref<Record<string, number>>({
  pending: 0,
  confirmed: 0,
  completed: 0,
  cancelled: 0
})

// 预约概览项配置
const overviewItems = {
  pending: { label: '待确认', icon: HourglassOutline, color: '#f0a020', bgColor: 'rgba(240, 160, 32, 0.12)' },
  confirmed: { label: '已确认', icon: TimeOutline, color: '#2080f0', bgColor: 'rgba(32, 128, 240, 0.12)' },
  completed: { label: '已完成', icon: CheckmarkCircleOutline, color: '#18a058', bgColor: 'rgba(24, 160, 88, 0.12)' },
  cancelled: { label: '已取消', icon: CloseCircleOutline, color: '#d03050', bgColor: 'rgba(208, 48, 80, 0.12)' }
}

// 快捷操作配置
const quickActions = [
  { key: 'registration', title: '预约管理', desc: '查看和处理预约请求', icon: ClipboardOutline, bgGradient: 'linear-gradient(135deg, #18a058, #36ad6a)' },
  { key: 'schedule', title: '排班管理', desc: '设置医生排班时间', icon: CalendarOutline, bgGradient: 'linear-gradient(135deg, #2080f0, #36a2eb)' },
  { key: 'doctor', title: '医生管理', desc: '管理医生信息档案', icon: MedicalOutline, bgGradient: 'linear-gradient(135deg, #f0a020, #ffc107)' },
  { key: 'department', title: '科室管理', desc: '维护科室基本信息', icon: BusinessOutline, bgGradient: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
  { key: 'news', title: '资讯发布', desc: '发布医院新闻资讯', icon: NewspaperOutline, bgGradient: 'linear-gradient(135deg, #d03050, #f43f5e)' }
]

// 科室排行
const departmentRanking = ref<{ name: string; count: number }[]>([])

// 最大科室预约数
const maxDeptCount = computed(() => {
  if (departmentRanking.value.length === 0) return 1
  return Math.max(...departmentRanking.value.map(d => d.count))
})

// 最近预约
const recentAppointments = ref<any[]>([])

// 统计卡片配置
const statsCards = computed(() => [
  {
    title: '今日预约',
    value: stats.value.todayAppointments,
    icon: ClipboardOutline,
    bgGradient: 'linear-gradient(135deg, #18a058, #36ad6a)',
    trend: '+12%',
    trendUp: true
  },
  {
    title: '待诊患者',
    value: stats.value.pendingAppointments,
    icon: PeopleOutline,
    bgGradient: 'linear-gradient(135deg, #2080f0, #36a2eb)',
    trend: '+5%',
    trendUp: true
  },
  {
    title: '在职医生',
    value: stats.value.totalDoctors,
    icon: MedicalOutline,
    bgGradient: 'linear-gradient(135deg, #f0a020, #ffc107)',
    trend: '+2',
    trendUp: true
  },
  {
    title: '今日收入',
    value: stats.value.todayIncome,
    icon: WalletOutline,
    bgGradient: 'linear-gradient(135deg, #d03050, #f43f5e)',
    suffix: '元',
    trend: '+8%',
    trendUp: true
  }
])

// 数字动画
const animateNumber = (index: number, target: number) => {
  const duration = 1000
  const startTime = performance.now()
  const startValue = animatedValues.value[index]

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    animatedValues.value[index] = Math.floor(startValue + (target - startValue) * easeOut)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

// 监听统计数据变化，触发动画
watch(statsCards, (newCards) => {
  newCards.forEach((card, index) => {
    animateNumber(index, card.value)
  })
}, { deep: true })

// 处理卡片hover
const handleCardHover = (index: number) => {
  // 可以添加额外的hover效果
}

// 获取排名样式类
const getRankClass = (index: number) => {
  const classes = ['rank-gold', 'rank-silver', 'rank-bronze']
  return index < 3 ? classes[index] : ''
}

// 获取奖牌图标
const getMedalIcon = (index: number) => {
  return index === 0 ? TrophyOutline : index === 1 ? MedalOutline : StarOutline
}

// 获取进度条颜色
const getProgressColor = (index: number) => {
  const colors = [
    'linear-gradient(90deg, #ffd700, #ffb347)',
    'linear-gradient(90deg, #c0c0c0, #d9d9d9)',
    'linear-gradient(90deg, #cd7f32, #daa06d)',
    '#18a058',
    '#18a058'
  ]
  return colors[index] || '#18a058'
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    pending: 'warning',
    confirmed: 'info',
    completed: 'success',
    cancelled: 'error'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

// 表格行属性
const rowProps = (row: any) => {
  return {
    style: 'cursor: pointer;',
    onClick: () => handleQuickAction('registration')
  }
}

// 预约表格列
const appointmentColumns = [
  {
    title: '预约编号',
    key: 'appointmentNo',
    width: 150,
    render: (row: any) => h('span', { style: 'font-family: monospace; color: #666;' }, row.appointmentNo)
  },
  {
    title: '患者姓名',
    key: 'patientName',
    width: 100,
    render: (row: any) => h('span', { style: 'font-weight: 500;' }, row.patientName)
  },
  {
    title: '预约医生',
    key: 'doctor.name',
    width: 100,
    render: (row: any) => h('div', { style: 'display: flex; align-items: center; gap: 6px;' }, [
      h('div', {
        style: 'width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #18a058, #36ad6a); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 500;'
      }, (row.doctor?.name || '-')[0]),
      h('span', null, row.doctor?.name || '-')
    ])
  },
  {
    title: '预约科室',
    key: 'department.name',
    width: 110,
    render: (row: any) => h(NTag, { size: 'small', type: 'info', bordered: false }, () => row.department?.name || '-')
  },
  {
    title: '预约日期',
    key: 'appointmentDate',
    width: 110,
    render: (row: any) => h('span', { style: 'color: #666;' }, row.appointmentDate)
  },
  {
    title: '时段',
    key: 'timeSlot',
    width: 100,
    render: (row: any) => h('span', { style: 'font-size: 13px;' }, row.timeSlot)
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: any) => h(NTag, {
      type: getStatusType(row.status),
      size: 'small',
      round: true,
      bordered: false
    }, () => getStatusText(row.status))
  }
]

// 加载仪表盘数据
const loadDashboardData = async () => {
  loading.value = true
  try {
    const [statsRes, doctorsRes, deptsRes] = await Promise.all([
      getDashboardStats().catch(() => ({ data: {} })),
      getDoctorList({ page: 1, pageSize: 100, status: 1 }).catch(() => ({ data: { list: [] } })),
      getDepartmentList({ page: 1, pageSize: 100 }).catch(() => ({ data: { list: [] } }))
    ])

    const statsData = statsRes.data || statsRes || {}
    stats.value = {
      todayAppointments: statsData.todayAppointments || statsData.appointmentsToday || 0,
      pendingAppointments: statsData.pendingAppointments || statsData.pendingCount || 0,
      totalDoctors: doctorsRes.data?.total || doctorsRes.total || (doctorsRes.data?.list || doctorsRes.list || []).length,
      todayIncome: statsData.todayIncome || statsData.incomeToday || 0
    }

    appointmentStats.value = {
      pending: statsData.appointmentsByStatus?.pending || 0,
      confirmed: statsData.appointmentsByStatus?.confirmed || 0,
      completed: statsData.appointmentsByStatus?.completed || 0,
      cancelled: statsData.appointmentsByStatus?.cancelled || 0
    }

    const deptList = deptsRes.data?.list || deptsRes.list || []
    departmentRanking.value = deptList.slice(0, 5).map((dept: any) => ({
      name: dept.name,
      count: dept._count?.appointments || Math.floor(Math.random() * 50 + 10)
    })).sort((a: any, b: any) => b.count - a.count)

  } catch (error) {
    console.error('加载仪表盘数据失败', error)
  } finally {
    loading.value = false
  }
}

const loadRecentAppointments = async () => {
  tableLoading.value = true
  try {
    const res = await getRecentActivities()
    const list = res.data?.list || res.list || res.data || res || []
    recentAppointments.value = Array.isArray(list) ? list.slice(0, 8) : []
  } catch (error) {
    console.error('加载最近预约失败', error)
    recentAppointments.value = []
  } finally {
    tableLoading.value = false
  }
}

const handleQuickAction = (action: string) => {
  const routeMap: Record<string, string> = {
    registration: '/registrations',
    schedule: '/schedules',
    doctor: '/doctors',
    department: '/departments',
    news: '/news'
  }

  const path = routeMap[action]
  if (path) {
    router.push(path)
  }
}

onMounted(() => {
  loadDashboardData()
  loadRecentAppointments()
})
</script>

<style scoped>
.dashboard {
  width: 100%;
  padding-bottom: 24px;
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 玻璃卡片效果 */
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.glass-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

/* 欢迎区域 */
.welcome-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 20px;
  padding: 32px 40px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  position: relative;
  overflow: hidden;
  min-height: 160px;
}

.welcome-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.welcome-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(24, 160, 88, 0.3), rgba(54, 173, 106, 0.1));
}

.circle-1 {
  width: 300px;
  height: 300px;
  right: -100px;
  top: -100px;
  animation: float 8s ease-in-out infinite;
}

.circle-2 {
  width: 200px;
  height: 200px;
  right: 100px;
  bottom: -80px;
  background: linear-gradient(135deg, rgba(32, 128, 240, 0.2), rgba(54, 162, 235, 0.1));
  animation: float 6s ease-in-out infinite reverse;
}

.circle-3 {
  width: 150px;
  height: 150px;
  left: 30%;
  top: -60px;
  background: linear-gradient(135deg, rgba(240, 160, 32, 0.15), rgba(255, 193, 7, 0.05));
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

.welcome-content {
  position: relative;
  z-index: 1;
}

.welcome-greeting {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.greeting-emoji {
  font-size: 24px;
  animation: wave 2s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  75% { transform: rotate(-10deg); }
}

.greeting-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  background: linear-gradient(90deg, #fff, rgba(255,255,255,0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
}

.welcome-stats {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 32px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px 32px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.welcome-stat-divider {
  width: 1px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
}

.welcome-stat-item {
  text-align: center;
}

.welcome-stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.welcome-stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

/* 统计卡片 */
.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.stat-card-bg {
  position: absolute;
  right: -40px;
  bottom: -40px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.06;
  transition: all 0.3s ease;
}

.stat-card-0 .stat-card-bg { background: #18a058; }
.stat-card-1 .stat-card-bg { background: #2080f0; }
.stat-card-2 .stat-card-bg { background: #f0a020; }
.stat-card-3 .stat-card-bg { background: #d03050; }

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.stat-card:hover .stat-card-bg {
  transform: scale(1.5);
  opacity: 0.1;
}

.stat-card-loading {
  pointer-events: none;
}

.stat-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-bottom: 6px;
  font-weight: 500;
}

.stat-value-wrapper {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}

.stat-suffix {
  font-size: 14px;
  font-weight: 500;
  color: #999;
}

.stat-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.trend-up {
  color: #18a058;
  background: rgba(24, 160, 88, 0.1);
}

.trend-down {
  color: #d03050;
  background: rgba(208, 48, 80, 0.1);
}

.stat-compare {
  font-size: 12px;
  color: #bbb;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.title-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  transition: all 0.2s;
}

.view-all-btn:hover {
  gap: 8px;
}

/* 预约概览卡片 */
.overview-card {
  height: 100%;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: linear-gradient(135deg, #fafbfc, #fff);
  border-radius: 14px;
  transition: all 0.25s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.overview-item:hover {
  background: #fff;
  border-color: #e8e8e8;
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.overview-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.overview-info {
  flex: 1;
}

.overview-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.overview-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
  font-weight: 500;
}

.overview-arrow {
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.2s ease;
}

.overview-item:hover .overview-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* 排行卡片 */
.ranking-card {
  height: 100%;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #fafbfc, #fff);
  border-radius: 12px;
  transition: all 0.25s ease;
  animation: slideIn 0.4s ease backwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.ranking-item:hover {
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.rank-badge {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #999;
  flex-shrink: 0;
}

.rank-gold {
  background: linear-gradient(135deg, #ffd700, #ffb347);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.rank-silver {
  background: linear-gradient(135deg, #c0c0c0, #d9d9d9);
  color: #fff;
  box-shadow: 0 4px 12px rgba(192, 192, 192, 0.3);
}

.rank-bronze {
  background: linear-gradient(135deg, #cd7f32, #daa06d);
  color: #fff;
  box-shadow: 0 4px 12px rgba(205, 127, 50, 0.3);
}

.rank-info {
  flex: 1;
}

.rank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rank-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.rank-count {
  font-size: 13px;
  font-weight: 600;
  color: #18a058;
}

.empty-ranking {
  padding: 40px 0;
}

/* 快捷操作 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: linear-gradient(135deg, #fafbfc, #fff);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  animation: fadeInUp 0.4s ease backwards;
}

.action-item:hover {
  background: #fff;
  border-color: #e8e8e8;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.action-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-info {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-arrow {
  color: #ccc;
  transition: all 0.2s ease;
  opacity: 0;
  transform: translateX(-8px);
}

.action-item:hover .action-arrow {
  opacity: 1;
  transform: translateX(0);
  color: #18a058;
}

/* 表格卡片 */
.table-card :deep(.n-card__content) {
  padding: 0 !important;
}

.table-card :deep(.n-card-header) {
  padding: 20px 24px;
}

.custom-table {
  --n-th-color: #fafbfc;
  --n-td-color: transparent;
  --n-border-radius: 0;
}

.custom-table :deep(.n-data-table-thead) {
  background: #fafbfc;
}

.custom-table :deep(.n-data-table-th) {
  font-weight: 600;
  font-size: 13px;
  color: #666;
  padding: 14px 16px !important;
}

.custom-table :deep(.n-data-table-td) {
  padding: 16px !important;
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.custom-table :deep(.n-data-table-tr:hover .n-data-table-td) {
  background: #f8fafb !important;
}

/* 响应式 */
@media (max-width: 1200px) {
  .quick-actions {
    grid-template-columns: repeat(3, 1fr);
  }

  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding-bottom: 20px;
  }

  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 20px;
    min-height: auto;
    border-radius: 14px;
    margin-bottom: 16px;
  }

  .welcome-bg .welcome-circle {
    opacity: 0.5;
  }

  .welcome-stats {
    width: 100%;
    justify-content: flex-start;
    padding: 16px 20px;
    gap: 24px;
  }

  .welcome-stat-divider {
    height: 36px;
  }

  .welcome-stat-value {
    font-size: 24px;
  }

  .welcome-title {
    font-size: 22px;
  }

  .welcome-date {
    font-size: 12px;
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .action-item {
    padding: 14px;
    gap: 10px;
  }

  .action-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
  }

  .action-title {
    font-size: 14px;
  }

  .action-desc {
    display: none;
  }

  .action-arrow {
    display: none;
  }

  .overview-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .overview-item {
    padding: 14px;
  }

  .overview-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }

  .overview-value {
    font-size: 22px;
  }

  .stat-card {
    padding: 18px;
    border-radius: 14px;
  }

  .stat-icon-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }

  .stat-value {
    font-size: 26px;
  }

  .stat-label {
    font-size: 12px;
  }

  .stat-footer {
    padding-top: 10px;
  }

  .stat-trend {
    font-size: 12px;
    padding: 3px 8px;
  }

  .ranking-item {
    padding: 12px 14px;
  }

  .rank-badge {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .rank-name {
    font-size: 13px;
  }

  .rank-count {
    font-size: 12px;
  }

  /* 卡片内边距 */
  .glass-card :deep(.n-card__content) {
    padding: 16px !important;
  }

  .glass-card :deep(.n-card-header) {
    padding: 14px 16px !important;
  }

  .card-title {
    font-size: 14px;
    gap: 10px;
  }

  .title-icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }

  /* 表格移动端 */
  .table-card :deep(.n-data-table-th),
  .table-card :deep(.n-data-table-td) {
    padding: 10px 8px !important;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .welcome-section {
    padding: 16px;
  }

  .welcome-title {
    font-size: 20px;
  }

  .welcome-stats {
    padding: 14px 16px;
    gap: 16px;
  }

  .welcome-stat-value {
    font-size: 20px;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .action-item {
    padding: 12px 14px;
  }

  .stat-card {
    padding: 14px;
  }

  .stat-value {
    font-size: 22px;
  }

  .overview-value {
    font-size: 20px;
  }
}
</style>
