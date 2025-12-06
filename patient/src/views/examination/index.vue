<template>
  <div class="examination-page">
    <div class="page-header">
      <n-icon :component="ArrowBackOutline" :size="24" class="back-btn" @click="router.back()" />
      <h2>我的体检</h2>
      <div class="placeholder"></div>
    </div>

    <div class="examination-list">
      <div
        v-for="item in examinations"
        :key="item.id"
        class="examination-card"
        @click="handleCardClick(item)"
      >
        <div class="card-header">
          <span class="date">{{ item.examDate }}</span>
          <n-tag :type="getStatusType(item.status)" size="small">
            {{ getStatusText(item.status) }}
          </n-tag>
        </div>

        <div class="card-body">
          <div class="info-row">
            <span class="label">体检类型：</span>
            <span>{{ item.examType }}</span>
          </div>
          <div class="info-row">
            <span class="label">体检项目：</span>
            <span>{{ item.items }}</span>
          </div>
          <div v-if="item.status === 'completed'" class="info-row">
            <span class="label">体检结果：</span>
            <span :style="{ color: item.result === '正常' ? '#18a058' : '#d03050' }">
              {{ item.result }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <n-empty v-if="examinations.length === 0" description="暂无体检记录" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, NTag, NEmpty } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { getExaminations } from '@/api'

const router = useRouter()
const examinations = ref<any[]>([])

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'error'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待体检',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}

const loadExaminations = async () => {
  try {
    const res = await getExaminations()
    examinations.value = res.data?.list || res.data || []
  } catch (error) {
    console.error('加载体检记录失败', error)
  }
}

const handleCardClick = (item: any) => {
  console.log('查看体检详情', item)
}

onMounted(() => {
  loadExaminations()
})
</script>

<style scoped>
.examination-page {
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

.back-btn {
  cursor: pointer;
  padding: 5px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.placeholder {
  width: 34px;
}

.examination-list {
  padding: 15px;
}

.examination-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  cursor: pointer;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.date {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  font-size: 14px;
  color: #666;
}

.label {
  flex-shrink: 0;
  width: 80px;
  color: #999;
}
</style>
