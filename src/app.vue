<script setup>
import { onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import { useGlobalStore } from './store/global';

const globalStore = useGlobalStore();

onMounted(() => {
  globalStore.initTheme();
});
</script>

<template>
  <el-config-provider>
    <AppHeader />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <el-backtop :right="40" :bottom="40" />
  </el-config-provider>
</template>