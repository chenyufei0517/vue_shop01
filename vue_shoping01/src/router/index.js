import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/welcome.vue'
import User from '../components/users/user.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
const routes = [{
        path: '/login',
        name: 'Login',
        component: Login
    }, {
        path: '/home',
        name: 'Home',
        component: Home,
        redirect: '/welcome',
        children: [{
                path: '/welcome',
                name: 'Welcome',
                component: Welcome,

            }, {
                path: '/users',
                name: 'User',
                component: User,
            }, {
                path: '/rights',
                name: 'Rights',
                component: Rights,
            },
            {
                path: '/roles',
                name: 'Roles',
                component: Roles,
            }
        ]

    },

]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})
router.beforeEach((to, from, next) => {
    // to 将要访问的路径
    // from 代表从哪个路径跳转而来
    // next 是一个函数，表示放行
    //     next()  放行    next('/login')  强制跳转

    if (to.path === '/login') return next()
        // 获取token
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})
export default router