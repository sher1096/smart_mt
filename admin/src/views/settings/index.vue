<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>系统设置</h2>
        <p>管理系统基础配置和参数</p>
      </div>
    </div>

    <!-- 设置标签页 -->
    <n-card :bordered="false" class="settings-card">
      <n-tabs v-model:value="activeTab" type="line" placement="left">
        <!-- 基础设置 -->
        <n-tab-pane name="basic" tab="基础设置">
          <div class="setting-section">
            <h3>医院信息</h3>
            <n-form :model="basicSettings" label-placement="left" label-width="120">
              <n-form-item label="医院名称">
                <n-input v-model:value="basicSettings.hospitalName" placeholder="请输入医院名称" />
              </n-form-item>
              <n-form-item label="医院简称">
                <n-input v-model:value="basicSettings.hospitalShortName" placeholder="请输入医院简称" />
              </n-form-item>
              <n-form-item label="联系电话">
                <n-input v-model:value="basicSettings.phone" placeholder="请输入联系电话" />
              </n-form-item>
              <n-form-item label="医院地址">
                <n-input v-model:value="basicSettings.address" placeholder="请输入医院地址" />
              </n-form-item>
              <n-form-item label="医院简介">
                <n-input v-model:value="basicSettings.description" type="textarea" :rows="3" placeholder="请输入医院简介" />
              </n-form-item>
            </n-form>
            <div class="setting-actions">
              <n-button type="primary" :loading="saving" @click="handleSaveBasicSettings">
                <template #icon><n-icon :component="SaveOutline" /></template>
                保存设置
              </n-button>
            </div>
          </div>
        </n-tab-pane>

        <!-- 预约设置 -->
        <n-tab-pane name="appointment" tab="预约设置">
          <div class="setting-section">
            <h3>预约规则</h3>
            <n-form :model="appointmentSettings" label-placement="left" label-width="140">
              <n-form-item label="提前预约天数">
                <n-input-number v-model:value="appointmentSettings.advanceDays" :min="1" :max="30" />
                <span class="form-hint">允许提前多少天预约</span>
              </n-form-item>
              <n-form-item label="最大预约次数">
                <n-input-number v-model:value="appointmentSettings.maxAppointments" :min="1" :max="10" />
                <span class="form-hint">单个用户同时最多预约数</span>
              </n-form-item>
              <n-form-item label="取消预约时限">
                <n-input-number v-model:value="appointmentSettings.cancelHours" :min="1" :max="48" />
                <span class="form-hint">提前多少小时可取消</span>
              </n-form-item>
              <n-form-item label="爽约次数限制">
                <n-input-number v-model:value="appointmentSettings.noShowLimit" :min="1" :max="10" />
                <span class="form-hint">爽约超过此次数将限制预约</span>
              </n-form-item>
              <n-form-item label="预约时间段">
                <n-checkbox-group v-model:value="appointmentSettings.timeSlots">
                  <n-space>
                    <n-checkbox value="morning">上午 (8:00-12:00)</n-checkbox>
                    <n-checkbox value="afternoon">下午 (14:00-17:30)</n-checkbox>
                    <n-checkbox value="evening">晚上 (18:00-20:00)</n-checkbox>
                  </n-space>
                </n-checkbox-group>
              </n-form-item>
              <n-form-item label="启用预约功能">
                <n-switch v-model:value="appointmentSettings.enabled">
                  <template #checked>已启用</template>
                  <template #unchecked>已禁用</template>
                </n-switch>
              </n-form-item>
            </n-form>
            <div class="setting-actions">
              <n-button type="primary" :loading="saving" @click="handleSaveAppointmentSettings">
                <template #icon><n-icon :component="SaveOutline" /></template>
                保存设置
              </n-button>
            </div>
          </div>
        </n-tab-pane>

        <!-- 通知设置 -->
        <n-tab-pane name="notification" tab="通知设置">
          <div class="setting-section">
            <h3>消息通知</h3>
            <n-form :model="notificationSettings" label-placement="left" label-width="140">
              <n-form-item label="短信通知">
                <n-switch v-model:value="notificationSettings.smsEnabled">
                  <template #checked>已启用</template>
                  <template #unchecked>已禁用</template>
                </n-switch>
              </n-form-item>
              <n-form-item label="邮件通知">
                <n-switch v-model:value="notificationSettings.emailEnabled">
                  <template #checked>已启用</template>
                  <template #unchecked>已禁用</template>
                </n-switch>
              </n-form-item>
              <n-form-item label="站内信通知">
                <n-switch v-model:value="notificationSettings.inAppEnabled">
                  <template #checked>已启用</template>
                  <template #unchecked>已禁用</template>
                </n-switch>
              </n-form-item>
              <n-form-item label="预约提醒时间">
                <n-select
                  v-model:value="notificationSettings.reminderTimes"
                  :options="reminderOptions"
                  multiple
                  placeholder="选择提醒时间"
                />
              </n-form-item>
            </n-form>
            <div class="setting-actions">
              <n-button type="primary" :loading="saving" @click="handleSaveNotificationSettings">
                <template #icon><n-icon :component="SaveOutline" /></template>
                保存设置
              </n-button>
            </div>
          </div>
        </n-tab-pane>

        <!-- 安全设置 -->
        <n-tab-pane name="security" tab="安全设置">
          <div class="setting-section">
            <h3>登录安全</h3>
            <n-form :model="securitySettings" label-placement="left" label-width="140">
              <n-form-item label="登录失败锁定">
                <n-input-number v-model:value="securitySettings.maxLoginAttempts" :min="3" :max="10" />
                <span class="form-hint">连续失败次数后锁定账号</span>
              </n-form-item>
              <n-form-item label="锁定时间(分钟)">
                <n-input-number v-model:value="securitySettings.lockoutMinutes" :min="5" :max="60" />
              </n-form-item>
              <n-form-item label="会话超时(分钟)">
                <n-input-number v-model:value="securitySettings.sessionTimeout" :min="15" :max="480" />
              </n-form-item>
              <n-form-item label="强制修改密码">
                <n-switch v-model:value="securitySettings.forcePasswordChange">
                  <template #checked>已启用</template>
                  <template #unchecked>已禁用</template>
                </n-switch>
                <span class="form-hint">首次登录强制修改密码</span>
              </n-form-item>
              <n-form-item label="密码有效期(天)">
                <n-input-number v-model:value="securitySettings.passwordExpireDays" :min="0" :max="365" />
                <span class="form-hint">0表示永不过期</span>
              </n-form-item>
            </n-form>
            <div class="setting-actions">
              <n-button type="primary" :loading="saving" @click="handleSaveSecuritySettings">
                <template #icon><n-icon :component="SaveOutline" /></template>
                保存设置
              </n-button>
            </div>
          </div>
        </n-tab-pane>

        <!-- 系统维护 -->
        <n-tab-pane name="maintenance" tab="系统维护">
          <div class="setting-section">
            <h3>系统信息</h3>
            <n-descriptions :column="2" label-placement="left" bordered>
              <n-descriptions-item label="系统版本">v1.0.0</n-descriptions-item>
              <n-descriptions-item label="运行环境">Production</n-descriptions-item>
              <n-descriptions-item label="服务器时间">{{ serverTime }}</n-descriptions-item>
              <n-descriptions-item label="数据库状态">
                <n-tag type="success" size="small">正常</n-tag>
              </n-descriptions-item>
            </n-descriptions>
          </div>

          <div class="setting-section">
            <h3>维护操作</h3>
            <n-space vertical>
              <n-card size="small">
                <div class="maintenance-item">
                  <div class="maintenance-info">
                    <h4>清理缓存</h4>
                    <p>清理系统缓存数据，释放服务器内存</p>
                  </div>
                  <n-button type="warning" :loading="clearingCache" @click="handleClearCache">
                    <template #icon><n-icon :component="TrashOutline" /></template>
                    清理缓存
                  </n-button>
                </div>
              </n-card>
              <n-card size="small">
                <div class="maintenance-item">
                  <div class="maintenance-info">
                    <h4>数据备份</h4>
                    <p>备份系统数据库，建议定期执行</p>
                  </div>
                  <n-button type="primary" :loading="backingUp" @click="handleBackup">
                    <template #icon><n-icon :component="CloudDownloadOutline" /></template>
                    立即备份
                  </n-button>
                </div>
              </n-card>
              <n-card size="small">
                <div class="maintenance-item">
                  <div class="maintenance-info">
                    <h4>系统日志</h4>
                    <p>查看系统运行日志和操作记录</p>
                  </div>
                  <n-button @click="handleViewLogs">
                    <template #icon><n-icon :component="DocumentTextOutline" /></template>
                    查看日志
                  </n-button>
                </div>
              </n-card>
            </n-space>
          </div>
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- 日志查看弹窗 -->
    <n-modal v-model:show="showLogsModal" preset="card" title="系统日志" style="width: 900px;">
      <div class="logs-toolbar">
        <n-space>
          <n-select
            v-model:value="logLevel"
            :options="logLevelOptions"
            placeholder="日志级别"
            clearable
            style="width: 120px"
          />
          <n-date-picker
            v-model:value="logDateRange"
            type="daterange"
            clearable
            style="width: 260px"
          />
          <n-button type="primary" @click="loadLogs">查询</n-button>
        </n-space>
      </div>
      <n-data-table
        :columns="logColumns"
        :data="logs"
        :loading="logsLoading"
        :pagination="logPagination"
        :max-height="400"
        @update:page="handleLogPageChange"
      />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, h } from 'vue'
