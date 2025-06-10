<script setup>
import {ref} from 'vue';
import {useGlobalStore} from '@/store/global';
import {useRouter} from 'vue-router';
// 导入所有需要的图标组件
import {ForkSpoon, Search, Moon, Sunny} from '@element-plus/icons-vue';

const globalStore = useGlobalStore();
const router = useRouter();
const searchInput = ref('');

const handleSearch = () => {
  if (!searchInput.value.trim()) {
    return;
  }
  // FIX: 将查询参数从 'search' 修改为 'q'，使URL更简洁 (例如: /search?q=keyword)
  router.push({name: 'search', query: {q: searchInput.value}});
};

// 处理个人资料点击事件
const handleProfile = () => {
  router.push({name: 'profile'});
};

// 处理退出登录点击事件
const handleLogout = () => {
  globalStore.logout();
  router.push({name: 'home'});
};

// 处理管理员面板点击事件
const handleAdminPanel = () => {
  router.push({name: 'admin'});
};</script>

<template>
  <el-header class="app-header">
    <div class="header-content">
      <router-link to="/" class="logo">
        <!-- 正确使用图标组件 -->
        <el-icon :size="24">
          <ForkSpoon/>
        </el-icon>
        <span>食谱论坛</span>
      </router-link>

      <!-- 改进搜索栏，增加可点击的按钮 -->
      <div class="search-bar">
        <el-input
            v-model="searchInput"
            placeholder="搜你想搜..."
            @keyup.enter="handleSearch"
            clearable
        >
          <template #append>
            <el-button @click="handleSearch" :icon="Search"/>
          </template>
        </el-input>
      </div>

      <el-menu default-active="/" mode="horizontal" :ellipsis="false" router class="nav-menu">
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/create">分享食谱</el-menu-item>
        <el-menu-item index="/favorites">我的收藏</el-menu-item>
        <!-- 新增：登录/注册入口 -->
        <el-menu-item index="/login-register" class="auth-button">
          登录 / 注册
        </el-menu-item>
        <!-- 新增：用户状态显示 -->
        <el-sub-menu v-if="globalStore.isAuthenticated" :index="globalStore.username" class="user-profile">
          <template #title>{{ globalStore.username }}</template>
          <el-menu-item @click="handleProfile">个人资料</el-menu-item>
          <el-menu-item @click="handleLogout">退出登录</el-menu-item>
          <el-menu-item v-if="globalStore.isAdmin" @click="handleAdminPanel">管理员面板</el-menu-item>
        </el-sub-menu>
        <el-switch
            :model-value="globalStore.theme === 'dark'"
            @change="globalStore.toggleTheme"
            inline-prompt
            :active-icon="Moon"
            :inactive-icon="Sunny"
            class="theme-switch"
        />
      </el-menu>
    </div>
  </el-header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: var(--header-bg-color);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 1500px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  margin-right: 40px;
  text-decoration: none;
  color: var(--el-text-color-primary);
}

.logo span {
  margin-left: 8px;
}

.search-bar {
  width: 300px;
  margin-right: auto;
}

.nav-menu {
  border-bottom: none;
  background-color: transparent;
}

.auth-button {
  display: flex;
  align-items: center;
  height: 100%;
  margin-left: 20px;
  padding: 0 15px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.user-profile {
  margin-left: 20px;
}

.html.dark .user-profile .el-sub-menu__title {
  color: #ffffff;
  border-color: transparent;
}

.user-profile .el-sub-menu__title {
  padding: 0 15px;
  height: 100%;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.user-profile .el-sub-menu__title:hover {
  background-color: var(--el-color-primary-light-9);
}

.theme-switch {
  display: flex;
  align-items: center;
  margin-left: 20px;
  height: 100%;
}
</style>
