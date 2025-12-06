<template>
  <div class="message-page">
    <div class="page-header">
      <h2>消息中心</h2>
    </div>

    <div class="message-list">
      <div
        v-for="item in messages"
        :key="item.id"
        class="message-item"
        :class="{ unread: !item.isRead }"
        @click="handleMessageClick(item)"
      >
        <div class="message-icon">
          <n-icon :component="getMessageIcon(item.type)" :size="24" color="#18a058" />
        </div>
        <div class="message-content">
          <div class="message-header">
            <h4>{{ item.title }}</h4>
            <span class="time">{{ item.createTime }}</span>
          </div>
          <p class="message-text">{{ item.content }}</p>
        </div>
        <div v-if="!item.isRead" class="unread-dot"></div>
      </div>
    </div>

    <n-empty v-if="messages.length === 0" description="暂无消息" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NIcon, NEmpty } from 'naive-ui'
import {
  NotificationsOutline,
  CalendarOutline,
  MedicalOutline,
  InformationCircleOutline
} from '@vicons/ionicons5'
import { getMessages, markMessageRead } from '@/api'

const messages = ref<any[]>([])

const getMessageIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    appointment: CalendarOutline,
    medical: MedicalOutline,
    system: InformationCircleOutline
  }
  return iconMap[type] || NotificationsOutline
}

const loadMessages = async () => {
  try {
    const res = await getMessages()
    messages.value = res.data?.list || res.data || []
  } catch (error) {
    console.error('加载消息失败', error)
  }
}

const handleMessageClick = async (item: any) => {
  if (!item.isRead) {
    try {
      await markMessageRead(item.id)
      item.isRead = true
    } catch (error) {
      console.error('标记已读失败', error)
    }
  }
  // 可以跳转到详情页或展开详情
  console.log('查看消息详情', item)
}

onMounted(() => {
  loadMessages()
})
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  padding: 15px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.message-list {
  padding: 10px 0;
}

.message-item {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 15px;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-item.unread {
  background-color: #f0fdf4;
}

.message-item:active {
  background-color: #fafafa;
}

.message-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0fdf4;
  border-radius: 50%;
}

.message-content {
  flex: 1;
  overflow: hidden;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time {
  flex-shrink: 0;
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.message-text {
  margin: 0;
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.unread-dot {
  position: absolute;
  top: 20px;
  right: 15px;
  width: 8px;
  height: 8px;
  background-color: #d03050;
  border-radius: 50%;
}
</style>
