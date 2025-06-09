<script setup>
import {ref, computed, onMounted} from 'vue';
import {useRecipeStore} from '@/store/recipe';
import {useRoute} from 'vue-router';
import RecipeCard from '@/components/RecipeCard.vue';
import Carousel from "@/components/Carousel.vue";

const recipeStore = useRecipeStore();
const route = useRoute();

const category = ref('');
const searchQuery = ref(route.query.search || '');

const categories = computed(() => {
  const all = new Set(recipeStore.recipes.map(r => r.category));
  return ['全部', ...all];
});

const filteredRecipes = computed(() => {
  let recipes = recipeStore.recipes;

  if (category.value && category.value !== '全部') {
    recipes = recipes.filter(r => r.category === category.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    recipes = recipes.filter(r => r.title.toLowerCase().includes(query));
  }

  return recipes;
});

onMounted(() => {
  recipeStore.fetchRecipes();
});
</script>

<template>
  <el-container class="home-view">
    <el-main>
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

.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
  text-align: center;
}

</style>