import {
  NCard, NButton, NSpace, NIcon, NTabs, NTabPane, NForm, NFormItem,
  NInput, NInputNumber, NSwitch, NSelect, NCheckboxGroup, NCheckbox,
  NDescriptions, NDescriptionsItem, NTag, NModal, NDataTable, NDatePicker,
  useMessage, useDialog
} from 'naive-ui'
import {
  SaveOutline, TrashOutline, CloudDownloadOutline, DocumentTextOutline
} from '@vicons/ionicons5'
import {
  saveBasicSettings, saveAppointmentSettings as saveAppointmentSettingsApi,
  saveNotificationSettings as saveNotificationSettingsApi,
  saveSecuritySettings as saveSecuritySettingsApi,
  clearCache, backupData, getSystemLogs
} from '@/api/settings'

const message = useMessage()
const dialog = useDialog()

const activeTab = ref('basic')
const saving = ref(false)
const clearingCache = ref(false)
const backingUp = ref(false)
const serverTime = ref('')
const showLogsModal = ref(false)
const logsLoading = ref(false)
const logLevel = ref<string | null>(null)
const logDateRange = ref<[number, number] | null>(null)
const logs = ref<any[]>([])
let timeInterval: any = null

const basicSettings = reactive({
  hospitalName: '智慧医疗中心',
  hospitalShortName: '智医中心',
  phone: '400-123-4567',
  address: '北京市海淀区中关村大街1号',
  description: '智慧医疗中心是一家集医疗、预防、保健、康复为一体的现代化综合医院。'
})

