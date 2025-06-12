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
            path: '/login-register',
            name: 'auth',
            component: () => import('../../../news/frontend/src/views/AuthView.vue'),
            meta: {title: '登录 / 注册'}
        },
        {path: '/search',
            name: 'search',
            component: () => import('../views/SearchResultsView.vue'),
            meta: {title: '搜索结果'}
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('../views/NotFoundView.vue'),
            meta: {title: '404 - 页面未找到'}
        }
    ],
    // This function ensures the page scrolls to the top on navigation.
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return {top: 0, behavior: 'smooth'};
        }
    },
})

// Update the document title after each navigation.
router.afterEach((to) => {
    document.title = to.meta.title || '食谱分享论坛';
});

export default router
