<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header-card">
      <div class="page-header-content">
        <div class="page-header-info">
          <div class="page-header-icon">
            <n-icon :component="SettingsOutline" :size="28" color="#fff" />
          </div>
          <div class="page-header-text">
            <h1>系统设置</h1>
            <p>管理系统基础配置、预约规则、通知和安全参数</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置内容 -->
    <div class="settings-layout">
      <!-- 左侧菜单 -->
      <div class="settings-menu">
        <div
          v-for="menu in settingMenus"
          :key="menu.key"
          class="menu-item"
          :class="{ active: activeTab === menu.key }"
          @click="activeTab = menu.key"
        >
          <div class="menu-icon" :style="{ background: menu.iconBg }">
            <n-icon :component="menu.icon" :size="18" color="#fff" />
          </div>
          <div class="menu-text">
            <div class="menu-title">{{ menu.title }}</div>
            <div class="menu-desc">{{ menu.desc }}</div>
          </div>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="settings-content">
        <!-- 基础设置 -->
        <div v-show="activeTab === 'basic'" class="setting-panel">
          <div class="panel-header">
            <h3>医院基本信息</h3>
            <p>设置医院的基础信息，这些信息将显示在系统各处</p>
          </div>
          <n-form :model="basicSettings" label-placement="left" label-width="100" class="setting-form">
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
              <n-input v-model:value="basicSettings.description" type="textarea" :rows="4" placeholder="请输入医院简介" />
            </n-form-item>
          </n-form>
          <div class="panel-footer">
            <n-button type="primary" :loading="saving" @click="handleSaveBasicSettings">
              <template #icon><n-icon :component="SaveOutline" /></template>
              保存设置
            </n-button>
          </div>
        </div>

        <!-- 预约设置 -->
        <div v-show="activeTab === 'appointment'" class="setting-panel">
          <div class="panel-header">
            <h3>预约规则配置</h3>
            <p>配置患者预约挂号的各项规则和限制</p>
          </div>
          <n-form :model="appointmentSettings" label-placement="left" label-width="120" class="setting-form">
            <div class="form-group">
              <div class="form-group-title">预约限制</div>
              <n-form-item label="提前预约天数">
                <n-input-number v-model:value="appointmentSettings.advanceDays" :min="1" :max="30" style="width: 180px" />
                <span class="form-hint">允许提前多少天预约</span>
              </n-form-item>
              <n-form-item label="最大预约次数">
                <n-input-number v-model:value="appointmentSettings.maxAppointments" :min="1" :max="10" style="width: 180px" />
                <span class="form-hint">单个用户同时最多预约数</span>
              </n-form-item>
              <n-form-item label="取消预约时限">
                <n-input-number v-model:value="appointmentSettings.cancelHours" :min="1" :max="48" style="width: 180px" />
                <span class="form-hint">提前多少小时可取消</span>
              </n-form-item>
              <n-form-item label="爽约次数限制">
                <n-input-number v-model:value="appointmentSettings.noShowLimit" :min="1" :max="10" style="width: 180px" />
                <span class="form-hint">爽约超过此次数将限制预约</span>
              </n-form-item>
            </div>
            <div class="form-group">
              <div class="form-group-title">预约时段</div>
              <n-form-item label="可预约时段">
                <n-checkbox-group v-model:value="appointmentSettings.timeSlots">
                  <n-space>
                    <n-checkbox value="morning" label="上午 (8:00-12:00)" />
                    <n-checkbox value="afternoon" label="下午 (14:00-17:30)" />
                    <n-checkbox value="evening" label="晚上 (18:00-20:00)" />
                  </n-space>
                </n-checkbox-group>
              </n-form-item>
              <n-form-item label="启用预约功能">
                <n-switch v-model:value="appointmentSettings.enabled">
                  <template #checked>已启用</template>
                  <template #unchecked>已禁用</template>
                </n-switch>
              </n-form-item>
            </div>
          </n-form>
          <div class="panel-footer">
            <n-button type="primary" :loading="saving" @click="handleSaveAppointmentSettings">
              <template #icon><n-icon :component="SaveOutline" /></template>
              保存设置
            </n-button>
          </div>
        </div>

        <!-- 通知设置 -->
        <div v-show="activeTab === 'notification'" class="setting-panel">
          <div class="panel-header">
            <h3>消息通知配置</h3>
            <p>配置系统的各类通知方式和提醒时间</p>
          </div>
          <n-form :model="notificationSettings" label-placement="left" label-width="120" class="setting-form">
            <div class="form-group">
              <div class="form-group-title">通知渠道</div>
              <div class="notification-channels">
                <div class="channel-item" :class="{ active: notificationSettings.smsEnabled }">
                  <div class="channel-icon sms">
                    <n-icon :component="ChatbubbleOutline" :size="24" />
                  </div>
                  <div class="channel-info">
                    <div class="channel-name">短信通知</div>
                    <div class="channel-desc">发送短信提醒患者预约信息</div>
                  </div>
                  <n-switch v-model:value="notificationSettings.smsEnabled" />
                </div>
                <div class="channel-item" :class="{ active: notificationSettings.emailEnabled }">
                  <div class="channel-icon email">
                    <n-icon :component="MailOutline" :size="24" />
                  </div>
                  <div class="channel-info">
                    <div class="channel-name">邮件通知</div>
                    <div class="channel-desc">发送邮件提醒患者预约信息</div>
                  </div>
                  <n-switch v-model:value="notificationSettings.emailEnabled" />
                </div>
                <div class="channel-item" :class="{ active: notificationSettings.inAppEnabled }">
                  <div class="channel-icon inapp">
                    <n-icon :component="NotificationsOutline" :size="24" />
                  </div>
                  <div class="channel-info">
                    <div class="channel-name">站内信通知</div>
                    <div class="channel-desc">系统内消息通知</div>
                  </div>
                  <n-switch v-model:value="notificationSettings.inAppEnabled" />
                </div>
              </div>
            </div>
            <div class="form-group">
              <div class="form-group-title">提醒时间</div>
              <n-form-item label="预约提醒时间">
                <n-select
                  v-model:value="notificationSettings.reminderTimes"
                  :options="reminderOptions"
                  multiple
                  placeholder="选择提醒时间"
                  style="width: 320px"
                />
              </n-form-item>
            </div>
          </n-form>
          <div class="panel-footer">
            <n-button type="primary" :loading="saving" @click="handleSaveNotificationSettings">
              <template #icon><n-icon :component="SaveOutline" /></template>
              保存设置
            </n-button>
          </div>
        </div>

        <!-- 安全设置 -->
        <div v-show="activeTab === 'security'" class="setting-panel">
          <div class="panel-header">
            <h3>安全配置</h3>
            <p>配置系统登录安全策略和密码规则</p>
          </div>
          <n-form :model="securitySettings" label-placement="left" label-width="140" class="setting-form">
            <div class="form-group">
              <div class="form-group-title">登录安全</div>
              <n-form-item label="登录失败锁定">
                <n-input-number v-model:value="securitySettings.maxLoginAttempts" :min="3" :max="10" style="width: 180px" />
                <span class="form-hint">连续失败次数后锁定账号</span>
              </n-form-item>
              <n-form-item label="锁定时间(分钟)">
                <n-input-number v-model:value="securitySettings.lockoutMinutes" :min="5" :max="60" style="width: 180px" />
              </n-form-item>
              <n-form-item label="会话超时(分钟)">
                <n-input-number v-model:value="securitySettings.sessionTimeout" :min="15" :max="480" style="width: 180px" />
              </n-form-item>
            </div>
            <div class="form-group">
              <div class="form-group-title">密码策略</div>
              <n-form-item label="强制修改密码">
                <n-switch v-model:value="securitySettings.forcePasswordChange">
                  <template #checked>已启用</template>
                  <template #unchecked>已禁用</template>
                </n-switch>
                <span class="form-hint">首次登录强制修改密码</span>
              </n-form-item>
              <n-form-item label="密码有效期(天)">
                <n-input-number v-model:value="securitySettings.passwordExpireDays" :min="0" :max="365" style="width: 180px" />
                <span class="form-hint">0表示永不过期</span>
              </n-form-item>
            </div>
          </n-form>
          <div class="panel-footer">
            <n-button type="primary" :loading="saving" @click="handleSaveSecuritySettings">
              <template #icon><n-icon :component="SaveOutline" /></template>
              保存设置
            </n-button>
          </div>
        </div>

        <!-- 系统维护 -->
        <div v-show="activeTab === 'maintenance'" class="setting-panel">
          <div class="panel-header">
            <h3>系统维护</h3>
            <p>查看系统状态并执行维护操作</p>
          </div>

          <div class="system-info-grid">
            <div class="info-card">
              <div class="info-icon" style="background: linear-gradient(135deg, #18a058, #36ad6a)">
                <n-icon :component="ServerOutline" :size="22" color="#fff" />
              </div>
              <div class="info-content">
                <div class="info-label">系统版本</div>
                <div class="info-value">v2.0.0</div>
              </div>
            </div>
            <div class="info-card">
              <div class="info-icon" style="background: linear-gradient(135deg, #2080f0, #36a2eb)">
                <n-icon :component="CloudOutline" :size="22" color="#fff" />
              </div>
              <div class="info-content">
                <div class="info-label">运行环境</div>
                <div class="info-value">Production</div>
              </div>
            </div>
            <div class="info-card">
              <div class="info-icon" style="background: linear-gradient(135deg, #f0a020, #ffc107)">
                <n-icon :component="TimeOutline" :size="22" color="#fff" />
              </div>
              <div class="info-content">
                <div class="info-label">服务器时间</div>
                <div class="info-value">{{ serverTime }}</div>
              </div>
            </div>
            <div class="info-card">
              <div class="info-icon" style="background: linear-gradient(135deg, #7c3aed, #a855f7)">
                <n-icon :component="LayersOutline" :size="22" color="#fff" />
              </div>
              <div class="info-content">
                <div class="info-label">数据库状态</div>
                <div class="info-value">
                  <n-tag type="success" size="small" round>正常运行</n-tag>
                </div>
              </div>
            </div>
          </div>

          <div class="maintenance-actions">
            <div class="action-card" @click="handleClearCache">
              <div class="action-icon" style="background: rgba(240, 160, 32, 0.1); color: #f0a020">
                <n-icon :component="TrashOutline" :size="24" />
              </div>
              <div class="action-info">
                <div class="action-title">清理缓存</div>
                <div class="action-desc">清理系统缓存数据，释放服务器内存</div>
              </div>
              <n-spin v-if="clearingCache" size="small" />
              <n-icon v-else :component="ChevronForwardOutline" :size="18" color="#ccc" />
            </div>
            <div class="action-card" @click="handleBackup">
              <div class="action-icon" style="background: rgba(24, 160, 88, 0.1); color: #18a058">
                <n-icon :component="CloudDownloadOutline" :size="24" />
              </div>
              <div class="action-info">
                <div class="action-title">数据备份</div>
                <div class="action-desc">备份系统数据库，建议定期执行</div>
              </div>
              <n-spin v-if="backingUp" size="small" />
              <n-icon v-else :component="ChevronForwardOutline" :size="18" color="#ccc" />
            </div>
            <div class="action-card" @click="handleViewLogs">
              <div class="action-icon" style="background: rgba(32, 128, 240, 0.1); color: #2080f0">
                <n-icon :component="DocumentTextOutline" :size="24" />
              </div>
              <div class="action-info">
                <div class="action-title">系统日志</div>
                <div class="action-desc">查看系统运行日志和操作记录</div>
              </div>
              <n-icon :component="ChevronForwardOutline" :size="18" color="#ccc" />
            </div>
          </div>
        </div>

        <!-- 帮助中心 -->
        <div v-show="activeTab === 'help'" class="setting-panel">
          <div class="panel-header">
            <h3>帮助中心</h3>
            <p>查看系统使用指南和常见问题解答</p>
          </div>

          <div class="help-search">
            <n-input v-model:value="helpSearchText" placeholder="搜索帮助内容..." size="large" clearable>
              <template #prefix><n-icon :component="SearchOutline" /></template>
            </n-input>
          </div>

          <div class="help-categories">
            <div class="category-card" v-for="category in helpCategories" :key="category.title">
              <div class="category-icon" :style="{ background: category.iconBg }">
                <n-icon :component="category.icon" :size="24" color="#fff" />
              </div>
              <div class="category-title">{{ category.title }}</div>
              <div class="category-desc">{{ category.desc }}</div>
              <n-button text type="primary" @click="showHelpDetail(category)">
                查看详情 <n-icon :component="ArrowForwardOutline" :size="14" />
              </n-button>
            </div>
          </div>

          <div class="faq-section">
            <h4>常见问题</h4>
            <n-collapse>
              <n-collapse-item v-for="(faq, index) in faqs" :key="index" :title="faq.question" :name="index">
                <div class="faq-answer">{{ faq.answer }}</div>
              </n-collapse-item>
            </n-collapse>
          </div>

          <div class="contact-support">
            <div class="support-card">
              <n-icon :component="CallOutline" :size="32" color="#18a058" />
              <div class="support-info">
                <div class="support-title">电话支持</div>
                <div class="support-value">400-123-4567</div>
                <div class="support-desc">工作日 9:00-18:00</div>
              </div>
            </div>
            <div class="support-card">
              <n-icon :component="MailOutline" :size="32" color="#2080f0" />
              <div class="support-info">
                <div class="support-title">邮件支持</div>
                <div class="support-value">support@smartmt.com</div>
                <div class="support-desc">24小时内回复</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 日志查看弹窗 -->
    <n-modal v-model:show="showLogsModal" preset="card" title="系统日志" style="width: 900px; max-width: 95vw;">
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
        :scroll-x="800"
        @update:page="handleLogPageChange"
      />
    </n-modal>

    <!-- 帮助详情弹窗 -->
    <n-modal v-model:show="showHelpModal" preset="card" :title="currentHelpCategory?.title" style="width: 700px; max-width: 95vw;">
      <div class="help-detail-content" v-if="currentHelpCategory">
        <div v-for="(item, index) in currentHelpCategory.items" :key="index" class="help-item">
          <div class="help-item-title">
            <n-icon :component="CheckmarkCircleOutline" :size="18" color="#18a058" />
            {{ item.title }}
          </div>
          <div class="help-item-content">{{ item.content }}</div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, h } from 'vue'
