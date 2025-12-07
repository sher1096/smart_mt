<template>
  <div class="mobile-layout">
    <!-- 主内容区域 -->
    <div class="main-content" :class="{ 'has-tabbar': showTabBar }">
      <router-view v-slot="{ Component }">
        <keep-alive :include="['Home', 'Profile']">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>

    <!-- 底部 TabBar -->
    <div v-if="showTabBar" class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        class="tab-item"
        :class="{ active: currentTab === tab.path }"
        @click="handleTabClick(tab.path)"
      >
        <n-icon :size="24" :component="tab.icon" />
        <span class="tab-label">{{ tab.label }}</span>
        <n-badge
          v-if="tab.badge && unreadCount > 0"
          :value="unreadCount"
          :max="99"
          class="tab-badge"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NIcon, NBadge } from 'naive-ui'
import {
  HomeOutline as HomeIcon,
  CalendarOutline as CalendarIcon,
  NotificationsOutline as NotificationIcon,
  PersonOutline as PersonIcon
} from '@vicons/ionicons5'
import { getUnreadCount } from '@/api'

const router = useRouter()
const route = useRoute()

// 标签页配置
const tabs = [
  { path: '/home', label: '首页', icon: HomeIcon, badge: false },
  { path: '/appointment/departments', label: '预约', icon: CalendarIcon, badge: false },
  { path: '/message', label: '消息', icon: NotificationIcon, badge: true },
  { path: '/profile', label: '我的', icon: PersonIcon, badge: false }
]

const currentTab = computed(() => {
  const path = route.path
  if (path.startsWith('/appointment')) return '/appointment/departments'
  return tabs.find(tab => path.startsWith(tab.path))?.path || '/home'
})

const showTabBar = computed(() => {
  return route.meta.showTabBar === true ||
         tabs.some(tab => route.path.startsWith(tab.path))
})

// 未读消息数
const unreadCount = ref(0)

const loadUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    // 后端返回格式: { count: number }
    unreadCount.value = res?.count || res?.data?.count || 0
  } catch (error) {
    // 未登录时忽略错误
    if (error?.response?.status !== 401) {
      console.error('获取未读消息数失败', error)
    }
  }
}

const handleTabClick = (path: string) => {
  if (currentTab.value !== path) {
    router.push(path)
  }
}

onMounted(() => {
  loadUnreadCount()
  // 每30秒刷新一次未读消息数
  setInterval(loadUnreadCount, 30000)
})
</script>

<style scoped>
.mobile-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.main-content.has-tabbar {
  padding-bottom: 50px;
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #fff;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 999;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  position: relative;
  color: #999;
  transition: color 0.3s;
}

.tab-item.active {
  color: #18a058;
}

.tab-label {
  font-size: 12px;
  line-height: 1;
}

.tab-badge {
  position: absolute;
  top: 0;
  right: 25%;
}

/* 适配安全区域 */
@supports (bottom: env(safe-area-inset-bottom)) {
  .tab-bar {
    padding-bottom: env(safe-area-inset-bottom);
    height: calc(50px + env(safe-area-inset-bottom));
  }
}
</style>
