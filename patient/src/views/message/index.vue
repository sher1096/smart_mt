<template>
  <div class="message-page">
    <div class="page-header">
      <h2>消息中心</h2>
      <n-button
        v-if="unreadCount > 0"
        text
        type="primary"
        class="read-all-btn"
        @click="handleMarkAllRead"
      >
        全部已读
      </n-button>
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
            <span class="time">{{ formatTime(item.createdAt || item.createTime) }}</span>
          </div>
          <p class="message-text">{{ item.content }}</p>
        </div>
        <div v-if="!item.isRead" class="unread-dot"></div>
      </div>
    </div>

    <n-empty v-if="messages.length === 0" description="暂无消息" />

    <!-- 消息详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" :title="selectedMessage?.title" style="width: 90%; max-width: 400px;">
      <div class="message-detail">
        <div class="detail-type">
          <n-tag :type="getTagType(selectedMessage?.type)">
            {{ getTypeName(selectedMessage?.type) }}
          </n-tag>
          <span class="detail-time">{{ formatTime(selectedMessage?.createdAt || selectedMessage?.createTime) }}</span>
        </div>
        <div class="detail-content">
          {{ selectedMessage?.content }}
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NIcon, NEmpty, NModal, NTag, NButton, useMessage } from 'naive-ui'
import {
  NotificationsOutline,
  CalendarOutline,
  MedicalOutline,
  InformationCircleOutline
} from '@vicons/ionicons5'
import { getMessages, markMessageRead } from '@/api'

const message = useMessage()
const messages = ref<any[]>([])
const showDetail = ref(false)
const selectedMessage = ref<any>(null)

// 计算未读消息数量
const unreadCount = computed(() => messages.value.filter(m => !m.isRead).length)

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return date.toLocaleDateString()
}

// 获取标签类型
const getTagType = (type: string) => {
  const typeMap: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
    appointment: 'success',
    medical: 'info',
    system: 'warning',
    payment: 'error'
  }
  return typeMap[type] || 'info'
}

// 获取类型名称
const getTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    appointment: '预约通知',
    medical: '医疗通知',
    system: '系统消息',
    payment: '缴费通知'
  }
  return nameMap[type] || '通知'
}

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
      await markMessageRead([item.id])  // 传递数组格式
      item.isRead = true
    } catch (error) {
      console.error('标记已读失败', error)
    }
  }
  // 展开消息详情弹窗
  selectedMessage.value = item
  showDetail.value = true
}

// 全部标记已读
const handleMarkAllRead = async () => {
  const unreadMessages = messages.value.filter(m => !m.isRead)
  if (unreadMessages.length === 0) return

  try {
    const ids = unreadMessages.map(m => m.id)
    await markMessageRead(ids)
    // 更新本地状态
    messages.value.forEach(m => {
      m.isRead = true
    })
    message.success('已全部标记为已读')
  } catch (error) {
    console.error('标记已读失败', error)
    message.error('操作失败，请重试')
  }
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  flex: 1;
  text-align: center;
}

.read-all-btn {
  position: absolute;
  right: 15px;
  font-size: 14px;
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

.message-detail {
  padding: 10px 0;
}

.detail-type {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.detail-time {
  font-size: 12px;
  color: #999;
}

.detail-content {
  font-size: 14px;
  color: #333;
  line-height: 1.8;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>
