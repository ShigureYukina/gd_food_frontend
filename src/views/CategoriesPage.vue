<template>
  <div class="categories-page">
    <el-page-header @back="$router.back()"> </el-page-header>

    <el-skeleton :rows="5" animated v-if="isLoading" />
    <el-alert
      v-else-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
    />

    <el-row :gutter="20" v-else>
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        v-for="category in categories"
        :key="category.name"
      >
        <el-card shadow="hover" class="category-card">
          <router-link
            :to="{
              name: 'CategoryNews',
              params: { categoryName: category.name },
            }"
          >
            <div>
              <span>{{ category.name }}</span>
              <el-tag type="info" round>{{ category.count }} 篇</el-tag>
            </div>
          </router-link>
        </el-card>
      </el-col>
    </el-row>
    <el-empty
      v-if="!isLoading && !error && categories.length === 0"
      description="暂无分类信息"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { newsService } from "../services/newsService";

const categories = ref([]);
const isLoading = ref(true);
const error = ref(null);

async function fetchCategories() {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await newsService.getCategories();
    categories.value = response.data;
  } catch (err) {
    error.value = "无法加载分类列表。";
  } finally {
    isLoading.value = false;
  }
}
onMounted(fetchCategories);
</script>

<style scoped>
.category-card {
  margin-top: 1rem; /* 卡片上边距 */
  margin-bottom: 1rem; /* 卡片下边距 */
}

.category-card a {
  text-decoration: none;
  color: inherit;
}

.category-card:hover {
  border-color: var(--el-color-primary);
}
</style>
