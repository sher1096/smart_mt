import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import MobileLayout from '@/layouts/MobileLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/index.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/',
    component: MobileLayout,
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页', requiresAuth: false, showTabBar: true, icon: 'home' }
      },
      {
        path: '/appointment',
        name: 'Appointment',
        redirect: '/appointment/departments',
        meta: { title: '预约', requiresAuth: true, showTabBar: true, icon: 'calendar' },
        children: [
          {
            path: 'departments',
            name: 'DepartmentList',
            component: () => import('@/views/department/index.vue'),
            meta: { title: '选择科室', requiresAuth: true }
          },
          {
            path: 'doctors',
            name: 'DoctorList',
            component: () => import('@/views/doctor/index.vue'),
            meta: { title: '选择医生', requiresAuth: true }
          },
          {
            path: 'booking',
            name: 'Booking',
            component: () => import('@/views/appointment/booking.vue'),
            meta: { title: '预约挂号', requiresAuth: true }
          }
        ]
      },
      {
        path: '/message',
        name: 'Message',
        component: () => import('@/views/message/index.vue'),
        meta: { title: '消息', requiresAuth: true, showTabBar: true, icon: 'notification' }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '我的', requiresAuth: false, showTabBar: true, icon: 'person' }
      }
    ]
  },
  {
    path: '/my-appointments',
    name: 'MyAppointments',
    component: () => import('@/views/appointment/my-appointments.vue'),
    meta: { title: '我的挂号', requiresAuth: true }
  },
  {
    path: '/medical-records',
    name: 'MedicalRecords',
    component: () => import('@/views/medical/index.vue'),
    meta: { title: '我的病历', requiresAuth: true }
  },
  {
    path: '/prescriptions',
    name: 'Prescriptions',
    component: () => import('@/views/prescription/index.vue'),
    meta: { title: '我的处方', requiresAuth: true }
  },
  {
    path: '/examinations',
    name: 'Examinations',
    component: () => import('@/views/examination/index.vue'),
    meta: { title: '我的体检', requiresAuth: true }
  },
  {
    path: '/payment',
    name: 'Payment',
    component: () => import('@/views/payment/index.vue'),
    meta: { title: '缴费中心', requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 智慧医疗`
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router
