<script setup>
import {ref, computed, onMounted} from 'vue';
import {useRecipeStore} from '@/store/recipe';
import {useRouter, useRoute} from 'vue-router';
import RecipeCard from '@/components/RecipeCard.vue';
import Carousel from "@/components/Carousel.vue";

const recipeStore = useRecipeStore();
const router = useRouter(); // 引入 router
useRoute();
const category = ref('全部');
ref('');
// 搜索查询绑定

// 该计算属性生成筛选栏的分类列表
const categories = computed(() => {
  const all = new Set(recipeStore.recipes.map(r => r.recipetypename || '未知类型'));
  return ['全部', ...all];
});

// FIX: 该计算属性现在只根据分类进行筛选
// 搜索功能将通过跳转到专门的搜索页面来处理
const filteredRecipes = computed(() => {
  let recipes = recipeStore.recipes;

  // 根据分类进行筛选
  if (category.value && category.value !== '全部') {
    recipes = recipes.filter(r => (r.recipetypename || '未知类型') === category.value);
  }

  return recipes;
});

// 新增：执行搜索并跳转到搜索结果页
// 组件挂载时获取初始食谱数据
onMounted(() => {
  recipeStore.fetchRecipes();
});
</script>

<template>
  <el-container class="home-view">
    <el-main>
      <!-- 轮播图组件 -->
      <carousel :items="recipeStore.recipes.slice(0, 5) || []"/>

      <el-affix :offset="60">
        <div class="filter-bar">
          <!-- 分类筛选 -->
          <el-radio-group v-model="category" class="category-group">
            <el-radio-button v-for="cat in categories" :key="cat" :label="cat"/>
          </el-radio-group>
        </div>
      </el-affix>

      <!-- 加载状态 -->
      <div v-if="recipeStore.isLoading" v-loading="true" class="loading-state"></div>

      <!-- 食谱列表 -->
      <el-row v-else-if="filteredRecipes.length" :gutter="20">
        <el-col
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            :xs="24" :sm="12" :md="8" :lg="6"
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
