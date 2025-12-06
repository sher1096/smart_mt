<template>
  <div class="profile-page">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div v-if="userStore.isLoggedIn" class="user-info">
        <n-avatar :size="70" :src="userStore.userInfo?.avatar" />
        <div class="user-detail">
          <h3>{{ userStore.userName }}</h3>
          <p>{{ userStore.userInfo?.phone || '未绑定手机号' }}</p>
        </div>
      </div>
      <div v-else class="login-prompt" @click="router.push('/login')">
        <n-avatar :size="70" />
        <div class="user-detail">
          <h3>点击登录</h3>
          <p>登录后查看更多功能</p>
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <h4 class="section-title">就诊服务</h4>
      <div class="menu-list">
        <div
          v-for="item in medicalMenu"
          :key="item.path"
          class="menu-item"
          @click="handleMenuClick(item)"
        >
          <div class="menu-left">
            <n-icon :size="22" :color="item.color" :component="item.icon" />
            <span>{{ item.label }}</span>
          </div>
          <n-icon :size="20" :component="ChevronForward" color="#ccc" />
        </div>
      </div>
    </div>

    <div class="menu-section">
      <h4 class="section-title">健康档案</h4>
      <div class="menu-list">
        <div
          v-for="item in healthMenu"
          :key="item.path"
          class="menu-item"
          @click="handleMenuClick(item)"
        >
          <div class="menu-left">
            <n-icon :size="22" :color="item.color" :component="item.icon" />
            <span>{{ item.label }}</span>
          </div>
          <n-icon :size="20" :component="ChevronForward" color="#ccc" />
        </div>
      </div>
    </div>

    <div class="menu-section">
      <h4 class="section-title">其他</h4>
      <div class="menu-list">
        <div
          v-for="item in otherMenu"
          :key="item.label"
          class="menu-item"
          @click="handleMenuClick(item)"
        >
          <div class="menu-left">
            <n-icon :size="22" :color="item.color" :component="item.icon" />
            <span>{{ item.label }}</span>
          </div>
          <n-icon :size="20" :component="ChevronForward" color="#ccc" />
        </div>
      </div>
    </div>

    <!-- 退出登录 -->
    <div v-if="userStore.isLoggedIn" class="logout-section">
      <n-button block size="large" @click="handleLogout">
        退出登录
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NAvatar, NIcon, NButton, useDialog, useMessage } from 'naive-ui'
import {
  CalendarOutline,
  DocumentTextOutline,
  MedicalOutline,
  FlaskOutline,
  CardOutline,
  SettingsOutline,
  HelpCircleOutline,
  ChevronForward
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const dialog = useDialog()
const message = useMessage()
const userStore = useUserStore()

// 就诊服务菜单
const medicalMenu = [
  { label: '我的挂号', path: '/my-appointments', icon: CalendarOutline, color: '#18a058', requireAuth: true },
  { label: '缴费中心', path: '/payment', icon: CardOutline, color: '#d03050', requireAuth: true }
]

// 健康档案菜单
const healthMenu = [
  { label: '我的病历', path: '/medical-records', icon: DocumentTextOutline, color: '#2080f0', requireAuth: true },
  { label: '我的处方', path: '/prescriptions', icon: MedicalOutline, color: '#f0a020', requireAuth: true },
  { label: '我的体检', path: '/examinations', icon: FlaskOutline, color: '#7c3aed', requireAuth: true }
]

// 其他菜单
const otherMenu = [
  { label: '设置', path: '/settings', icon: SettingsOutline, color: '#666', requireAuth: false },
  { label: '帮助与反馈', path: '/help', icon: HelpCircleOutline, color: '#666', requireAuth: false }
]

// 菜单点击
const handleMenuClick = (item: any) => {
  if (item.requireAuth && !userStore.isLoggedIn) {
    message.warning('请先登录')
    router.push('/login')
    return
  }

  if (item.path) {
    router.push(item.path)
  } else {
    message.info('功能开发中')
  }
}

// 退出登录
const handleLogout = () => {
  dialog.warning({
    title: '退出登录',
    content: '确定要退出登录吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      userStore.logout()
      message.success('已退出登录')
    }
  })
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;
}

.user-card {
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
  padding: 30px 20px;
  margin-bottom: 10px;
}

.user-info,
.login-prompt {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
}

.user-detail {
  flex: 1;
  color: #fff;
}

.user-detail h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.user-detail p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

.menu-section {
  background-color: #fff;
  margin-bottom: 10px;
  padding: 0 15px;
}

.section-title {
  margin: 0;
  padding: 15px 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: #999;
}

.menu-list {
  border-top: 1px solid #f0f0f0;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background-color: #fafafa;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-left span {
  font-size: 15px;
  color: #333;
}

.logout-section {
  padding: 20px 15px;
}
</style>