import {
  NCard, NButton, NSpace, NIcon, NForm, NFormItem,
  NInput, NInputNumber, NSwitch, NSelect, NCheckboxGroup, NCheckbox,
  NTag, NModal, NDataTable, NDatePicker, NCollapse, NCollapseItem, NSpin,
  useMessage, useDialog
} from 'naive-ui'
import {
  SaveOutline, TrashOutline, CloudDownloadOutline, DocumentTextOutline,
  SettingsOutline, BusinessOutline, CalendarOutline, NotificationsOutline,
  ShieldCheckmarkOutline, ConstructOutline, HelpCircleOutline, ServerOutline,
  CloudOutline, TimeOutline, LayersOutline, ChevronForwardOutline, SearchOutline,
  BookOutline, PeopleOutline, CardOutline, ChatbubbleOutline, MailOutline,
  ArrowForwardOutline, CallOutline, CheckmarkCircleOutline, ClipboardOutline,
  MedkitOutline
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
const showHelpModal = ref(false)
const logsLoading = ref(false)
const logLevel = ref<string | null>(null)
const logDateRange = ref<[number, number] | null>(null)
const logs = ref<any[]>([])
const helpSearchText = ref('')
const currentHelpCategory = ref<any>(null)
let timeInterval: any = null

// 设置菜单
const settingMenus = [
  { key: 'basic', title: '基础设置', desc: '医院基本信息配置', icon: BusinessOutline, iconBg: 'linear-gradient(135deg, #18a058, #36ad6a)' },
  { key: 'appointment', title: '预约设置', desc: '预约规则和限制', icon: CalendarOutline, iconBg: 'linear-gradient(135deg, #2080f0, #36a2eb)' },
  { key: 'notification', title: '通知设置', desc: '消息通知配置', icon: NotificationsOutline, iconBg: 'linear-gradient(135deg, #f0a020, #ffc107)' },
  { key: 'security', title: '安全设置', desc: '登录和密码策略', icon: ShieldCheckmarkOutline, iconBg: 'linear-gradient(135deg, #d03050, #f43f5e)' },
  { key: 'maintenance', title: '系统维护', desc: '维护和备份操作', icon: ConstructOutline, iconBg: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
  { key: 'help', title: '帮助中心', desc: '使用指南和FAQ', icon: HelpCircleOutline, iconBg: 'linear-gradient(135deg, #06b6d4, #22d3ee)' }
]

// 帮助分类
const helpCategories = [
  {
    title: '快速入门',
    desc: '了解系统基本操作流程',
    icon: BookOutline,
    iconBg: 'linear-gradient(135deg, #18a058, #36ad6a)',
    items: [
      { title: '登录系统', content: '使用管理员账号登录系统，首次登录建议修改默认密码。' },
      { title: '仪表盘概览', content: '仪表盘显示今日预约、待处理事项等关键数据，方便快速了解医院运营状态。' },
      { title: '基本导航', content: '左侧菜单可快速切换各功能模块，点击顶部面包屑可返回上级页面。' }
    ]
  },
  {
    title: '预约管理',
    desc: '预约挂号操作指南',
    icon: ClipboardOutline,
    iconBg: 'linear-gradient(135deg, #2080f0, #36a2eb)',
    items: [
      { title: '查看预约列表', content: '在挂号管理页面可以查看所有预约记录，支持按状态、日期、科室筛选。' },
      { title: '处理预约', content: '点击预约记录可查看详情，可以确认、取消或标记完成预约。' },
      { title: '预约统计', content: '仪表盘展示预约数据统计，包括今日预约数、待确认数等。' }
    ]
  },
  {
    title: '医生排班',
    desc: '排班管理操作指南',
    icon: PeopleOutline,
    iconBg: 'linear-gradient(135deg, #f0a020, #ffc107)',
    items: [
      { title: '创建排班', content: '选择医生和日期，设置出诊时段和可预约人数，保存即可生效。' },
      { title: '批量排班', content: '支持按周重复设置排班，提高排班效率。' },
      { title: '排班调整', content: '可以随时编辑或删除未来的排班记录。' }
    ]
  },
  {
    title: '费用管理',
    desc: '缴费和退款指南',
    icon: CardOutline,
    iconBg: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    items: [
      { title: '查看缴费记录', content: '缴费管理页面显示所有费用记录，包括挂号费、检查费等。' },
      { title: '处理退款', content: '对于取消的预约，可以在缴费详情中发起退款申请。' },
      { title: '费用统计', content: '系统自动统计每日收入，方便财务对账。' }
    ]
  }
]

// 常见问题
const faqs = [
  { question: '如何重置管理员密码？', answer: '请联系系统超级管理员，在用户管理中重置密码。或者使用"忘记密码"功能通过邮箱验证重置。' },
  { question: '预约满了怎么加号？', answer: '在排班管理中找到对应的排班记录，编辑增加可预约人数即可。注意需要在预约时段开始前操作。' },
  { question: '如何导出数据报表？', answer: '大多数列表页面都支持导出功能，点击页面右上角的"导出"按钮，选择需要的格式即可下载。' },
  { question: '系统运行缓慢怎么办？', answer: '可以尝试清理浏览器缓存，或在系统维护中清理系统缓存。如问题持续，请联系技术支持。' },
  { question: '如何修改医院基本信息？', answer: '在系统设置 - 基础设置中，可以修改医院名称、地址、联系电话等基本信息。' }
]

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
      return h(NTag, { type: types[row.level] || 'default', size: 'small', round: true }, { default: () => row.level?.toUpperCase() || 'INFO' })
    }
  },
  { title: '模块', key: 'module', width: 120 },
  { title: '操作用户', key: 'user', width: 100 },
  { title: '描述', key: 'message', ellipsis: { tooltip: true } }
]

