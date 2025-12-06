<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="transitionName" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const transitionName = ref('fade')

// 监听路由变化，设置过渡动画
watch(
  () => router.currentRoute.value,
  (to, from) => {
    if (!from || !to) {
      transitionName.value = 'fade'
      return
    }

    const toDepth = to.path.split('/').length
    const fromDepth = from.path.split('/').length

    if (toDepth < fromDepth) {
      transitionName.value = 'slide-right'
    } else if (toDepth > fromDepth) {
      transitionName.value = 'slide-left'
    } else {
      transitionName.value = 'fade'
    }
  }
)
</script>
