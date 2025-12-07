<template>
  <n-layout has-sider style="height: 100vh">
    <!-- 移动端遮罩 -->
    <div
      v-if="showMobileMenu"
      class="mobile-overlay"
      @click="showMobileMenu = false"
    ></div>

    <!-- 侧边栏 -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="isMobile ? 0 : 68"
      :width="isMobile ? 280 : 240"
      :collapsed="isMobile ? !showMobileMenu : collapsed"
      :show-trigger="!isMobile"
      :native-scrollbar="false"
      @collapse="collapsed = true"
      @expand="collapsed = false"
      class="sidebar"
      :class="{ 'sidebar-mobile': isMobile, 'sidebar-mobile-show': showMobileMenu }"
    >
      <div class="logo" :class="{ 'logo-collapsed': !isMobile && collapsed }">
        <div class="logo-icon">
          <n-icon :component="MedicalOutline" :size="collapsed && !isMobile ? 24 : 28" color="#fff" />
        </div>
        <transition name="fade">
          <div v-if="!collapsed || isMobile" class="logo-text">
            <span class="logo-title">智慧医疗</span>
            <span class="logo-subtitle">管理系统</span>
          </div>
        </transition>
        <!-- 移动端关闭按钮 -->
        <n-button v-if="isMobile" text class="mobile-close-btn" @click="showMobileMenu = false">
          <n-icon :component="CloseOutline" :size="22" color="rgba(255,255,255,0.8)" />
        </n-button>
      </div>

      <div class="menu-container">
        <n-menu
          :collapsed="!isMobile && collapsed"
          :collapsed-width="68"
          :collapsed-icon-size="20"
          :options="menuOptions"
          :value="activeKey"
          :indent="20"
          @update:value="handleMenuSelect"
        />
      </div>

      <!-- 底部信息 -->
      <div class="sidebar-footer" :class="{ 'sidebar-footer-collapsed': !isMobile && collapsed }">
        <transition name="fade">
          <div v-if="!collapsed || isMobile" class="version-info">
            <n-icon :component="ShieldCheckmarkOutline" :size="14" />
            <span>v2.0.0</span>
          </div>
        </transition>
      </div>
    </n-layout-sider>

    <!-- 主内容区 -->
    <n-layout class="main-layout">
      <!-- 头部 -->
      <n-layout-header bordered class="header">
        <div class="header-left">
          <!-- 移动端菜单按钮 -->
          <n-button v-if="isMobile" quaternary class="mobile-menu-btn" @click="showMobileMenu = true">
            <template #icon>
              <n-icon :size="22" :component="MenuOutline" />
            </template>
          </n-button>
          <n-breadcrumb separator=">" v-if="!isMobile">
            <n-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
              <span :class="{ 'breadcrumb-active': index === breadcrumbs.length - 1 }">
                {{ item.title }}
              </span>
            </n-breadcrumb-item>
          </n-breadcrumb>
          <span v-else class="mobile-title">{{ currentPageTitle }}</span>
        </div>

        <div class="header-right">
          <n-space align="center" :size="isMobile ? 4 : 8">
            <!-- 全屏按钮 - 桌面端 -->
            <n-tooltip v-if="!isMobile" trigger="hover">
              <template #trigger>
                <n-button quaternary circle @click="toggleFullscreen">
                  <template #icon>
                    <n-icon :size="18" :component="isFullscreen ? ContractOutline : ExpandOutline" />
                  </template>
                </n-button>
              </template>
              {{ isFullscreen ? '退出全屏' : '全屏显示' }}
            </n-tooltip>

            <!-- 刷新按钮 -->
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button quaternary circle @click="handleRefresh">
                  <template #icon>
                    <n-icon :size="18" :component="RefreshOutline" />
                  </template>
                </n-button>
              </template>
              刷新页面
            </n-tooltip>

            <!-- 通知按钮 -->
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-badge :value="3" :max="99">
                  <n-button quaternary circle>
                    <template #icon>
                      <n-icon :size="18" :component="NotificationsOutline" />
                    </template>
                  </n-button>
                </n-badge>
              </template>
              通知消息
            </n-tooltip>

            <n-divider v-if="!isMobile" vertical style="height: 24px; margin: 0 8px;" />

            <!-- 用户信息 -->
            <n-dropdown
              :options="userDropdownOptions"
              @select="handleUserDropdown"
              placement="bottom-end"
            >
              <div class="user-info">
                <n-avatar :size="isMobile ? 32 : 36" round class="user-avatar">
                  {{ (userStore.userInfo?.name || '管理员')[0] }}
                </n-avatar>
                <div v-if="!isMobile" class="user-detail">
                  <span class="user-name">{{ userStore.userInfo?.name || '管理员' }}</span>
                  <span class="user-role">超级管理员</span>
                </div>
                <n-icon v-if="!isMobile" :size="14" :component="ChevronDownOutline" class="user-arrow" />
              </div>
            </n-dropdown>
          </n-space>
        </div>
      </n-layout-header>

      <!-- 内容区 -->
      <n-layout-content class="content-area">
        <div class="page-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="page-fade" mode="out-in">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NBreadcrumb,
  NBreadcrumbItem,
  NSpace,
  NButton,
  NDropdown,
  NIcon,
  NAvatar,
  NTooltip,
  NBadge,
  NDivider
} from 'naive-ui'
import {
  PersonCircleOutline,
  LogOutOutline,
  MedicalOutline,
  RefreshOutline,
  ChevronDownOutline,
  ExpandOutline,
  ContractOutline,
  NotificationsOutline,
  SettingsOutline as SettingsIcon,
  ShieldCheckmarkOutline,
  MenuOutline,
  CloseOutline
} from '@vicons/ionicons5'
import {
  GridOutline,
  BusinessOutline,
  PeopleOutline,
  CalendarOutline,
  ClipboardOutline,
  DocumentTextOutline,
  ReceiptOutline,
  MedkitOutline,
  FitnessOutline,
  CardOutline,
  ChatbubblesOutline,
  NewspaperOutline,
  SettingsOutline,
  HomeOutline,
  StatsChartOutline
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const collapsed = ref(false)
const isFullscreen = ref(false)
const isMobile = ref(false)
const showMobileMenu = ref(false)

// 检测移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    showMobileMenu.value = false
  }
}

