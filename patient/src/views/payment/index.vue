<template>
  <div class="payment-page">
    <div class="page-header">
      <n-icon :component="ArrowBackOutline" :size="24" class="back-btn" @click="router.back()" />
      <h2>缴费中心</h2>
      <div class="placeholder"></div>
    </div>

    <n-tabs v-model:value="activeTab" type="line" animated @update:value="handleTabChange">
      <n-tab-pane name="unpaid" tab="待缴费" />
      <n-tab-pane name="paid" tab="已缴费" />
    </n-tabs>

    <div class="payment-list">
      <div
        v-for="item in payments"
        :key="item.id"
        class="payment-card"
      >
        <div class="card-header">
          <span class="date">{{ item.createDate }}</span>
          <n-tag :type="item.status === 'paid' ? 'success' : 'warning'" size="small">
            {{ item.status === 'paid' ? '已缴费' : '待缴费' }}
          </n-tag>
        </div>

        <div class="card-body">
          <div class="info-row">
            <span class="label">缴费项目：</span>
            <span>{{ item.itemName }}</span>
          </div>
          <div class="info-row">
            <span class="label">金额：</span>
            <span class="amount">¥{{ item.amount }}</span>
          </div>
          <div v-if="item.status === 'paid'" class="info-row">
            <span class="label">缴费时间：</span>
            <span>{{ item.paidDate }}</span>
          </div>
        </div>

        <div v-if="item.status === 'unpaid'" class="card-footer">
          <n-button type="primary" size="small" block @click="handlePay(item)">
            立即缴费
          </n-button>
        </div>
      </div>
    </div>

    <n-empty v-if="payments.length === 0" description="暂无缴费记录" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, NTabs, NTabPane, NTag, NButton, NEmpty, useMessage } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { getPayments } from '@/api'

const router = useRouter()
const message = useMessage()

const activeTab = ref('unpaid')
const payments = ref<any[]>([])

const loadPayments = async () => {
  try {
    const params = { status: activeTab.value }
    const res = await getPayments(params)
    payments.value = res.data?.list || res.data || []
  } catch (error) {
    console.error('加载缴费记录失败', error)
  }
}

const handleTabChange = () => {
  loadPayments()
}

const handlePay = (item: any) => {
  message.info('跳转到支付页面')
  // 实际应该跳转到支付页面或调用支付接口
}

onMounted(() => {
  loadPayments()
})
</script>

<style scoped>
.payment-page {
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

.payment-list {
  padding: 15px;
}

.payment-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
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

.amount {
  color: #d03050;
  font-weight: 600;
  font-size: 16px;
}

.card-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
