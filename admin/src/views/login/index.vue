<template>
  <div class="login-container">
    <n-card class="login-card" title="智慧医疗管理后台">
      <n-form
        ref="formRef"
        :model="formValue"
        :rules="rules"
        size="large"
      >
        <n-form-item path="username" label="用户名">
          <n-input
            v-model:value="formValue.username"
            placeholder="请输入用户名"
            @keydown.enter="handleLogin"
          >
            <template #prefix>
              <n-icon>
                <PersonOutline />
              </n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="password" label="密码">
          <n-input
            v-model:value="formValue.password"
            type="password"
            show-password-on="click"
            placeholder="请输入密码"
            @keydown.enter="handleLogin"
          >
            <template #prefix>
              <n-icon>
                <LockClosedOutline />
              </n-icon>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item>
          <n-button
            type="primary"
            block
            size="large"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </n-button>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NForm, NFormItem, NInput, NButton, NIcon, useMessage, FormInst, FormRules } from 'naive-ui'
import { PersonOutline, LockClosedOutline } from '@vicons/ionicons5'
import { useUserStore } from '@/stores/user'
import { login as loginApi } from '@/api/auth'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)

// 表单数据
const formValue = ref({
  username: '',
  password: ''
})

// 表单验证规则
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

// 登录处理
const handleLogin = async () => {
  try {
    // 验证表单
    await formRef.value?.validate()

    loading.value = true

    // 调用登录接口
    const res = await loginApi({
      username: formValue.value.username,
      password: formValue.value.password
    })

    if (res.code === 200 || res.code === 0) {
      // 保存 token 和用户信息
      userStore.setToken(res.data.token)
      userStore.setUserInfo(res.data.userInfo)

      message.success('登录成功')

      // 跳转到首页
      router.push('/')
    } else {
      message.error(res.message || '登录失败')
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    if (error.message && typeof error.message === 'string') {
      message.error(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-card :deep(.n-card-header) {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
}
</style>