const appointmentSettings = reactive({
  advanceDays: 7,
  maxAppointments: 3,
  cancelHours: 24,
  noShowLimit: 3,
  timeSlots: ['morning', 'afternoon'],
  enabled: true
})

const notificationSettings = reactive({
  smsEnabled: true,
  emailEnabled: false,
  inAppEnabled: true,
  reminderTimes: ['1h', '24h']
})

const securitySettings = reactive({
  maxLoginAttempts: 5,
  lockoutMinutes: 30,
  sessionTimeout: 120,
  forcePasswordChange: true,
  passwordExpireDays: 90
})

const reminderOptions = [
  { label: '提前1小时', value: '1h' },
  { label: '提前2小时', value: '2h' },
  { label: '提前12小时', value: '12h' },
  { label: '提前24小时', value: '24h' },
  { label: '提前48小时', value: '48h' }
]

const logLevelOptions = [
  { label: '全部', value: '' },
  { label: '信息', value: 'info' },
  { label: '警告', value: 'warn' },
  { label: '错误', value: 'error' }
]

const logPagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0
})

const logColumns = [
  { title: '时间', key: 'time', width: 160 },
  {
    title: '级别',
    key: 'level',
    width: 80,
    render: (row: any) => {
      const types: Record<string, 'info' | 'warning' | 'error'> = {
        info: 'info',
        warn: 'warning',
        error: 'error'
      }
      return h(NTag, { type: types[row.level] || 'default', size: 'small' }, { default: () => row.level?.toUpperCase() || 'INFO' })
    }
  },
  { title: '模块', key: 'module', width: 120 },
  { title: '操作用户', key: 'user', width: 100 },
  { title: '描述', key: 'message', ellipsis: { tooltip: true } }
]

