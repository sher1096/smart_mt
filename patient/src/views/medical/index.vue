<template>
  <div class="medical-page">
    <div class="page-header">
      <n-icon :component="ArrowBackOutline" :size="24" class="back-btn" @click="router.back()" />
      <h2>我的病历</h2>
      <div class="placeholder"></div>
    </div>

    <div class="medical-list">
      <div
        v-for="item in records"
        :key="item.id"
        class="medical-card"
        @click="handleCardClick(item)"
      >
        <div class="card-header">
          <span class="visit-date">{{ item.visitDate }}</span>
          <n-tag type="success" size="small">已完成</n-tag>
        </div>

        <div class="card-body">
          <div class="info-row">
            <span class="label">科室：</span>
            <span>{{ item.departmentName }}</span>
          </div>
          <div class="info-row">
            <span class="label">医生：</span>
            <span>{{ item.doctorName }}</span>
          </div>
          <div class="info-row">
            <span class="label">诊断：</span>
            <span>{{ item.diagnosis }}</span>
          </div>
        </div>
      </div>
    </div>

    <n-empty v-if="records.length === 0" description="暂无病历记录" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, NTag, NEmpty } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { getMedicalRecords } from '@/api'

const router = useRouter()
const records = ref<any[]>([])

const loadRecords = async () => {
  try {
    const res = await getMedicalRecords()
    records.value = res.data?.list || res.data || []
  } catch (error) {
    console.error('加载病历失败', error)
  }
}

const handleCardClick = (item: any) => {
  console.log('查看病历详情', item)
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.medical-page {
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

.medical-list {
  padding: 15px;
}

.medical-card {
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

.visit-date {
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
  width: 60px;
  color: #999;
}
</style>
