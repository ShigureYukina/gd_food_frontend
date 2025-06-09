<script setup>
import { ref } from 'vue';
import { useGlobalStore } from '@/store/global';
import { useRouter } from 'vue-router';

const globalStore = useGlobalStore();
const router = useRouter();
const searchInput = ref('');

const handleSearch = () => {
  router.push({ name: 'home', query: { search: searchInput.value } });
};
</script>

<template>
  <el-header class="app-header">
    <div class="header-content">
      <router-link to="/" class="logo">
        <el-icon :size="24"><ForkSpoon /></el-icon>
        <span>食谱论坛</span>
      </router-link>
      <div class="search-bar">
        <el-input
            v-model="searchInput"
            placeholder="搜索食谱..."
            :prefix-icon="'Search'"
            @keyup.enter="handleSearch"
            clearable
        />
      </div>
      <el-menu default-active="/" mode="horizontal" :ellipsis="false" router class="nav-menu">
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/create">分享食谱</el-menu-item>
        <el-menu-item index="/favorites">我的收藏</el-menu-item>
        <el-switch
            :model-value="globalStore.theme === 'dark'"
            @change="globalStore.toggleTheme"
            inline-prompt
            :active-icon="'Moon'"
            :inactive-icon="'Sunny'"
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
  max-width: 1200px;
  margin: 0 auto;
}
.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  margin-right: 40px;
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
.theme-switch {
  display: flex;
  align-items: center;
  margin-left: 20px;
  height: 100%;
}
</style>