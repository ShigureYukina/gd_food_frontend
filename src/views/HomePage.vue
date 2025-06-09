<template>
  <div class="homepage-container">
    <el-row justify="center">
      <el-col :xs="24" :sm="18" :md="12">
        <el-input
          v-model.trim="searchTerm"
          placeholder="搜索新闻标题或内容..."
          clearable
          size="large"
          @keyup.enter="fetchNewsData"
        >
          <template #append>
            <el-button :icon="Search" @click="fetchNewsData" />
          </template>
        </el-input>
        <p v-if="searchTerm">当前搜索: "{{ searchTerm }}"</p>
      </el-col>
    </el-row>

    <div
      v-loading="isLoading"
      element-loading-text="正在加载新闻..."
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.7)"
      class="news-list-area"
      style="min-height: 200px"
    >
      <el-empty
        v-if="!isLoading && filteredNews.length === 0 && !error"
        :description="
          category
            ? `在 '${category}' 分类下没有找到新闻。`
            : '没有找到符合条件的新闻。'
        "
      />
      <el-alert
        v-if="error"
        :title="error"
        type="error"
        show-icon
        closable
        @close="error = null"
        class="mb-4"
      >
        <template #default>
          <el-button type="primary" plain size="small" @click="fetchNewsData"
            >重试</el-button
          >
        </template>
      </el-alert>

      <div v-if="!isLoading && filteredNews.length > 0">
        <NewsListItem
          v-for="article in filteredNews"
          :key="article.id"
          :article="article"
          :highlight-term="searchTerm"
          :is-read="globalStore.isNewsRead(article.id)"
          @read-more="handleReadMore"
          @close-news="handleCloseNewsItem"
        >
        </NewsListItem>
      </div>
    </div>
  </div>
</template>

<script setup>
// script 部分保持不变
import { ref, computed, watch, onMounted, onActivated, provide } from "vue";
import { useRouter } from "vue-router";
import { newsService } from "../services/newsService";
import { useGlobalStore } from "../store/global";
import NewsListItem from "../components/NewsListItem.vue";
import { Search } from "@element-plus/icons-vue";

defineOptions({ name: "HomePage" });
const props = defineProps({ category: String });
const newsItems = ref([]);
const isLoading = ref(true);
const searchTerm = ref("");
const error = ref(null);
const router = useRouter();
const globalStore = useGlobalStore();

const filteredNews = computed(() => {
  if (!searchTerm.value) return newsItems.value;
  return newsItems.value.filter(
    (news) =>
      news.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      news.content.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

async function fetchNewsData() {
  isLoading.value = true;
  error.value = null;
  try {
    const params = {};
    if (props.category) params.category = props.category;
    const response = await newsService.getNews(params);
    newsItems.value = response.data;
  } catch (err) {
    console.error("获取新闻失败:", err);
    error.value = "无法加载新闻列表，请检查网络或稍后再试。";
  } finally {
    isLoading.value = false;
  }
}

watch(() => props.category, fetchNewsData);

onMounted(() => {
  fetchNewsData();
});
onActivated(() => {
  /* console.log('HomePage activated'); */
});

function handleReadMore(articleId) {
  globalStore.markNewsAsRead(articleId);
  router.push({ name: "NewsDetail", params: { id: articleId } });
}

function handleCloseNewsItem(payload) {
  newsItems.value = newsItems.value.filter(
    (item) => item.id !== payload.articleId
  );
  globalStore.showMessage(
    `新闻 "${payload.articleId}" 已关闭。原因: ${payload.reason || "未提供"}`,
    "info"
  );
}

provide(
  "appTheme",
  computed(() => globalStore.theme)
);
</script>

<style scoped>
/* 首页容器样式 */
.homepage-container {
  padding: 20px; /* 稍微增加一些内边距以获得更好的整体观感 */
}

/* 新闻列表区域样式 */
.news-list-area {
  margin-top: 24px; /* 添加上外边距 */
  transition: opacity 0.3s ease; /* 平滑过渡加载状态 */
}
</style>