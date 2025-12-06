<template>
  <div class="booking-page">
    <div class="page-header">
      <n-icon :component="ArrowBackOutline" :size="24" class="back-btn" @click="router.back()" />
      <h2>预约挂号</h2>
      <div class="placeholder"></div>
    </div>

    <div class="booking-content">
      <!-- 医生信息 -->
      <div class="doctor-section">
        <h3>医生信息</h3>
        <div class="doctor-card">
          <n-avatar :size="60" :src="doctorInfo?.avatar" />
          <div class="doctor-info">
            <h4>{{ doctorInfo?.name || '未选择' }}</h4>
            <p>{{ doctorInfo?.title }} | {{ doctorInfo?.department }}</p>
          </div>
        </div>
      </div>

      <!-- 选择日期 -->
      <div class="date-section">
        <h3>选择日期</h3>
        <n-date-picker
          v-model:value="formData.appointmentDate"
          type="date"
          clearable
          :is-date-disabled="isDateDisabled"
          @update:value="handleDateChange"
        />
      </div>

      <!-- 选择时段 -->
      <div class="time-section">
        <h3>选择时段</h3>
        <div class="time-slots">
          <div
            v-for="slot in timeSlots"
            :key="slot.id"
            class="time-slot"
            :class="{ active: formData.timeSlot === slot.time, disabled: !slot.available }"
            @click="handleTimeSlotClick(slot)"
          >
            <span>{{ slot.time }}</span>
            <span class="slot-status">{{ slot.available ? '可约' : '已满' }}</span>
          </div>
        </div>
      </div>

      <!-- 就诊人信息 -->
      <div class="patient-section">
        <h3>就诊人信息</h3>
        <n-form ref="formRef" :model="formData" :rules="rules">
          <n-form-item label="姓名" path="patientName">
            <n-input v-model:value="formData.patientName" placeholder="请输入姓名" />
          </n-form-item>
          <n-form-item label="手机号" path="patientPhone">
            <n-input v-model:value="formData.patientPhone" placeholder="请输入手机号" />
          </n-form-item>
          <n-form-item label="身份证号" path="patientIdCard">
            <n-input v-model:value="formData.patientIdCard" placeholder="请输入身份证号（选填）" />
          </n-form-item>
        </n-form>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <n-button
          type="primary"
          size="large"
          block
          :loading="loading"
          @click="handleSubmit"
        >
          确认预约
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NIcon, NAvatar, NDatePicker, NForm, NFormItem, NInput, NButton, useMessage, FormInst, FormRules } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { getDoctorDetail, getAvailableTimeSlots, createAppointment } from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const userStore = useUserStore()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const doctorId = ref(route.query.doctorId as string)
const doctorInfo = ref<any>(null)
const timeSlots = ref<any[]>([])

const formData = ref({
  appointmentDate: null as number | null,
  timeSlot: '',
  patientName: userStore.userInfo?.name || '',
  patientPhone: userStore.userInfo?.phone || '',
  patientIdCard: userStore.userInfo?.idCard || ''
})

const rules: FormRules = {
  patientName: { required: true, message: '请输入姓名', trigger: 'blur' },
  patientPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

// 禁用过去的日期
const isDateDisabled = (ts: number) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return ts < today.getTime()
}

// 加载医生信息
const loadDoctorInfo = async () => {
  if (!doctorId.value) return
  try {
    const res = await getDoctorDetail(Number(doctorId.value))
    doctorInfo.value = res.data
  } catch (error) {
    console.error('加载医生信息失败', error)
  }
}

// 加载可用时段
const loadTimeSlots = async (date: string) => {
  if (!doctorId.value) return
  try {
    const res = await getAvailableTimeSlots(Number(doctorId.value), date)
    timeSlots.value = res.data || []
  } catch (error) {
    console.error('加载时段失败', error)
    // 模拟数据
    timeSlots.value = [
      { id: 1, time: '08:00-09:00', available: true },
      { id: 2, time: '09:00-10:00', available: true },
      { id: 3, time: '10:00-11:00', available: false },
      { id: 4, time: '14:00-15:00', available: true },
      { id: 5, time: '15:00-16:00', available: true },
      { id: 6, time: '16:00-17:00', available: true }
    ]
  }
}

// 日期变化
const handleDateChange = (value: number | null) => {
  if (value) {
    const date = new Date(value)
    const dateStr = date.toISOString().split('T')[0]
    loadTimeSlots(dateStr)
  } else {
    timeSlots.value = []
  }
  formData.value.timeSlot = ''
}

// 选择时段
const handleTimeSlotClick = (slot: any) => {
  if (!slot.available) {
    message.warning('该时段已约满')
    return
  }
  formData.value.timeSlot = slot.time
}

// 提交预约
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    if (!formData.value.appointmentDate) {
      message.warning('请选择预约日期')
      return
    }

    if (!formData.value.timeSlot) {
      message.warning('请选择预约时段')
      return
    }

    loading.value = true

    const appointmentData = {
      doctorId: Number(doctorId.value),
      scheduleId: 0, // 需要从时段中获取
      patientName: formData.value.patientName,
      patientPhone: formData.value.patientPhone,
      patientIdCard: formData.value.patientIdCard,
      appointmentDate: new Date(formData.value.appointmentDate).toISOString().split('T')[0],
      timeSlot: formData.value.timeSlot,
      departmentId: Number(route.query.departmentId) || doctorInfo.value?.departmentId || 0
    }

    const res = await createAppointment(appointmentData)

    if (res.code === 200 || res.code === 0) {
      message.success('预约成功')
      setTimeout(() => {
        router.replace('/my-appointments')
      }, 1000)
    } else {
      message.error(res.message || '预约失败')
    }
  } catch (error: any) {
    if (error?.errors) return
    message.error(error?.message || '预约失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDoctorInfo()
})
</script>

<style scoped>
.booking-page {
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

.booking-content {
  padding: 15px;
}

.doctor-section,
.date-section,
.time-section,
.patient-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.doctor-card {
  display: flex;
  gap: 12px;
  align-items: center;
}

.doctor-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
}

.doctor-info p {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.time-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.time-slot span {
  font-size: 13px;
  color: #333;
}

.slot-status {
  font-size: 11px;
  color: #18a058;
  margin-top: 4px;
}

.time-slot.active {
  border-color: #18a058;
  background-color: #f0fdf4;
}

.time-slot.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.time-slot.disabled .slot-status {
  color: #999;
}

.submit-section {
  margin-top: 20px;
}
</style>
