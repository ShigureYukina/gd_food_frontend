<script setup>
import { computed, onMounted } from 'vue';
import { useRecipeStore } from '@/store/recipe';
import RecipeCard from '@/components/RecipeCard.vue';

const recipeStore = useRecipeStore();
const favoriteRecipes = computed(() => recipeStore.favoriteRecipes);

onMounted(() => {
  recipeStore.fetchRecipes();
});
</script>

<template>
  <div class="favorites-view">
    <el-page-header @back="$router.back()" content="我的收藏" class="page-header" />

    <div v-if="recipeStore.isLoading" v-loading="true" class="loading-state"></div>

    <el-row v-else-if="favoriteRecipes.length" :gutter="20">
      <el-col
          v-for="recipe in favoriteRecipes"
          :key="recipe.id"
          :xs="24" :sm="12" :md="8" :lg="6"
      >
        <RecipeCard :recipe="recipe" />
      </el-col>
    </el-row>

    <el-empty v-else description="你还没有收藏任何食谱哦">
      <el-button type="primary" @click="$router.push('/')">去逛逛</el-button>
    </el-empty>
  </div>
</template>

<style scoped>
.favorites-view {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}
.page-header {
  margin-bottom: 20px;
}
.el-col {
  margin-bottom: 20px;
}
.loading-state {
  height: 50vh;
}
</style>