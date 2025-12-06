import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BasicLayout from '@/layouts/BasicLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: BasicLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'DashboardOutline' }
      },
      {
        path: 'departments',
        name: 'Departments',
        component: () => import('@/views/departments/index.vue'),
        meta: { title: '科室管理', icon: 'BusinessOutline' }
      },
      {
        path: 'doctors',
        name: 'Doctors',
        component: () => import('@/views/doctors/index.vue'),
        meta: { title: '医生管理', icon: 'PeopleOutline' }
      },
      {
        path: 'schedules',
        name: 'Schedules',
        component: () => import('@/views/schedules/index.vue'),
        meta: { title: '排班管理', icon: 'CalendarOutline' }
      },
      {
        path: 'registrations',
        name: 'Registrations',
        component: () => import('@/views/registrations/index.vue'),
        meta: { title: '挂号管理', icon: 'ClipboardOutline' }
      },
      {
        path: 'medical-records',
        name: 'MedicalRecords',
        component: () => import('@/views/medical-records/index.vue'),
        meta: { title: '病历管理', icon: 'DocumentTextOutline' }
      },
      {
        path: 'prescriptions',
        name: 'Prescriptions',
        component: () => import('@/views/prescriptions/index.vue'),
        meta: { title: '处方管理', icon: 'ReceiptOutline' }
      },
      {
        path: 'medicines',
        name: 'Medicines',
        component: () => import('@/views/medicines/index.vue'),
        meta: { title: '药品管理', icon: 'MedkitOutline' }
      },
      {
        path: 'examinations',
        name: 'Examinations',
        component: () => import('@/views/examinations/index.vue'),
        meta: { title: '体检管理', icon: 'FitnessOutline' }
      },
      {
        path: 'payments',
        name: 'Payments',
        component: () => import('@/views/payments/index.vue'),
        meta: { title: '缴费管理', icon: 'CardOutline' }
      },
      {
        path: 'messages',
        name: 'Messages',
        component: () => import('@/views/messages/index.vue'),
        meta: { title: '消息管理', icon: 'ChatbubblesOutline' }
      },
      {
        path: 'news',
        name: 'News',
        component: () => import('@/views/news/index.vue'),
        meta: { title: '新闻管理', icon: 'NewspaperOutline' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '系统设置', icon: 'SettingsOutline' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !userStore.token) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && userStore.token) {
    // 已登录访问登录页，跳转到首页
    next('/')
  } else {
    next()
  }
})

export default router
