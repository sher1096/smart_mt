<template>
  <div class="dashboard">
    <n-space vertical :size="24">
      <!-- 统计卡片 -->
      <n-grid :cols="4" :x-gap="16">
        <n-gi v-for="item in stats" :key="item.title">
          <n-card :bordered="false" class="stat-card">
            <n-statistic :label="item.title" :value="item.value">
              <template #prefix>
                <n-icon :component="item.icon" :color="item.color" size="32" />
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- 图表区域 -->
      <n-grid :cols="2" :x-gap="16">
        <n-gi>
          <n-card title="挂号趋势" :bordered="false">
            <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #999;">
              图表区域（可集成 ECharts 或其他图表库）
            </div>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card title="科室分布" :bordered="false">
            <div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #999;">
              图表区域（可集成 ECharts 或其他图表库）
            </div>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- 快捷操作 -->
      <n-card title="快捷操作" :bordered="false">
        <n-space>
          <n-button type="primary" @click="handleQuickAction('registration')">
            <template #icon>
              <n-icon><ClipboardOutline /></n-icon>
            </template>
            新增挂号
          </n-button>
          <n-button type="info" @click="handleQuickAction('schedule')">
            <template #icon>
              <n-icon><CalendarOutline /></n-icon>
            </template>
            排班管理
          </n-button>
          <n-button type="success" @click="handleQuickAction('doctor')">
            <template #icon>
              <n-icon><PeopleOutline /></n-icon>
            </template>
            医生管理
          </n-button>
          <n-button type="warning" @click="handleQuickAction('medicine')">
            <template #icon>
              <n-icon><MedkitOutline /></n-icon>
            </template>
            药品管理
          </n-button>
        </n-space>
      </n-card>

      <!-- 最近活动 -->
      <n-card title="最近活动" :bordered="false">
        <n-list bordered>
          <n-list-item v-for="activity in recentActivities" :key="activity.id">
            <n-thing :title="activity.title" :description="activity.time">
              <template #avatar>
                <n-avatar :style="{ backgroundColor: activity.color }">
                  <n-icon :component="activity.icon" />
                </n-avatar>
              </template>
            </n-thing>
          </n-list-item>
        </n-list>
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  NSpace,
  NGrid,
  NGi,
  NCard,
  NStatistic,
  NIcon,
  NButton,
  NList,
  NListItem,
  NThing,
  NAvatar
} from 'naive-ui'
import {
  PeopleOutline,
  ClipboardOutline,
  CalendarOutline,
  MedkitOutline,
  DocumentTextOutline,
  CheckmarkCircleOutline
} from '@vicons/ionicons5'

const router = useRouter()

// 统计数据
const stats = ref([
  {
    title: '今日挂号',
    value: 156,
    icon: ClipboardOutline,
    color: '#18a058'
  },
  {
    title: '待诊患者',
    value: 42,
    icon: PeopleOutline,
    color: '#2080f0'
  },
  {
    title: '在岗医生',
    value: 28,
    icon: DocumentTextOutline,
    color: '#f0a020'
  },
  {
    title: '今日收入',
    value: 125800,
    icon: CheckmarkCircleOutline,
    color: '#d03050'
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    title: '患者张三完成挂号',
    time: '2分钟前',
    icon: ClipboardOutline,
    color: '#18a058'
  },
  {
    id: 2,
    title: '李医生更新了排班',
    time: '10分钟前',
    icon: CalendarOutline,
    color: '#2080f0'
  },
  {
    id: 3,
    title: '新增药品"阿莫西林"',
    time: '30分钟前',
    icon: MedkitOutline,
    color: '#f0a020'
  },
  {
    id: 4,
    title: '患者王五完成缴费',
    time: '1小时前',
    icon: CheckmarkCircleOutline,
    color: '#d03050'
  }
])

// 快捷操作处理
const handleQuickAction = (action: string) => {
  const routeMap: Record<string, string> = {
    registration: '/registrations',
    schedule: '/schedules',
    doctor: '/doctors',
    medicine: '/medicines'
  }

  const path = routeMap[action]
  if (path) {
    router.push(path)
  }
}
</script>

<style scoped>
.dashboard {
  width: 100%;
}

.stat-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.stat-card :deep(.n-statistic) {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card :deep(.n-statistic-value) {
  font-size: 28px;
  font-weight: bold;
}
</style>
