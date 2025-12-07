<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- 主内容区 -->
    <div class="login-content">
      <!-- 左侧品牌区 -->
      <div class="brand-section">
        <div class="brand-wrapper">
          <div class="logo-container">
            <div class="logo-icon">
              <n-icon :component="MedicalOutline" :size="40" color="#fff" />
            </div>
            <div class="logo-text">
              <h1>智慧医疗</h1>
              <span class="subtitle">Smart Medical System</span>
            </div>
          </div>

          <div class="brand-description">
            <h2>医院综合管理平台</h2>
            <p>一站式医疗服务管理解决方案，提升医院运营效率</p>
          </div>

          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-icon">
                <n-icon :component="PeopleOutline" :size="22" />
              </div>
              <div class="feature-text">
                <h4>患者管理</h4>
                <p>完善的患者档案与就诊记录管理</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <n-icon :component="CalendarOutline" :size="22" />
              </div>
              <div class="feature-text">
                <h4>预约挂号</h4>
                <p>智能排班与在线预约系统</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <n-icon :component="StatsChartOutline" :size="22" />
              </div>
              <div class="feature-text">
                <h4>数据分析</h4>
                <p>多维度运营数据统计分析</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <n-icon :component="ShieldCheckmarkOutline" :size="22" />
              </div>
              <div class="feature-text">
                <h4>安全可靠</h4>
                <p>医疗级数据安全保障体系</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录区 -->
      <div class="login-section">
        <div class="login-card">
          <div class="login-header">
            <div class="header-decoration"></div>
            <h3>管理员登录</h3>
            <p>请使用管理员账号登录系统</p>
          </div>

          <n-form
            ref="formRef"
            :model="formValue"
            :rules="rules"
            class="login-form"
          >
            <n-form-item path="username" label="用户名">
              <n-input
                v-model:value="formValue.username"
                placeholder="请输入用户名"
                size="large"
                @keydown.enter="handleLogin"
              >
                <template #prefix>
                  <n-icon :component="PersonOutline" class="input-icon" />
                </template>
              </n-input>
            </n-form-item>

            <n-form-item path="password" label="密码">
              <n-input
                v-model:value="formValue.password"
                type="password"
                show-password-on="click"
                placeholder="请输入密码"
                size="large"
                @keydown.enter="handleLogin"
              >
                <template #prefix>
                  <n-icon :component="LockClosedOutline" class="input-icon" />
                </template>
              </n-input>
            </n-form-item>

            <div class="form-options">
              <n-checkbox v-model:checked="rememberMe">
                <span class="remember-text">记住我的账号</span>
              </n-checkbox>
              <a href="javascript:;" class="forgot-link" @click="handleForgotPassword">忘记密码?</a>
            </div>

            <n-button
              type="primary"
              block
              size="large"
              :loading="loading"
              class="login-btn"
              @click="handleLogin"
            >
              <template v-if="!loading">
                <n-icon :component="LogInOutline" style="margin-right: 8px;" />
                登录系统
              </template>
              <template v-else>登录中...</template>
            </n-button>
          </n-form>

          <div class="login-divider">
            <span>演示账号</span>
          </div>

          <div class="demo-account">
            <div class="demo-item" @click="fillDemoAccount('admin', 'admin123')">
              <n-icon :component="PersonCircleOutline" :size="20" />
              <div class="demo-info">
                <span class="demo-label">超级管理员</span>
                <span class="demo-value">admin / admin123</span>
              </div>
              <n-icon :component="ArrowForwardOutline" :size="16" class="demo-arrow" />
            </div>
          </div>

          <div class="login-footer">
            <p>&copy; 2024 智慧医疗管理系统</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NIcon, NCheckbox, useMessage, FormInst, FormRules } from 'naive-ui'
import {
  PersonOutline,
  LockClosedOutline,
  MedicalOutline,
  ShieldCheckmarkOutline,
  LogInOutline,
  PeopleOutline,
  CalendarOutline,
  StatsChartOutline,
  PersonCircleOutline,
  ArrowForwardOutline
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/user'
import { login as loginApi } from '@/api/auth'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const rememberMe = ref(false)

const formValue = ref({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur'
    },
    {
      min: 6,
      message: '密码长度不能少于6位',
      trigger: 'blur'
    }
  ]
}

// 填充演示账号
const fillDemoAccount = (username: string, password: string) => {
  formValue.value.username = username
  formValue.value.password = password
  message.info('已填充演示账号，点击登录即可')
}

// 忘记密码
const handleForgotPassword = () => {
  message.info('请联系系统管理员重置密码')
}

