<template>
  <div class="register-page">
    <div class="register-header">
      <n-icon
        :component="ArrowBackOutline"
        :size="24"
        class="back-btn"
        @click="router.back()"
      />
      <h1>用户注册</h1>
    </div>

    <div class="register-form">
      <n-form ref="formRef" :model="formData" :rules="rules" size="large">
        <n-form-item path="username">
          <n-input
            v-model:value="formData.username"
            placeholder="请输入用户名"
            :input-props="{ autocomplete: 'username' }"
          >
            <template #prefix>
              <n-icon :component="PersonOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="name">
          <n-input
            v-model:value="formData.name"
            placeholder="请输入真实姓名"
            :input-props="{ autocomplete: 'name' }"
          >
            <template #prefix>
              <n-icon :component="PersonCircleOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="phone">
          <n-input
            v-model:value="formData.phone"
            placeholder="请输入手机号"
            :input-props="{ autocomplete: 'tel' }"
          >
            <template #prefix>
              <n-icon :component="CallOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="idCard">
          <n-input
            v-model:value="formData.idCard"
            placeholder="请输入身份证号（选填）"
          >
            <template #prefix>
              <n-icon :component="CardOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="password">
          <n-input
            v-model:value="formData.password"
            type="password"
            show-password-on="click"
            placeholder="请输入密码（6-20位）"
            :input-props="{ autocomplete: 'new-password' }"
          >
            <template #prefix>
              <n-icon :component="LockClosedOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="confirmPassword">
          <n-input
            v-model:value="formData.confirmPassword"
            type="password"
            show-password-on="click"
            placeholder="请确认密码"
            :input-props="{ autocomplete: 'new-password' }"
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
            @click="handleRegister"
          >
            注册
          </n-button>
        </n-form-item>
      </n-form>

      <div class="register-footer">
        已有账号？
        <span class="link" @click="router.push('/login')">立即登录</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NIcon, useMessage, FormInst, FormRules, FormItemRule } from 'naive-ui'
import {
  ArrowBackOutline,
  PersonOutline,
  PersonCircleOutline,
  CallOutline,
  CardOutline,
  LockClosedOutline
} from '@vicons/ionicons5'
import { register } from '@/api'

const router = useRouter()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const formData = ref({
  username: '',
  name: '',
  phone: '',
  idCard: '',
  password: '',
  confirmPassword: ''
})

const validatePassword = (rule: FormItemRule, value: string) => {
  if (!value) {
    return new Error('请输入密码')
  }
  if (value.length < 6 || value.length > 20) {
    return new Error('密码长度为6-20位')
  }
  return true
}

const validateConfirmPassword = (rule: FormItemRule, value: string) => {
  if (!value) {
    return new Error('请确认密码')
  }
  if (value !== formData.value.password) {
    return new Error('两次密码输入不一致')
  }
  return true
}

const rules: FormRules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur'
  },
  name: {
    required: true,
    message: '请输入真实姓名',
    trigger: 'blur'
  },
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: {
    required: true,
    validator: validatePassword,
    trigger: 'blur'
  },
  confirmPassword: {
    required: true,
    validator: validateConfirmPassword,
    trigger: ['blur', 'input']
  }
}

const handleRegister = async () => {
  try {
    await formRef.value?.validate()

    loading.value = true
    const { confirmPassword, ...registerData } = formData.value
    const res = await register(registerData)

    if (res.code === 200 || res.code === 0) {
      message.success('注册成功，请登录')
      setTimeout(() => {
        router.replace('/login')
      }, 1000)
    } else {
      message.error(res.message || '注册失败')
    }
  } catch (error: any) {
    if (error?.errors) return // 表单验证错误
    message.error(error?.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
  padding: 20px;
}

.register-header {
  position: relative;
  text-align: center;
  color: #fff;
  margin-bottom: 40px;
  padding-top: 20px;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 20px;
  cursor: pointer;
  padding: 5px;
}

.back-btn:active {
  opacity: 0.8;
}

.register-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.register-form {
  background-color: #fff;
  border-radius: 12px;
  padding: 30px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.register-footer {
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
</style>
