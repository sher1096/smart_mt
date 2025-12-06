<template>
  <div class="prescription-page">
    <div class="page-header">
      <n-icon :component="ArrowBackOutline" :size="24" class="back-btn" @click="router.back()" />
      <h2>我的处方</h2>
      <div class="placeholder"></div>
    </div>

    <div class="prescription-list">
      <div
        v-for="item in prescriptions"
        :key="item.id"
        class="prescription-card"
        @click="handleCardClick(item)"
      >
        <div class="card-header">
          <span class="date">{{ item.createDate }}</span>
          <n-tag :type="item.status === 'paid' ? 'success' : 'warning'" size="small">
            {{ item.status === 'paid' ? '已缴费' : '待缴费' }}
          </n-tag>
        </div>

        <div class="card-body">
          <div class="info-row">
            <span class="label">医生：</span>
            <span>{{ item.doctorName }}</span>
          </div>
          <div class="info-row">
            <span class="label">药品：</span>
            <span>{{ item.medicines }}</span>
          </div>
          <div class="info-row">
            <span class="label">金额：</span>
            <span class="amount">¥{{ item.amount }}</span>
          </div>
        </div>

        <div v-if="item.status !== 'paid'" class="card-footer">
          <n-button type="primary" size="small" @click.stop="handlePay(item)">
            去缴费
          </n-button>
        </div>
      </div>
    </div>

    <n-empty v-if="prescriptions.length === 0" description="暂无处方记录" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, NTag, NButton, NEmpty, useMessage } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { getPrescriptions } from '@/api'

const router = useRouter()
const message = useMessage()
const prescriptions = ref<any[]>([])

const loadPrescriptions = async () => {
  try {
    const res = await getPrescriptions()
    prescriptions.value = res.data?.list || res.data || []
  } catch (error) {
    console.error('加载处方失败', error)
  }
}

const handleCardClick = (item: any) => {
  console.log('查看处方详情', item)
}

const handlePay = (item: any) => {
  router.push({
    path: '/payment',
    query: { prescriptionId: item.id }
  })
}

onMounted(() => {
  loadPrescriptions()
})
</script>

<style scoped>
.prescription-page {
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

.prescription-list {
  padding: 15px;
}

.prescription-card {
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
  width: 60px;
  color: #999;
}

.amount {
  color: #d03050;
  font-weight: 600;
}

.card-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
}
</style>
