import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    redirect: 'books',
    children: [
      {
        path: 'user',
        name: 'UserView',
        meta: {
          isShow: true,  // 是否需要被展示出来
          title: "用户列表"
        },
        component: () => import('../views/user/UserView.vue')
      },
      {
        path: 'role',
        name: 'RoleView',
        meta: {
          isShow: true,  // 是否需要被展示出来
          title: "角色列表"
        },
        component: () => import('../views/role/RoleView.vue')
      },
      {
        path: 'authority',
        name: 'AuthorityView',
        meta: {
          isShow: false,  // 是否需要被展示出来
          title: "角色列表隐藏版"
        },
        component: () => import('../views/authority/AuthorityView.vue')
      },
      {
        path: 'books',
        name: 'GoodsView',
        meta: {
          isShow: true,  // 是否需要被展示出来
          title: "书籍列表"
        },
        component: () => import('../views/books/BooksView.vue')
      },
      {
        path: 'cartItem',
        name: 'cartItemView',
        meta: {
          isShow: true,  // 是否需要被展示出来
          title: "我的购物车"
        },
        component: () => import('../views/cartItem/CartItemView.vue')
      },
      {
        path: 'order',
        name: 'OrderView',
        meta: {
          isShow: true,  // 是否需要被展示出来
          title: "订单管理"
        },
        component: () => import('../views/order/OrderView.vue')
      },
    ]
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/login',
    name: 'LoginView',
    component: () => import(/* webpackChunkName: "login" */ '../views/LoginView.vue')
  }
  // 移除原来的编辑和新增书籍路由，因为现在通过弹窗实现
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token: string | null = localStorage.getItem("token")
  if(!token && to.path !== "/login"){
    next("/login")
  }
  else{
    next()
  }
})

export default router