// 图标映射
const iconMap: Record<string, any> = {
  GridOutline,
  HomeOutline,
  StatsChartOutline,
  BusinessOutline,
  PeopleOutline,
  CalendarOutline,
  ClipboardOutline,
  DocumentTextOutline,
  ReceiptOutline,
  MedkitOutline,
  FitnessOutline,
  CardOutline,
  ChatbubblesOutline,
  NewspaperOutline,
  SettingsOutline,
  LogOutOutline,
  MedicalOutline
}

// 渲染图标
const renderIcon = (icon: string) => {
  return () => h(NIcon, null, { default: () => h(iconMap[icon]) })
}

// 菜单选项
const menuOptions = computed(() => {
  const routes = router.getRoutes()
  const menuRoutes = routes.filter(route => route.path === '/')[0]?.children || []

  return menuRoutes.map(route => ({
    label: route.meta?.title as string,
    key: route.path,
    icon: route.meta?.icon ? renderIcon(route.meta.icon as string) : undefined
  }))
})

// 当前激活的菜单项
const activeKey = computed(() => {
  const path = route.path.split('/')[1]
  return path || 'dashboard'
})

// 当前页面标题
const currentPageTitle = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.length > 0 ? matched[matched.length - 1].meta.title as string : '仪表盘'
})

// 面包屑
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(item => ({
    title: item.meta.title as string,
    path: item.path
  }))
})

// 用户下拉菜单选项
const userDropdownOptions = [
  {
    label: '个人设置',
    key: 'profile',
    icon: renderIcon('SettingsOutline')
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon('LogOutOutline')
  }
]

// 菜单选择事件
const handleMenuSelect = (key: string) => {
  router.push(`/${key}`)
  if (isMobile.value) {
    showMobileMenu.value = false
  }
}

// 用户下拉菜单选择事件
const handleUserDropdown = (key: string) => {
  if (key === 'logout') {
    userStore.logout()
  } else if (key === 'profile') {
    router.push('/settings')
  }
}

