<template>
  <div class="my-appointments-page">
    <div class="page-header">
      <n-icon :component="ArrowBackOutline" :size="24" class="back-btn" @click="router.back()" />
      <h2>我的挂号</h2>
      <div class="placeholder"></div>
    </div>

    <n-tabs v-model:value="activeTab" type="line" animated @update:value="handleTabChange">
      <n-tab-pane name="all" tab="全部" />
      <n-tab-pane name="pending" tab="待就诊" />
      <n-tab-pane name="completed" tab="已完成" />
      <n-tab-pane name="cancelled" tab="已取消" />
    </n-tabs>

    <div class="appointment-list">
      <div
        v-for="item in appointments"
        :key="item.id"
        class="appointment-card"
        @click="handleCardClick(item)"
      >
        <div class="card-header">
          <span class="dept-name">{{ item.departmentName }}</span>
          <n-tag :type="getStatusType(item.status)" size="small">
            {{ getStatusText(item.status) }}
          </n-tag>
        </div>

        <div class="card-body">
          <div class="doctor-info">
            <n-avatar :size="50" :src="item.doctorAvatar" />
            <div class="info-detail">
              <h4>{{ item.doctorName }}</h4>
              <p>{{ item.doctorTitle }}</p>
            </div>
          </div>

          <div class="appointment-info">
            <div class="info-row">
              <n-icon :component="CalendarOutline" :size="16" />
              <span>{{ item.appointmentDate }} {{ item.timeSlot }}</span>
            </div>
            <div class="info-row">
              <n-icon :component="PersonOutline" :size="16" />
              <span>{{ item.patientName }}</span>
            </div>
          </div>
        </div>

        <div v-if="item.status === 'pending'" class="card-footer">
          <n-button size="small" @click.stop="handleCancel(item)">
            取消预约
          </n-button>
        </div>
      </div>
    </div>

    <n-empty v-if="appointments.length === 0" description="暂无挂号记录" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, NTabs, NTabPane, NTag, NAvatar, NButton, NEmpty, useMessage, useDialog } from 'naive-ui'
import { ArrowBackOutline, CalendarOutline, PersonOutline } from '@vicons/ionicons5'
import { getMyAppointments, cancelAppointment } from '@/api'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const activeTab = ref('all')
const appointments = ref<any[]>([])

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
    pending: '待就诊',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}

const loadAppointments = async () => {
  try {
    const params = activeTab.value === 'all' ? {} : { status: activeTab.value }
    const res = await getMyAppointments(params)
    appointments.value = res.data?.list || res.data || []
  } catch (error) {
    console.error('加载挂号记录失败', error)
  }
}

const handleTabChange = () => {
  loadAppointments()
}

const handleCardClick = (item: any) => {
  // 可以跳转到详情页
  console.log('查看详情', item)
}

const handleCancel = (item: any) => {
  dialog.warning({
    title: '取消预约',
    content: '确定要取消该预约吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const res = await cancelAppointment(item.id)
        if (res.code === 200 || res.code === 0) {
          message.success('已取消预约')
          loadAppointments()
        } else {
          message.error(res.message || '取消失败')
        }
      } catch (error: any) {
        message.error(error?.message || '取消失败')
      }
    }
  })
}

onMounted(() => {
  loadAppointments()
})
</script>

<style scoped>
.my-appointments-page {
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

.appointment-list {
  padding: 15px;
}

.appointment-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: transform 0.2s;
}

.appointment-card:active {
  transform: scale(0.98);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.dept-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.doctor-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.info-detail h4 {
  margin: 0 0 5px 0;
  font-size: 15px;
  font-weight: 600;
}

.info-detail p {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.appointment-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.card-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
}
</style>
