<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-loading-bar-provider>
            <router-view v-slot="{ Component }">
              <transition name="fade-slide" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </n-loading-bar-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NConfigProvider, NMessageProvider, NDialogProvider, NNotificationProvider, NLoadingBarProvider, zhCN, dateZhCN } from 'naive-ui'
import '@/styles/page.css'

// 主题配置 - 更精致的样式
const themeOverrides = computed(() => ({
  common: {
    primaryColor: '#18A058',
    primaryColorHover: '#36AD6A',
    primaryColorPressed: '#0C7A43',
    primaryColorSuppl: '#36AD6A',
    borderRadius: '8px',
    borderRadiusSmall: '6px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    fontWeightStrong: '600'
  },
  Button: {
    borderRadiusMedium: '8px',
    borderRadiusSmall: '6px',
    borderRadiusLarge: '10px',
    fontWeightStrong: '500',
    paddingMedium: '0 20px',
    heightMedium: '36px',
    heightLarge: '44px'
  },
  Card: {
    borderRadius: '16px',
    paddingMedium: '20px',
    paddingLarge: '24px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(0, 0, 0, 0.02)'
  },
  Input: {
    borderRadius: '8px',
    heightMedium: '40px',
    heightLarge: '48px'
  },
  Select: {
    borderRadius: '8px'
  },
  DataTable: {
    borderRadius: '12px',
    thPaddingMedium: '14px 16px',
    tdPaddingMedium: '14px 16px',
    thColor: '#fafafa',
    thTextColor: '#333',
    thFontWeight: '600',
    tdColor: '#fff',
    borderColor: '#f0f0f0'
  },
  Tag: {
    borderRadius: '6px',
    fontWeightStrong: '500'
  },
  Modal: {
    borderRadius: '16px',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)'
  },
  Descriptions: {
    borderRadius: '12px'
  },
  Tabs: {
    tabFontWeightActive: '600',
    tabGapMediumLine: '32px'
  },
  Menu: {
    borderRadius: '8px',
    itemHeight: '44px',
    itemColorActive: 'rgba(24, 160, 88, 0.1)',
    itemColorActiveHover: 'rgba(24, 160, 88, 0.15)',
    itemTextColorActive: '#18A058',
    itemIconColorActive: '#18A058',
    itemTextColorActiveHover: '#18A058',
    itemIconColorActiveHover: '#18A058'
  },
  Form: {
    feedbackFontSizeMedium: '13px',
    labelFontSizeTopMedium: '14px'
  },
  Message: {
    borderRadius: '10px',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)'
  },
  Notification: {
    borderRadius: '12px',
    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)'
  },
  Dialog: {
    borderRadius: '16px'
  },
  Popconfirm: {
    borderRadius: '12px'
  }
}))
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 页面过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 缩放动画 */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
  transition: background 0.2s;
}

::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* 全局样式优化 */
.n-card {
  transition: box-shadow 0.2s ease;
}

.n-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.n-button {
  transition: all 0.2s ease;
}

.n-button--primary-type:not(:disabled):hover {
  transform: translateY(-1px);
}

.n-data-table-wrapper {
  border-radius: 12px;
  overflow: hidden;
}

/* 表格行悬停效果 */
.n-data-table .n-data-table-tr:hover .n-data-table-td {
  background-color: #fafafa !important;
}

/* 表单项间距优化 */
.n-form-item {
  margin-bottom: 22px;
}

/* 输入框聚焦效果 */
.n-input:focus-within {
  box-shadow: 0 0 0 2px rgba(24, 160, 88, 0.15);
}

/* 标签样式 */
.n-tag {
  font-weight: 500;
}

/* 选择器样式 */
.n-base-selection:focus-within {
  box-shadow: 0 0 0 2px rgba(24, 160, 88, 0.15);
}

/* 弹窗遮罩 */
.n-modal-mask {
  backdrop-filter: blur(2px);
}

/* 骨架屏动画 */
@keyframes skeleton-loading {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.skeleton-loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}
</style>
