<template>
  <el-config-provider :locale="locale">
    <el-container class="app-el-container">
      <el-header class="app-header shadow-md">
        <div class="container">
          <div class="logo-title" @click="$router.push('/')">新闻中心</div>

          <el-menu
            mode="horizontal"
            class="app-menu"
            background-color="transparent"
            text-color="#ffffff"
            active-text-color="#ffd04b"
            :ellipsis="false"
            router
            :default-active="activeRoute"
          >
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/categories">分类</el-menu-item>
            <el-menu-item index="/archived">缓存新闻</el-menu-item>
            <el-menu-item index="/favorites">
              <div class="flex items-center">
                <span>我的收藏</span>
                <el-badge
                  :value="globalStore.favoriteCount"
                  :hidden="globalStore.favoriteCount === 0"
                  class="ml-2"
                />
              </div>
            </el-menu-item>
            <el-menu-item index="/about">关于</el-menu-item>
          </el-menu>

          <div class="header-right">
            <el-dropdown trigger="click">
              <div class="user-info-dropdown">
                <span style="color: #ffffff">ID: {{ globalStore.userId }}</span>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/dashboard')">
                    <el-icon><DataLine /></el-icon>
                    数据大屏
                  </el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/profile')">
                    <el-icon><User /></el-icon>
                    个人信息
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-switch
              v-model="isDarkMode"
              class="theme-toggle-switch"
              active-icon="Moon"
              inactive-icon="Sunny"
              size="small"
              @change="toggleTheme"
            />
          </div>
        </div>
      </el-header>

      <el-main class="app-main">
        <div class="main-content-wrapper">
          <router-view v-slot="{ Component }">
            <keep-alive include="HomePage,ArchivedNewsPage">
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </div>
      </el-main>

      <el-footer class="app-footer text-center" height="auto">
        <p>&copy; {{ new Date().getFullYear() }} Vue.js 新闻展示.</p>
        <p class="text-sm">这是一个用于演示 Vue.js 功能的示例网站。</p>
      </el-footer>
    </el-container>
  </el-config-provider>
</template>

<script setup>
import { onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { useGlobalStore } from "./store/global";
import {
  ElConfigProvider,
  ElSwitch,
  ElBadge,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElIcon,
  ElNotification,
} from "element-plus";
import { Moon, Sunny, ArrowDown, User } from "@element-plus/icons-vue";

const globalStore = useGlobalStore();
const route = useRoute();
const activeRoute = computed(() => route.path);

watch(
  () => globalStore.message,
  (newMessage) => {
    if (newMessage && newMessage.text) {
      ElNotification({
        title: newMessage.type.charAt(0).toUpperCase() + newMessage.type.slice(1),
        message: newMessage.text,
        type: newMessage.type,
        duration: 3000,
        showClose: true,
      });
      globalStore.clearMessage();
    }
  },
  { deep: true }
);

onMounted(() => {
  console.log("根组件 App 已挂载");
  if (globalStore.theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  globalStore.showMessage("欢迎来到 Vue.js 新闻中心 !", "success");
  const initialLoader = document.querySelector(".initial-loader-overlay");
  if (initialLoader) {
    initialLoader.style.display = "none";
  }
});

const isDarkMode = computed({
  get() {
    return globalStore.theme === "dark";
  },
  set() {},
});

const toggleTheme = () => {
  globalStore.toggleTheme();
};
</script>

<style scoped>
/* 根组件样式 */
.app-el-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* --- 页面头部布局 --- */
.app-header {
  background-color: var(--el-color-primary);
  color: white;
  height: 60px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.app-header .container {
  display: flex;
  align-items: center;
}

.logo-title {
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.app-menu {
  margin-left: auto;
  margin-right: auto;
}

.header-right {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.user-info {
  font-size: 0.75rem;
  color: #ffffff;
}

.theme-toggle-switch {
  margin-left: 1rem;
}

.app-menu .el-menu-item:hover {
  background-color: var(--el-color-primary-light-3);
}
.app-menu .el-menu-item.is-active {
  border-bottom-color: var(--el-color-warning);
}

/* 主要内容区域 */
.app-main {
  flex-grow: 1;
  background-color: var(--el-bg-color-page);
}
.main-content-wrapper {
  max-width: 1600px;
  margin: 0 auto;
  background-color: var(--el-bg-color-overlay);
  padding: 20px;
  border-radius: var(--el-border-radius-base);
  box-shadow: var(--el-box-shadow-light);
}

/* 页面底部 */
.app-footer {
  padding: 20px;
  background-color: var(--el-fill-color-lighter);
  color: var(--el-text-color-secondary);
  border-top: 1px solid var(--el-border-color-light);
}
.app-footer p {
  margin: 5px 0;
}

/* 夜间模式样式 */
.dark .app-header {
  background-color: #111827; /* 更深的背景色 */
  color: #f9fafb; /* 浅色文字 */
}

.dark .app-main {
  background-color: #1f2937; /* 稍浅的深色背景 */
  color: #f9fafb; /* 浅色文字 */
}

.dark .main-content-wrapper {
  background-color: #374151; /* 更亮一些的深色背景 */
  color: #f9fafb; /* 浅色文字 */
}

.dark .app-footer {
  background-color: #1f2937; /* 深色背景 */
  color: #d1d5db; /* 灰白色文字 */
  border-top-color: #374151; /* 较深的边框 */
}
/* 全局暗色模式样式 */
.dark body {
  background-color: #1a1a1a;
  color: #ffffff;
}

.dark .app-header {
  background-color: #2c2c2c;
  color: #ffffff;
}

.dark .app-main {
  background-color: #1f1f1f;
}

.dark .main-content-wrapper {
  background-color: #2a2a2a;
  color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.dark .app-footer {
  background-color: #2c2c2c;
  color: #bbbbbb;
  border-top: 1px solid #444444;
}
</style>
