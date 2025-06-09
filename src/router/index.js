// src/router/index.js
// 路由配置文件，定义应用的所有路由规则和导航行为

import { createRouter, createWebHashHistory } from "vue-router";
import HomePage from "../views/HomePage.vue"; // 首页组件
import NewsDetailPage from "../views/NewsDetailPage.vue"; // 新闻详情页面组件
import CategoriesPage from "../views/CategoriesPage.vue"; // 分类页面组件
import ArchivedNewsPage from "../views/ArchivedNewsPage.vue"; // 缓存新闻页面组件
import DynamicDemoPage from "../views/DynamicDemoPage.vue"; // 动态演示页面组件
import AboutPage from "../views/AboutPage.vue"; // 关于页面组件
import FavoritesPage from "../views/FavoritesPage.vue"; // 收藏页面组件
import DashboardPage from "../views/DashboardPage.vue"; // 数据大屏页面
import NotFoundPage from "../views/NotFoundPage.vue"; // 404页面组件
// --- 修复：移除了重复的 ProfilePage 导入 ---
import ProfilePage from "../views/ProfilePage.vue"; // 个人信息页面

// 定义路由规则
const routes = [
  // 首页路由
  { path: "/", name: "Home", component: HomePage, meta: { title: "首页" } },
  // 新闻详情路由（带参数）
  {
    path: "/news/:id",
    name: "NewsDetail",
    component: NewsDetailPage,
    props: true,
    meta: { title: "新闻详情" },
  },
  // 分类页面路由
  {
    path: "/categories",
    name: "Categories",
    component: CategoriesPage,
    meta: { title: "新闻分类" },
  },
  // 分类新闻路由（带参数）
  {
    path: "/category/:categoryName",
    name: "CategoryNews",
    component: HomePage,
    props: (route) => ({ category: route.params.categoryName }),
    meta: { title: "分类新闻" },
  },
  // 缓存新闻路由
  {
    path: "/archived",
    name: "ArchivedNews",
    component: ArchivedNewsPage,
    meta: { title: "缓存新闻" },
  },
  // 动态演示页面路由
  {
    path: "/dynamic-demo",
    name: "DynamicDemo",
    component: DynamicDemoPage,
    meta: { title: "动态组件演示" },
  },
  // 收藏页面路由
  {
    path: "/favorites",
    name: "Favorites",
    component: FavoritesPage,
    meta: { title: "我的收藏" },
  },
  // 数据大屏路由
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardPage,
    meta: { title: "数据大屏" },
  },
  // --- 修复：合并了两个冲突的 'Profile' 路由，并补全了 meta 信息 ---
  {
    path: "/profile/:userId?", // 使用 :userId 定义动态参数，? 表示参数可选
    name: "Profile", // 保证 name 唯一
    component: ProfilePage,
    props: true, // 将路由参数 (userId) 作为 props 传递给组件
    meta: { title: "个人信息" }, // 补全 meta 信息
  },
  // 关于我们路由
  {
    path: "/about",
    name: "About",
    component: AboutPage,
    meta: { title: "关于我们" },
  },
  // 首页重定向
  { path: "/home", redirect: "/" },
  // 404页面路由（捕获所有未匹配的路径）
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundPage,
    meta: { title: "页面未找到" },
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(), // 使用 hash 模式
  routes, // 路由配置
  // 页面滚动行为控制
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: "smooth" };
    }
  },
});

// 全局前置守卫：设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - Vue新闻` : "Vue新闻";
  next();
});

export default router;