// 刷新页面
const handleRefresh = () => {
  window.location.reload()
}

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 监听全屏变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 路由变化时关闭移动端菜单
watch(() => route.path, () => {
  if (isMobile.value) {
    showMobileMenu.value = false
  }
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
/* 移动端遮罩 */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

/* 侧边栏 */
.sidebar {
  background: linear-gradient(180deg, #1e3a5f 0%, #1a2d47 100%);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
}

.sidebar-mobile {
  position: fixed !important;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.sidebar-mobile-show {
  transform: translateX(0);
}

.sidebar :deep(.n-layout-sider-scroll-container) {
  background: transparent;
  display: flex;
  flex-direction: column;
}

.sidebar :deep(.n-menu) {
  background: transparent;
  padding: 8px 12px;
}

/* 菜单项样式 - 提高可读性 */
.sidebar :deep(.n-menu-item) {
  margin-bottom: 4px;
  border-radius: 10px;
  height: 46px;
}

.sidebar :deep(.n-menu-item-content) {
  color: rgba(255, 255, 255, 0.85) !important;
  font-weight: 500;
  font-size: 14px;
}

.sidebar :deep(.n-menu-item:hover) {
  background: rgba(255, 255, 255, 0.12) !important;
}

.sidebar :deep(.n-menu-item:hover .n-menu-item-content) {
  color: #fff !important;
}

.sidebar :deep(.n-menu-item-content--selected),
.sidebar :deep(.n-menu-item-content--selected:hover) {
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%) !important;
  color: #fff !important;
  font-weight: 600;
}

.sidebar :deep(.n-menu-item-content--selected .n-menu-item-content__icon),
.sidebar :deep(.n-menu-item-content--selected:hover .n-menu-item-content__icon) {
  color: #fff !important;
}

.sidebar :deep(.n-menu-item-content__icon) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 18px;
}

.sidebar :deep(.n-menu-item:hover .n-menu-item-content__icon) {
  color: #fff !important;
}

.sidebar :deep(.n-layout-toggle-button) {
  background: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  right: -14px;
}

/* Logo区域 */
.logo {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 0 20px;
  transition: all 0.3s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-collapsed {
  padding: 0;
  justify-content: center;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(24, 160, 88, 0.4);
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  letter-spacing: 1px;
}

.logo-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
}

.mobile-close-btn {
  margin-left: auto;
}

/* 菜单容器 */
.menu-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-footer-collapsed {
  padding: 16px 12px;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

/* 主布局 */
.main-layout {
  background: #f5f7fa;
}

/* 头部 */
.header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-menu-btn {
  margin-right: 4px;
}

.mobile-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-left :deep(.n-breadcrumb-item:last-child .n-breadcrumb-item__link) {
  color: #333;
  font-weight: 500;
}

.breadcrumb-active {
  color: #333;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px 6px 6px;
  border-radius: 24px;
  transition: all 0.2s;
  background: #f8f9fa;
}

.user-info:hover {
  background: #f0f0f0;
}

.user-avatar {
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.user-name {
  font-size: 14px;
  color: #333;
  font-weight: 600;
  line-height: 1.2;
}

.user-role {
  font-size: 11px;
  color: #999;
  line-height: 1.2;
}

.user-arrow {
  color: #999;
  margin-left: 4px;
}

/* 内容区 */
.content-area {
  padding: 0;
  background: #f5f7fa;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 64px);
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.page-wrapper {
  padding: 24px;
  min-height: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* 页面过渡动画 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.2s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Logo文字淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 1024px) {
  .page-wrapper {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 12px;
    height: 56px;
  }

  .content-area {
    height: calc(100vh - 56px);
  }

  .page-wrapper {
    padding: 12px;
  }

  .user-info {
    padding: 4px;
    border-radius: 50%;
    background: transparent;
  }

  .user-info:hover {
    background: #f0f0f0;
  }
}

@media (max-width: 480px) {
  .page-wrapper {
    padding: 10px;
  }

  .header {
    padding: 0 10px;
  }
}
</style>
