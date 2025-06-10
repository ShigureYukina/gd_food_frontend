<script setup>
import {ref, computed, onMounted} from 'vue';
import {useRecipeStore} from '@/store/recipe';
import {useRoute} from 'vue-router';
import RecipeCard from '@/components/RecipeCard.vue';
import Carousel from "@/components/Carousel.vue";

const recipeStore = useRecipeStore();
const route = useRoute();


const category = ref('全部');
const searchQuery = ref(route.query.search || '');


const categories = computed(() => {
  const all = new Set(recipeStore.recipes.map(r => r.recipetypename || '未知类型'));
  return ['全部', ...all];
});

const filteredRecipes = computed(() => {
  let recipes = recipeStore.recipes;

  if (category.value && category.value !== '全部') {
    recipes = recipes.filter(r => (r.recipetypename || '未知类型') === category.value);
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    recipes = recipes.filter(r => r.title.toLowerCase().includes(query));
  }

  return recipes;
});

onMounted(() => {
  recipeStore.fetchRecipes();
});

// Optional: A handler for the change event if you need to perform actions other than filtering.
// 新增导出函数
</script>

<template>
  <el-container class="home-view">
    <el-main>
      <!-- 添加导出按钮 -->

      <carousel :items="recipeStore.carouselItems"/>

      <el-affix :offset="60">
        <div class="filter-bar">
          <el-radio-group v-model="category">
            <el-radio-button v-for="cat in categories" :key="cat" :label="cat"/>
          </el-radio-group>
        </div>
      </el-affix>

      <div v-if="recipeStore.isLoading" v-loading="true" class="loading-state"></div>

      <el-row v-else-if="filteredRecipes.length" :gutter="20">
        <el-col
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            :xs="24" :sm="12" :md="8" :lg="6"
        >
          <RecipeCard :recipe="recipe"/>
        </el-col>
      </el-row>

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
  padding: 15px;
  background-color: var(--card-bg-color);
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
}

.loading-state {
  height: 50vh;
}
</style>
