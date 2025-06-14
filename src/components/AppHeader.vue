<script setup>
import {ref, computed} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import {useGlobalStore} from '@/store/global';
import {ForkSpoon, Search, Moon, Sunny} from '@element-plus/icons-vue';

const globalStore = useGlobalStore();
const router = useRouter();
const route = useRoute();
const searchInput = ref('');

const activeMenuIndex = computed(() => {
  // 当路由为 /profile/:userId 时，也高亮 /profile
  if (route.path.startsWith('/profile')) {
    return '/profile';
  }
  return route.path;
});

const handleSearch = () => {
  if (!searchInput.value.trim()) {
    return;
  }
  router.push({name: 'search-results', query: {q: searchInput.value}});
  searchInput.value = '';
};

// 使用编程式导航处理个人资料点击
const handleProfile = () => {
  const userId = globalStore.userId;
  if (userId !== null && userId !== undefined) {
    router.push({name: 'profile', params: {userId: userId}});
  } else {
    console.error("用户ID在store中不可用，无法导航到个人资料页面。");
    router.push('/auth');
  }
};

const handleLogout = () => {
  globalStore.logout();
  router.push({name: 'home'});
};

const isAdmin = computed(() => globalStore.isAdmin);
</script>

<template>
  <el-header class="app-header">
    <div class="header-content">
      <router-link to="/" class="logo">
        <el-icon :size="24">
          <ForkSpoon/>
        </el-icon>
        <span>食谱论坛</span>
      </router-link>

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

      <el-menu :default-active="activeMenuIndex" mode="horizontal" :ellipsis="false" router class="nav-menu">
        <el-menu-item index="/">首页</el-menu-item>
        <template v-if="!globalStore.isAuthenticated">
          <el-menu-item index="/auth" class="auth-button">
            登录 / 注册
          </el-menu-item>
        </template>
        <template v-else>
          <el-menu-item index="/create">分享食谱</el-menu-item>
          <el-menu-item index="/favorites">我的收藏</el-menu-item>
          <el-menu-item v-if="isAdmin" index="/admin">管理员面板</el-menu-item>

          <!-- 校正结构: 将个人资料、退出登录等都放入用户下拉菜单中 -->
          <el-sub-menu index="/profile" class="user-profile">
            <template #title>{{ globalStore.username || '用户名' }}</template>
            <el-menu-item @click="handleProfile">个人资料</el-menu-item>
            <el-menu-item @click="handleLogout">退出登录</el-menu-item>

          </el-sub-menu>
        </template>
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
/* 定义CSS变量以支持主题切换 */
:root {
  --header-bg-color: #ffffff;
  --border-color: #e4e7ed;
  --el-text-color-primary: #303133;
}

html.dark {
  --header-bg-color: #141414;
  --border-color: #424242;
  --el-text-color-primary: #E5EAF3;
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: var(--header-bg-color);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
  padding: 0 20px;
  transition: background-color 0.3s, border-color 0.3s;
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

.html.dark .nav-menu {
  --el-menu-text-color: #E5EAF3;
  --el-menu-hover-text-color: #409EFF;
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

.html.dark .user-profile .el-sub-menu__title:hover {
  background-color: #262727;
}


.theme-switch {
  display: flex;
  align-items: center;
  margin-left: 20px;
  height: 100%;
  --el-switch-on-color: #2C2C2C;
  --el-switch-off-color: #F2F2F2;
}
</style>
