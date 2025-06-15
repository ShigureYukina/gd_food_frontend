<script setup>
import {ref, computed, onMounted} from 'vue';
import {recipeService} from '@/services/recipeService';
import {useRouter} from 'vue-router';
import RecipeCard from '@/components/recipe/RecipeCard.vue';
import Carousel from "@/components/base/Carousel.vue";

const router = useRouter();

const recipes = ref([]);
const comments = ref({});
const loading = ref(false);
const error = ref(null);

const category = ref('全部');
const searchQuery = ref('');

const categories = computed(() => {
  const allTypes = new Set(recipes.value.map(r => r.recipetypename || '未知类型'));
  return ['全部', ...allTypes];
});

const filteredRecipes = computed(() => {
  if (category.value === '全部') {
    return recipes.value;
  }
  return recipes.value.filter(r => (r.recipetypename || '未知类型') === category.value);
});

function onSearch() {
  if (!searchQuery.value.trim()) return;
  router.push({name: 'SearchResults', query: {q: searchQuery.value.trim()}});
}

async function loadRecipes() {
  loading.value = true;
  error.value = null;
  try {
    const data = await recipeService.fetchRecipes();
    recipes.value = data.recipes;
    comments.value = data.comments;
  } catch (e) {
    error.value = e.message || '加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadRecipes();
});
</script>

<template>
  <el-container class="home-view">
    <el-main>
      <!-- 轮播图组件 -->
      <carousel :items="recipes.slice(0, 5)"/>

      <el-affix :offset="60">
        <div class="filter-bar">
          <!-- 分类筛选 -->
          <el-radio-group v-model="category" class="category-group">
            <el-radio-button v-for="cat in categories" :key="cat" :label="cat"/>
          </el-radio-group>
        </div>
      </el-affix>

      <!-- 加载状态 -->
      <div v-if="loading" v-loading="true" class="loading-state"></div>

      <!-- 食谱列表 -->
      <el-row v-else-if="filteredRecipes.length" :gutter="20">
        <el-col
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
        >
          <RecipeCard :recipe="recipe"/>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <el-empty v-else description="没有找到匹配的食谱"/>
    </el-main>
  </el-container>
</template>

<style scoped>
.home-view {
  max-width: 1500px;
  margin: 20px auto;
  padding: 0 20px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px; /* 增加元素间距 */
  padding: 15px;
  background-color: var(--card-bg-color);
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
}

.category-group {
  flex-shrink: 0; /* 防止分类组被压缩 */
}

.loading-state {
  height: 50vh;
}
</style>