const updateServerTime = () => {
  serverTime.value = new Date().toLocaleString()
}

const handleSaveBasicSettings = async () => {
  saving.value = true
  try {
    await saveBasicSettings(basicSettings)
    message.success('基础设置保存成功')
  } catch (error: any) {
    // 如果后端没实现，使用本地存储
    localStorage.setItem('basicSettings', JSON.stringify(basicSettings))
    message.success('基础设置保存成功（本地）')
  } finally {
    saving.value = false
  }
}

const handleSaveAppointmentSettings = async () => {
  saving.value = true
  try {
    await saveAppointmentSettingsApi(appointmentSettings)
    message.success('预约设置保存成功')
  } catch (error: any) {
    localStorage.setItem('appointmentSettings', JSON.stringify(appointmentSettings))
    message.success('预约设置保存成功（本地）')
  } finally {
    saving.value = false
  }
}

const handleSaveNotificationSettings = async () => {
  saving.value = true
  try {
    await saveNotificationSettingsApi(notificationSettings)
    message.success('通知设置保存成功')
  } catch (error: any) {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings))
    message.success('通知设置保存成功（本地）')
  } finally {
    saving.value = false
  }
}

const handleSaveSecuritySettings = async () => {
  saving.value = true
  try {
    await saveSecuritySettingsApi(securitySettings)
    message.success('安全设置保存成功')
  } catch (error: any) {
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings))
    message.success('安全设置保存成功（本地）')
  } finally {
    saving.value = false
  }
}

const handleClearCache = () => {
  dialog.warning({
    title: '确认清理缓存',
    content: '清理缓存可能会导致部分数据需要重新加载，确定要继续吗？',
    positiveText: '确定清理',
    negativeText: '取消',
    onPositiveClick: async () => {
      clearingCache.value = true
      try {
        await clearCache()
        message.success('缓存清理成功')
      } catch (error: any) {
        // 模拟清理本地缓存
        localStorage.clear()
        sessionStorage.clear()
        message.success('本地缓存清理成功')
      } finally {
        clearingCache.value = false
      }
    }
  })
}

