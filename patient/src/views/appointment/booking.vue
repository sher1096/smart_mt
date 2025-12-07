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
        <div class="doctor-card" v-if="doctorInfo">
          <n-avatar :size="64" :src="getDoctorAvatar()" round />
          <div class="doctor-info">
            <div class="doctor-name-row">
              <h4>{{ doctorInfo.name }}</h4>
              <n-tag :type="getTitleType(doctorInfo.title)" size="small" :bordered="false">
                {{ doctorInfo.title || '医师' }}
              </n-tag>
            </div>
            <p class="doctor-dept">{{ getDepartmentName() }}</p>
            <p class="doctor-specialty" v-if="doctorInfo.specialty">
              擅长：{{ doctorInfo.specialty }}
            </p>
          </div>
        </div>
        <div v-else class="doctor-card loading-card">
          <n-skeleton circle :width="64" />
          <div class="doctor-info">
            <n-skeleton text :width="100" />
            <n-skeleton text :width="150" style="margin-top: 8px" />
          </div>
        </div>
      </div>

      <!-- 选择日期 -->
      <div class="date-section">
        <h3>选择日期</h3>
        <div class="date-picker-wrapper">
          <n-date-picker
            v-model:value="formData.appointmentDate"
            type="date"
            clearable
            :is-date-disabled="isDateDisabled"
            @update:value="handleDateChange"
            placeholder="请选择预约日期"
            style="width: 100%"
          />
        </div>
        <p class="date-hint">可预约未来7天内的号源</p>
      </div>

      <!-- 选择时段 -->
      <div class="time-section">
        <h3>选择时段</h3>
        <div v-if="!formData.appointmentDate" class="time-empty">
          <n-icon :component="CalendarOutline" :size="40" color="#ccc" />
          <p>请先选择预约日期</p>
        </div>
        <div v-else-if="timeSlotsLoading" class="time-loading">
          <n-spin size="medium" />
          <p>加载时段中...</p>
        </div>
        <div v-else-if="timeSlots.length === 0" class="time-empty">
          <n-icon :component="TimeOutline" :size="40" color="#ccc" />
          <p>该日期暂无可用时段</p>
        </div>
        <div v-else class="time-slots">
          <div
            v-for="slot in timeSlots"
            :key="slot.id"
            class="time-slot"
            :class="{
              active: formData.timeSlot === slot.time,
              disabled: !slot.available,
              hot: slot.available && slot.remaining && slot.remaining <= 3
            }"
            @click="handleTimeSlotClick(slot)"
          >
            <span class="slot-time">{{ slot.time }}</span>
            <span class="slot-status" :class="getSlotStatusClass(slot)">
              {{ getSlotStatusText(slot) }}
            </span>
            <span v-if="slot.available && slot.remaining && slot.remaining <= 3" class="slot-hot">
              仅剩{{ slot.remaining }}个
            </span>
          </div>
        </div>
      </div>

      <!-- 就诊人信息 -->
      <div class="patient-section">
        <h3>就诊人信息</h3>
        <n-form ref="formRef" :model="formData" :rules="rules">
          <n-form-item label="姓名" path="patientName">
            <n-input v-model:value="formData.patientName" placeholder="请输入就诊人姓名" />
          </n-form-item>
          <n-form-item label="手机号" path="patientPhone">
            <n-input v-model:value="formData.patientPhone" placeholder="请输入联系手机号" />
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
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          确认预约
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NIcon, NAvatar, NDatePicker, NForm, NFormItem, NInput, NButton, NTag, NSkeleton, NSpin, useMessage, FormInst, FormRules } from 'naive-ui'
import { ArrowBackOutline, CalendarOutline, TimeOutline } from '@vicons/ionicons5'
import { getDoctorDetail, getAvailableTimeSlots, createAppointment } from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const userStore = useUserStore()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const timeSlotsLoading = ref(false)

const doctorId = ref(route.query.doctorId as string)
const doctorInfo = ref<any>(null)
const timeSlots = ref<any[]>([])

