<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-dialog-provider>
          <n-notification-provider>
            <AppContent />
          </n-notification-provider>
        </n-dialog-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NLoadingBarProvider, NMessageProvider, NDialogProvider, NNotificationProvider, zhCN, dateZhCN } from 'naive-ui'
import { computed } from 'vue'
import AppContent from './AppContent.vue'

// 主题配置
const themeOverrides = computed(() => ({
  common: {
    primaryColor: '#18A058FF',
    primaryColorHover: '#36AD6AFF',
    primaryColorPressed: '#0C7A43FF',
    primaryColorSuppl: '#36AD6AFF'
  }
}))
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 移动端适配 */
@media (max-width: 750px) {
  html {
    font-size: 14px;
  }
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
