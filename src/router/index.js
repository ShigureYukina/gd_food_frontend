import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: {title: '首页 - 食谱分享'}
        },
        {
            path: '/recipe/:id',
            name: 'recipe-detail',
            component: () => import('../views/RecipeDetailView.vue'),
            props: true,
            meta: {title: '食谱详情'}
        },
        {
            path: '/create',
            name: 'create-recipe',
            component: () => import('../views/CreateRecipeView.vue'),
            meta: {title: '分享我的食谱'}
        },
        {
            path: '/favorites',
            name: 'favorites',
            component: () => import('../views/FavoritesView.vue'),
            meta: {title: '我的收藏'}
        },
        {
            path: '/auth',
            name: 'auth',
            component: () => import('../views/AuthView.vue'),
            meta: {title: '登录 / 注册'}
        },
        {
            path: '/search',
            name: 'search-results', // 保持与页头组件中 handleSearch 的命名一致
            component: () => import('../views/SearchResultsView.vue'),
            meta: {title: '搜索结果'}
        },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('../views/AdminView.vue'),
            meta: {title: '管理员面板'}
        },
        {
            // 修复: 更改此路由以匹配导航逻辑
            path: '/profile/:userId', // 1. 改为动态路径，接收 userId 参数
            name: 'profile',         // 2. 将名称从 'user' 改为 'profile'
            component: () => import('../views/Users.vue'), // 假设 Users.vue 是个人资料页面
            props: true,             // 3. 设置 props: true 以便将路由参数作为组件 prop 传递
            meta: {title: '个人信息'}
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('../views/NotFoundView.vue'),
            meta: {title: '404 - 页面未找到'}
        }
    ],
    // 此函数确保在导航时页面滚动到顶部。
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return {top: 0, behavior: 'smooth'};
        }
    },
})

// 每次导航后更新文档标题。
router.afterEach((to) => {
    document.title = to.meta.title || '食谱分享论坛';
});

export default router