const formData = ref({
  appointmentDate: null as number | null,
  timeSlot: '',
  scheduleId: 0,
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

// 是否可以提交
const canSubmit = computed(() => {
  return formData.value.appointmentDate && formData.value.timeSlot && formData.value.patientName && formData.value.patientPhone
})

// 禁用过去的日期和7天后的日期
const isDateDisabled = (ts: number) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 7)
  return ts < today.getTime() || ts > maxDate.getTime()
}

// 生成医生头像
const generateAvatarSvg = (name: string) => {
  const initial = name?.[0] || '医'
  const color = '#18a058'
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${color}"/><stop offset="100%" style="stop-color:${color}99"/></linearGradient></defs><circle cx="32" cy="32" r="32" fill="url(#g)"/><text x="32" y="40" font-size="26" fill="#fff" text-anchor="middle" font-family="sans-serif" font-weight="500">${initial}</text></svg>`)}`
}

// 获取医生头像
const getDoctorAvatar = () => {
  if (doctorInfo.value?.avatar && doctorInfo.value.avatar.startsWith('http')) {
    return doctorInfo.value.avatar
  }
  return generateAvatarSvg(doctorInfo.value?.name || '')
}

// 获取科室名称
const getDepartmentName = () => {
  if (!doctorInfo.value) return ''
  if (typeof doctorInfo.value.department === 'string') {
    return doctorInfo.value.department
  }
  if (doctorInfo.value.department?.name) {
    return doctorInfo.value.department.name
  }
  return route.query.departmentName as string || '综合科'
}

// 职称标签类型
const getTitleType = (title: string) => {
  if (!title) return 'success'
  if (title.includes('主任') && !title.includes('副主任')) return 'warning'
  if (title.includes('副主任')) return 'info'
  return 'success'
}

// 加载医生信息
const loadDoctorInfo = async () => {
  if (!doctorId.value) return
  try {
    const res = await getDoctorDetail(Number(doctorId.value))
    doctorInfo.value = res.data || res
  } catch (error) {
    console.error('加载医生信息失败', error)
    // 使用URL参数中的信息
    doctorInfo.value = {
      id: doctorId.value,
      name: route.query.doctorName as string || '医生'
    }
  }
}

// 获取时段状态文本
const getSlotStatusText = (slot: any) => {
  if (!slot.available) return '已满'
  if (slot.remaining !== undefined) {
    if (slot.remaining <= 3) return '紧张'
    if (slot.remaining <= 10) return '充足'
  }
  return '可约'
}

// 获取时段状态样式类
const getSlotStatusClass = (slot: any) => {
  if (!slot.available) return 'status-full'
  if (slot.remaining !== undefined) {
    if (slot.remaining <= 3) return 'status-hot'
    if (slot.remaining <= 10) return 'status-normal'
  }
  return 'status-available'
}

// 加载可用时段
const loadTimeSlots = async (date: string) => {
  if (!doctorId.value) return
  timeSlotsLoading.value = true
  try {
    const res = await getAvailableTimeSlots(Number(doctorId.value), date)
    const slots = res.data || res || []
    if (Array.isArray(slots) && slots.length > 0) {
      timeSlots.value = slots
    } else {
      // 生成模拟时段数据
      timeSlots.value = generateMockTimeSlots()
    }
  } catch (error) {
    console.error('加载时段失败', error)
    // 生成模拟时段数据
    timeSlots.value = generateMockTimeSlots()
  } finally {
    timeSlotsLoading.value = false
  }
}

// 生成模拟时段数据
const generateMockTimeSlots = () => {
  return [
    { id: 1, scheduleId: 1, time: '08:00-09:00', available: true, remaining: 8, total: 10 },
    { id: 2, scheduleId: 2, time: '09:00-10:00', available: true, remaining: 2, total: 10 },
    { id: 3, scheduleId: 3, time: '10:00-11:00', available: true, remaining: 5, total: 10 },
    { id: 4, scheduleId: 4, time: '11:00-12:00', available: true, remaining: 10, total: 10 },
    { id: 5, scheduleId: 5, time: '14:00-15:00', available: true, remaining: 6, total: 10 },
    { id: 6, scheduleId: 6, time: '15:00-16:00', available: true, remaining: 1, total: 10 },
    { id: 7, scheduleId: 7, time: '16:00-17:00', available: true, remaining: 9, total: 10 },
    { id: 8, scheduleId: 8, time: '17:00-18:00', available: false, remaining: 0, total: 10 }
  ]
}

// 日期变化
const handleDateChange = (value: number | null) => {
  formData.value.timeSlot = ''
  formData.value.scheduleId = 0
  if (value) {
    const date = new Date(value)
    const dateStr = date.toISOString().split('T')[0]
    loadTimeSlots(dateStr)
  } else {
    timeSlots.value = []
  }
}

// 选择时段
const handleTimeSlotClick = (slot: any) => {
  if (!slot.available) {
    message.warning('该时段已约满，请选择其他时段')
    return
  }
  formData.value.timeSlot = slot.time
  formData.value.scheduleId = slot.scheduleId || slot.id
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
      scheduleId: formData.value.scheduleId,
      patientName: formData.value.patientName,
      patientPhone: formData.value.patientPhone,
      patientIdCard: formData.value.patientIdCard,
      appointmentDate: new Date(formData.value.appointmentDate).toISOString().split('T')[0],
      timeSlot: formData.value.timeSlot,
      departmentId: Number(route.query.departmentId) || doctorInfo.value?.departmentId || doctorInfo.value?.department?.id || 0
    }

    const res = await createAppointment(appointmentData)

    if (res.code === 200 || res.code === 0 || res.id) {
      message.success('预约成功！')
      setTimeout(() => {
        router.replace('/my-appointments')
      }, 1000)
    } else {
      message.error(res.message || '预约失败，请重试')
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
  background: linear-gradient(180deg, #f8faf9 0%, #f0f2f5 100%);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
  color: #fff;
}

.back-btn {
  cursor: pointer;
  padding: 5px;
  color: #fff;
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
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

h3::before {
  content: '';
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #18a058 0%, #36ad6a 100%);
  border-radius: 2px;
}

.doctor-card {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.loading-card {
  align-items: center;
}

.doctor-info {
  flex: 1;
}

.doctor-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.doctor-info h4 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.doctor-dept {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #18a058;
}

.doctor-specialty {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.date-picker-wrapper :deep(.n-date-picker) {
  width: 100%;
}

.date-hint {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #999;
}

.time-empty,
.time-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #999;
}

.time-empty p,
.time-loading p {
  margin: 10px 0 0 0;
  font-size: 13px;
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
  padding: 14px 8px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.slot-time {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.slot-status {
  font-size: 11px;
  margin-top: 6px;
}

.slot-status.status-available {
  color: #18a058;
}

.slot-status.status-normal {
  color: #18a058;
}

.slot-status.status-hot {
  color: #f0a020;
  font-weight: 500;
}

.slot-status.status-full {
  color: #999;
}

.slot-hot {
  font-size: 10px;
  color: #d03050;
  background: #fff0f0;
  padding: 2px 8px;
  border-radius: 10px;
  margin-top: 6px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.time-slot.active {
  border-color: #18a058;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.time-slot.active .slot-time {
  color: #18a058;
}

.time-slot.hot {
  border-color: #fbbf24;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.time-slot.hot.active {
  border-color: #18a058;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.time-slot.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #fafafa;
}

.time-slot.disabled .slot-time {
  color: #999;
}

.patient-section :deep(.n-form-item) {
  margin-bottom: 16px;
}

.patient-section :deep(.n-form-item:last-child) {
  margin-bottom: 0;
}

.submit-section {
  margin-top: 20px;
  padding-bottom: 20px;
}

.submit-section :deep(.n-button) {
  height: 48px;
  font-size: 16px;
  border-radius: 12px;
}
</style>