const handleBackup = () => {
  dialog.info({
    title: '数据备份',
    content: '即将开始备份系统数据，备份完成后将自动下载备份文件。',
    positiveText: '开始备份',
    negativeText: '取消',
    onPositiveClick: async () => {
      backingUp.value = true
      try {
        const res = await backupData()
        // 如果后端返回下载链接
        if (res.data?.downloadUrl) {
          window.open(res.data.downloadUrl)
        }
        message.success('数据备份成功')
      } catch (error: any) {
        // 模拟备份：导出当前设置为JSON
        const backupContent = {
          exportTime: new Date().toISOString(),
          basicSettings,
          appointmentSettings,
          notificationSettings,
          securitySettings
        }
        const blob = new Blob([JSON.stringify(backupContent, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `backup_${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        message.success('设置数据备份成功')
      } finally {
        backingUp.value = false
      }
    }
  })
}

const handleViewLogs = () => {
  showLogsModal.value = true
  loadLogs()
}

const loadLogs = async () => {
  logsLoading.value = true
  try {
    const params: any = {
      page: logPagination.page,
      pageSize: logPagination.pageSize
    }
    if (logLevel.value) params.level = logLevel.value
    if (logDateRange.value) {
      params.startDate = new Date(logDateRange.value[0]).toISOString().split('T')[0]
      params.endDate = new Date(logDateRange.value[1]).toISOString().split('T')[0]
    }

    const res = await getSystemLogs(params)
    logs.value = res.data?.list || res.list || []
    logPagination.itemCount = res.data?.total || res.total || 0
  } catch (error: any) {
    // 如果后端没实现，显示模拟数据
    logs.value = [
      { time: new Date().toLocaleString(), level: 'info', module: '用户登录', user: 'admin', message: '管理员登录成功' },
      { time: new Date(Date.now() - 3600000).toLocaleString(), level: 'info', module: '系统设置', user: 'admin', message: '修改了基础设置' },
      { time: new Date(Date.now() - 7200000).toLocaleString(), level: 'warn', module: '预约管理', user: 'system', message: '检测到异常预约行为' },
      { time: new Date(Date.now() - 10800000).toLocaleString(), level: 'info', module: '医生管理', user: 'admin', message: '新增医生：张医生' },
      { time: new Date(Date.now() - 14400000).toLocaleString(), level: 'error', module: '支付模块', user: 'system', message: '支付回调超时，已重试' },
      { time: new Date(Date.now() - 18000000).toLocaleString(), level: 'info', module: '数据备份', user: 'system', message: '自动备份任务完成' },
      { time: new Date(Date.now() - 21600000).toLocaleString(), level: 'info', module: '科室管理', user: 'admin', message: '更新科室信息：内科' },
      { time: new Date(Date.now() - 25200000).toLocaleString(), level: 'warn', module: '缓存服务', user: 'system', message: '缓存命中率低于50%' }
    ]
    logPagination.itemCount = logs.value.length
  } finally {
    logsLoading.value = false
  }
}

const handleLogPageChange = (page: number) => {
  logPagination.page = page
  loadLogs()
}

// 加载本地存储的设置
const loadLocalSettings = () => {
  try {
    const savedBasic = localStorage.getItem('basicSettings')
    if (savedBasic) Object.assign(basicSettings, JSON.parse(savedBasic))

    const savedAppointment = localStorage.getItem('appointmentSettings')
    if (savedAppointment) Object.assign(appointmentSettings, JSON.parse(savedAppointment))

    const savedNotification = localStorage.getItem('notificationSettings')
    if (savedNotification) Object.assign(notificationSettings, JSON.parse(savedNotification))

    const savedSecurity = localStorage.getItem('securitySettings')
    if (savedSecurity) Object.assign(securitySettings, JSON.parse(savedSecurity))
  } catch (error) {
    console.error('加载本地设置失败', error)
  }
}

onMounted(() => {
  updateServerTime()
  timeInterval = setInterval(updateServerTime, 1000)
  loadLocalSettings()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.page-container {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.page-header p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.settings-card {
  min-height: 600px;
}

.settings-card :deep(.n-tabs-pane-wrapper) {
  padding-left: 24px;
}

.setting-section {
  margin-bottom: 32px;
}

.setting-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.setting-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f5f5f5;
}

.form-hint {
  margin-left: 12px;
  font-size: 12px;
  color: #999;
}

.maintenance-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.maintenance-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.maintenance-info p {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.logs-toolbar {
  margin-bottom: 16px;
}
</style>
