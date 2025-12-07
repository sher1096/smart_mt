<template>
  <div class="login-page">
    <div class="login-header">
      <h1>欢迎登录</h1>
      <p>智慧医疗患者端</p>
    </div>

    <div class="login-form">
      <n-form ref="formRef" :model="formData" :rules="rules" size="large">
        <n-form-item path="username">
          <n-input
            v-model:value="formData.username"
            placeholder="请输入用户名/手机号"
            :input-props="{ autocomplete: 'username' }"
          >
            <template #prefix>
              <n-icon :component="PersonOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="password">
          <n-input
            v-model:value="formData.password"
            type="password"
            show-password-on="click"
            placeholder="请输入密码"
            :input-props="{ autocomplete: 'current-password' }"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <n-icon :component="LockClosedOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item>
          <n-button
            type="primary"
            size="large"
            block
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </n-button>
        </n-form-item>
      </n-form>

      <div class="login-footer">
        <span class="link" @click="router.push('/register')">立即注册</span>
        <span class="divider">|</span>
        <span class="link">忘记密码</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NIcon, useMessage, FormInst, FormRules } from 'naive-ui'
import { PersonOutline, LockClosedOutline } from '@vicons/ionicons5'
import { login } from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const userStore = useUserStore()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const formData = ref({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: 'blur'
  }
}

const handleLogin = async () => {
  try {
    await formRef.value?.validate()

    loading.value = true
    const res = await login(formData.value)

    // 后端直接返回数据（经过响应拦截器处理）
    // 返回格式: { accessToken, refreshToken, expiresIn, user: { id, username, name, type } }
    if (res.accessToken) {
      message.success('登录成功')
      const userInfo = {
        id: res.user.id,
        username: res.user.username,
        name: res.user.name || res.user.username,
        phone: '',
      }
      userStore.login(res.accessToken, userInfo)

      // 跳转到原页面或首页
      const redirect = (route.query.redirect as string) || '/home'
      router.replace(redirect)
    } else if (res.code === 200 || res.code === 0) {
      // 兼容旧格式
      message.success('登录成功')
      const token = res.data?.accessToken || res.data?.token
      const userInfo = res.data?.user || res.data?.userInfo
      userStore.login(token, userInfo)

      const redirect = (route.query.redirect as string) || '/home'
      router.replace(redirect)
    } else {
      message.error(res.message || '登录失败')
    }
  } catch (error: any) {
    if (error?.errors) return // 表单验证错误
    message.error(error?.message || '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
  display: flex;
  flex-direction: column;
  padding: 60px 30px 30px;
}

.login-header {
  text-align: center;
  color: #fff;
  margin-bottom: 60px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 10px 0;
}

.login-header p {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

.login-form {
  background-color: #fff;
  border-radius: 12px;
  padding: 30px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: #999;
}

.link {
  color: #18a058;
  cursor: pointer;
}

.link:active {
  opacity: 0.8;
}

.divider {
  margin: 0 10px;
}
</style>
