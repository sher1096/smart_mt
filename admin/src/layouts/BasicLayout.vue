<template>
  <n-layout has-sider style="height: 100vh">
    <!-- 侧边栏 -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="logo">
        <h2 v-if="!collapsed">智慧医疗</h2>
        <h2 v-else>医疗</h2>
      </div>
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
      />
    </n-layout-sider>

    <!-- 主内容区 -->
    <n-layout>
      <!-- 头部 -->
      <n-layout-header bordered style="height: 64px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between;">
        <n-breadcrumb>
          <n-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
            {{ item.title }}
          </n-breadcrumb-item>
        </n-breadcrumb>

        <n-space>
          <n-dropdown :options="userDropdownOptions" @select="handleUserDropdown">
            <n-button text>
              <template #icon>
                <n-icon>
                  <PersonCircleOutline />
                </n-icon>
              </template>
              {{ userStore.userInfo?.name || '管理员' }}
            </n-button>
          </n-dropdown>
        </n-space>
      </n-layout-header>

      <!-- 内容区 -->
      <n-layout-content content-style="padding: 24px;">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, NMenu, NBreadcrumb, NBreadcrumbItem, NSpace, NButton, NDropdown, NIcon } from 'naive-ui'
import { PersonCircleOutline, LogOutOutline } from '@vicons/ionicons5'
import {
  DashboardOutline,
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
  SettingsOutline
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const collapsed = ref(false)

// 图标映射
const iconMap: Record<string, any> = {
  DashboardOutline,
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
  SettingsOutline
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
    label: '退出登录',
    key: 'logout',
    icon: renderIcon('LogOutOutline')
  }
]

// 菜单选择事件
const handleMenuSelect = (key: string) => {
  router.push(`/${key}`)
}

// 用户下拉菜单选择事件
const handleUserDropdown = (key: string) => {
  if (key === 'logout') {
    userStore.logout()
  }
}
</script>

<style scoped>
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f0f0f0;
  font-size: 18px;
  font-weight: bold;
}

.logo h2 {
  margin: 0;
  font-size: 20px;
}
</style>