// 登录处理
const handleLogin = async () => {
  try {
    await formRef.value?.validate()

    loading.value = true

    const res: any = await loginApi({
      username: formValue.value.username,
      password: formValue.value.password
    })

    const loginData = res.data || res

    if (loginData.accessToken) {
      const user = loginData.user
      const userInfo = {
        id: user.id,
        username: user.username,
        name: user.name || user.username,
        role: user.type,
      }
      userStore.setToken(loginData.accessToken)
      userStore.setUserInfo(userInfo)

      // 记住账号
      if (rememberMe.value) {
        localStorage.setItem('remembered_username', formValue.value.username)
      } else {
        localStorage.removeItem('remembered_username')
      }

      message.success('登录成功，欢迎回来！')
      router.push('/')
    } else {
      message.error(res.message || '登录失败')
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    if (Array.isArray(error)) {
      return
    }
    if (error.response?.data?.message) {
      message.error(error.response.data.message)
    } else if (error.message && typeof error.message === 'string') {
      message.error(error.message)
    } else {
      message.error('登录失败，请检查网络连接')
    }
  } finally {
    loading.value = false
  }
}

// 加载记住的账号
onMounted(() => {
  const rememberedUsername = localStorage.getItem('remembered_username')
  if (rememberedUsername) {
    formValue.value.username = rememberedUsername
    rememberMe.value = true
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, rgba(24, 160, 88, 0.3) 0%, rgba(13, 122, 64, 0.2) 100%);
  top: -200px;
  left: -200px;
  animation: float 20s ease-in-out infinite;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, rgba(54, 162, 235, 0.25) 0%, rgba(24, 160, 88, 0.2) 100%);
  bottom: -150px;
  right: -150px;
  animation: float 25s ease-in-out infinite reverse;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(24, 160, 88, 0.15) 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 15s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(5deg); }
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.4; }
}

/* 主内容区 */
.login-content {
  position: relative;
  z-index: 10;
  display: flex;
  min-height: 100vh;
  padding: 40px;
  gap: 60px;
  max-width: 1400px;
  margin: 0 auto;
  align-items: center;
}

/* 左侧品牌区 */
.brand-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-wrapper {
  max-width: 520px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 48px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #18a058 0%, #0d7a40 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(24, 160, 88, 0.3);
}

.logo-text h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: 2px;
}

.logo-text .subtitle {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.brand-description {
  margin-bottom: 48px;
}

.brand-description h2 {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.brand-description p {
  font-size: 16px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.9);
}

.feature-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #18a058 0%, #0d7a40 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.feature-text h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.feature-text p {
  font-size: 13px;
  color: #888;
  margin: 0;
  line-height: 1.5;
}

/* 右侧登录区 */
.login-section {
  width: 420px;
  flex-shrink: 0;
}

.login-card {
  background: #fff;
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
  position: relative;
}

.header-decoration {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #18a058 0%, #36d399 100%);
  border-radius: 2px;
  margin: 0 auto 24px;
}

.login-header h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.login-header p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.login-form :deep(.n-form-item-label) {
  font-weight: 500;
  color: #333;
}

.login-form :deep(.n-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.n-input) {
  border-radius: 12px;
}

.login-form :deep(.n-input .n-input__input-el),
.login-form :deep(.n-input .n-input__textarea-el) {
  height: 48px;
}

.input-icon {
  color: #aaa;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.remember-text {
  font-size: 13px;
  color: #666;
}

.forgot-link {
  font-size: 13px;
  color: #18a058;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #0d7a40;
}

.login-btn {
  height: 52px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #18a058 0%, #0d7a40 100%);
  border: none;
  box-shadow: 0 8px 24px rgba(24, 160, 88, 0.3);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(24, 160, 88, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.login-divider {
  display: flex;
  align-items: center;
  margin: 28px 0 20px;
}

.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #eee;
}

.login-divider span {
  padding: 0 16px;
  font-size: 12px;
  color: #bbb;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.demo-account {
  margin-bottom: 24px;
}

.demo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.demo-item:hover {
  background: #f0f8f4;
  border-color: #18a058;
}

.demo-item .n-icon {
  color: #18a058;
}

.demo-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.demo-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.demo-value {
  font-size: 12px;
  color: #999;
  font-family: 'Monaco', 'Consolas', monospace;
}

.demo-arrow {
  color: #ccc;
  transition: transform 0.2s;
}

.demo-item:hover .demo-arrow {
  transform: translateX(4px);
  color: #18a058;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.login-footer p {
  font-size: 12px;
  color: #ccc;
  margin: 0;
}

/* 响应式 */
@media (max-width: 1100px) {
  .login-content {
    flex-direction: column;
    padding: 24px;
    gap: 40px;
  }

  .brand-section {
    display: none;
  }

  .login-section {
    width: 100%;
    max-width: 420px;
  }

  .login-card {
    padding: 36px 28px;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 28px 20px;
    border-radius: 20px;
  }

  .login-header h3 {
    font-size: 20px;
  }

  .feature-list {
    grid-template-columns: 1fr;
  }
}
</style>
