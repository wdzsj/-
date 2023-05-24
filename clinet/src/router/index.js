import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

// 同步路由
export const constantRoutes = [
  {path: '/redirect',component: Layout,hidden: true,children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {path: '/login',component: () => import('@/views/login/index'),hidden: true},
  {path: '/auth-redirect',component: () => import('@/views/login/auth-redirect'),hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '概览', icon: 'dashboard', affix: true }
      }
    ]
  },
  // 个人信息
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user', noCache: true }
      }
    ]
  }
]

// 异步路由
export const asyncRoutes = [
  // 学生专属页面 =========================
 
  {
    path: '/leaseInfo',
    component: Layout,
    meta: {
      roles: ['teacher']
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/lease-Info/index'),
        name: 'leaseInfo',
        meta: {
          title: '租赁信息',
          icon: 'eye'
        }
      }
    ]
  },
  {
    path: '/noticeInfo',
    component: Layout,
    meta: {
      roles: ['teacher']
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/notice-Info/index'),
        name: 'noticeInfo',
        meta: {
          title: '房间信息',
          icon: 'theme'
        }
      }
    ]
  },
  {
    path: '/repair',
    component: Layout,
    meta: {
      roles: ['teacher']
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/repair/index'),
        name: 'repair',
        meta: {
          title: '报修模块',
          icon: 'eye-open'
        }
      }
    ]
  },
  //  管理员路由 =========================
  {
    path: '/adminManage',
    component: Layout,
    meta: {
      roles: ['superAdmin']
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/admin-manage/index'),
        name: 'adminManage',
        meta: {
          title: '管理员管理',
          icon: 'edit'
        }
      }
    ]
  },
  {
    path: '/buildingManage',
    component: Layout,
    meta: {
      roles: ['superAdmin']
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/building-manage/index'),
        name: 'cleanRecord',
        meta: {
          title: '公寓管理',
          icon: 'international'
        }
      }
    ]
  },
  {
    path: '/floorManage',
    component: Layout,
    meta: {
      roles: ['superAdmin', 'admin']
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/floor-manage/index'),
        name: 'floorManage',
        meta: {
          title: '楼层管理',
          icon: 'list'
        }
      }
    ]
  },
  {
    path: '/roomManage',
    component: Layout,
    meta: {
      roles: ['superAdmin', 'admin']
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/room-manage'),
        name: 'roomManage',
        meta: {
          title: '住房管理',
          icon: 'peoples'
        }
      }
    ]
  },
  {
    path: '/userInfo',
    component: Layout,
    meta: {
      roles: ['superAdmin', 'admin']
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/user-info/index'),
        name: 'userInfo',
        meta: {
          title: '租赁管理',
          icon: 'people'
        }
      }
    ]
  },
  {
    path: '/serviceManage',
    component: Layout,
    meta: {
      roles: ['superAdmin', 'admin'],
      title: '服务系统',
      icon: 'tree'
    },
    children: [
      {
        path: '/serviceManage/repair',
        component: () => import('@/views/service-manage/repair-manage.vue'),
        name: 'repairManage',
        meta: {
          title: '报修模块'
        }
      },
      {
        path: '/serviceManage/notice',
        component: () => import('@/views/service-manage/notice-manage'),
        name: 'noticeManage',
        meta: {
          title: '公告'
        }
      },
   
    ]
  },
  // 404 页面要在最后引入
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  })

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