const updateServerTime = () => {
  serverTime.value = new Date().toLocaleString()
}

const showHelpDetail = (category: any) => {
  currentHelpCategory.value = category
  showHelpModal.value = true
}

const handleSaveBasicSettings = async () => {
  saving.value = true
  try {
    await saveBasicSettings(basicSettings)
    message.success('基础设置保存成功')
  } catch (error: any) {
    localStorage.setItem('basicSettings', JSON.stringify(basicSettings))
    message.success('基础设置保存成功')
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
    message.success('预约设置保存成功')
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
    message.success('通知设置保存成功')
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
    message.success('安全设置保存成功')
  } finally {
    saving.value = false
  }
}

const handleClearCache = () => {
  if (clearingCache.value) return
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
  if (backingUp.value) return
  dialog.info({
    title: '数据备份',
    content: '即将开始备份系统数据，备份完成后将自动下载备份文件。',
    positiveText: '开始备份',
    negativeText: '取消',
    onPositiveClick: async () => {
      backingUp.value = true
      try {
        const res = await backupData()
        if (res.data?.downloadUrl) {
          window.open(res.data.downloadUrl)
        }
        message.success('数据备份成功')
      } catch (error: any) {
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
    logs.value = [
      { time: new Date().toLocaleString(), level: 'info', module: '用户登录', user: 'admin', message: '管理员登录成功' },
      { time: new Date(Date.now() - 3600000).toLocaleString(), level: 'info', module: '系统设置', user: 'admin', message: '修改了基础设置' },
      { time: new Date(Date.now() - 7200000).toLocaleString(), level: 'warn', module: '预约管理', user: 'system', message: '检测到异常预约行为' },
      { time: new Date(Date.now() - 10800000).toLocaleString(), level: 'info', module: '医生管理', user: 'admin', message: '新增医生：张医生' },
      { time: new Date(Date.now() - 14400000).toLocaleString(), level: 'error', module: '支付模块', user: 'system', message: '支付回调超时，已重试' },
      { time: new Date(Date.now() - 18000000).toLocaleString(), level: 'info', module: '数据备份', user: 'system', message: '自动备份任务完成' }
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
/* 设置布局 */
.settings-layout {
  display: flex;
  gap: 20px;
  min-height: 600px;
}

/* 左侧菜单 */
.settings-menu {
  width: 260px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.menu-item:hover {
  background: #f8f9fa;
}

.menu-item.active {
  background: linear-gradient(135deg, rgba(24, 160, 88, 0.1), rgba(54, 173, 106, 0.05));
}

.menu-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-text {
  flex: 1;
  min-width: 0;
}

.menu-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.menu-desc {
  font-size: 12px;
  color: #999;
}

/* 右侧内容 */
.settings-content {
  flex: 1;
  min-width: 0;
}

.setting-panel {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.panel-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 6px 0;
}

.panel-header p {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.panel-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

/* 表单样式 */
.setting-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group-title {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid #18a058;
}

.form-hint {
  margin-left: 16px;
  font-size: 12px;
  color: #999;
}

/* 通知渠道 */
.notification-channels {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fafbfc;
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.channel-item.active {
  background: #fff;
  border-color: #18a058;
  box-shadow: 0 2px 8px rgba(24, 160, 88, 0.1);
}

.channel-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.channel-icon.sms { background: linear-gradient(135deg, #18a058, #36ad6a); }
.channel-icon.email { background: linear-gradient(135deg, #2080f0, #36a2eb); }
.channel-icon.inapp { background: linear-gradient(135deg, #f0a020, #ffc107); }

.channel-info {
  flex: 1;
}

.channel-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.channel-desc {
  font-size: 12px;
  color: #999;
}

/* 系统信息 */
.system-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #fafbfc;
  border-radius: 12px;
}

.info-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 维护操作 */
.maintenance-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: #fafbfc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-card:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-info {
  flex: 1;
}

.action-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 12px;
  color: #999;
}

/* 帮助中心 */
.help-search {
  margin-bottom: 24px;
}

.help-categories {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.category-card {
  padding: 20px;
  background: #fafbfc;
  border-radius: 14px;
  text-align: center;
  transition: all 0.2s ease;
}

.category-card:hover {
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.category-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.category-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.category-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

/* FAQ */
.faq-section {
  margin-bottom: 32px;
}

.faq-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.faq-answer {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

/* 联系支持 */
.contact-support {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.support-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fafbfc;
  border-radius: 14px;
}

.support-title {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.support-value {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.support-desc {
  font-size: 12px;
  color: #999;
}

/* 帮助详情 */
.help-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.help-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.help-item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.help-item-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  padding-left: 26px;
}

/* 日志工具栏 */
.logs-toolbar {
  margin-bottom: 16px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .system-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .help-categories {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .settings-layout {
    flex-direction: column;
  }

  .settings-menu {
    width: 100%;
    display: flex;
    overflow-x: auto;
    padding: 12px;
    gap: 8px;
  }

  .menu-item {
    flex-shrink: 0;
    padding: 10px 14px;
    margin-bottom: 0;
  }

  .menu-text {
    display: none;
  }

  .menu-icon {
    width: 36px;
    height: 36px;
  }

  .setting-panel {
    padding: 16px;
  }

  .system-info-grid {
    grid-template-columns: 1fr;
  }

  .help-categories {
    grid-template-columns: 1fr;
  }

  .contact-support {
    grid-template-columns: 1fr;
  }

  .channel-item {
    padding: 12px;
    gap: 12px;
  }

  .channel-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
