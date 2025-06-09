<template>
  <div class="archived-news-page">
    <el-page-header @back="$router.back()"> </el-page-header>

    <el-alert type="info" show-icon :closable="false" class="mb-4">
      <p>
        此页面内容会被缓存。切换回来时不会重新加载数据，除非逻辑中显式刷新。
      </p>
      <p>
        上次数据加载时间: {{ lastUpdated || "N/A" }} | 组件激活次数:
        {{ internalCounter }}
      </p>
    </el-alert>

    <el-skeleton :rows="3" animated v-if="isLoading" />
    <el-alert
      v-else-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
    />

    <div v-else-if="archivedItems.length > 0" class="space-y-4">
      <el-card v-for="item in archivedItems" :key="item.id" shadow="hover">
        <router-link
          :to="{ name: 'NewsDetail', params: { id: item.id } }"
          class="text-gray-800 hover:text-[var(--el-color-primary)]"
        >
          <h4 class="text-md font-semibold">{{ item.title }}</h4>
          <p class="text-xs text-gray-500 mt-1">
            {{ item.date }} - {{ item.category }}
          </p>
        </router-link>
      </el-card>
    </div>
    <el-empty v-else description="暂无存档新闻" />
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated } from "vue";
import { useGlobalStore } from "../store/global";
import { newsService } from "../services/newsService";

defineOptions({ name: "ArchivedNewsPage" });

const archivedItems = ref([]);
const isLoading = ref(true);
const error = ref(null);
const lastUpdated = ref(null);
const internalCounter = ref(0);
const globalStore = useGlobalStore();

async function loadArchivedNews() {
  isLoading.value = true;
  error.value = null;
  try {
    // 使用缓存新闻数据替代从服务端获取
    const cachedNews = globalStore.getCachedNews();
    archivedItems.value = cachedNews;
    lastUpdated.value = new Date().toLocaleTimeString("zh-CN");
  } catch (err) {
    error.value = "加载存档新闻失败。";
  } finally {
    isLoading.value = false;
  }
}

// 首次加载
onMounted(loadArchivedNews);
</script>

<style scoped>
.archived-news-page .el-card a {
  text-decoration: none;
  color: inherit;
}

.dark .archived-news-page .el-card {
  background-color: #1f2937; /* 深色背景 */
  color: #f9fafb; /* 浅色文字 */
}

.dark .archived-news-page .el-card a {
  color: #f9fafb; /* 浅色文字 */
}

.dark .archived-news-page .text-gray-800 {
  color: #f9fafb; /* 浅色文字 */
}

.dark .archived-news-page .text-gray-500 {
  color: #d1d5db; /* 灰白色文字 */
}
</style>