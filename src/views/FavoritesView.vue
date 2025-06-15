<script setup>
import { ref, computed, onMounted } from 'vue';
import { favoriteService } from '@/services/favoriteService';
import { recipeService } from '@/services/recipeService';
import { useGlobalStore } from '@/store/globalStore';
import RecipeCard from '@/components/recipe/RecipeCard.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const globalStore = useGlobalStore();

const currentUserId = computed(() => globalStore.userId);

const allRecipes = ref([]);           // 全部食谱数据
const favoriteRecipeIds = ref([]);    // 当前用户收藏的食谱ID列表
const favoriteRecipes = computed(() => {
  return allRecipes.value.filter(recipe => favoriteRecipeIds.value.includes(String(recipe.id)));
});

const isLoading = ref(false);
const error = ref(null);

async function loadData() {
  if (!currentUserId.value) {
    error.value = '请先登录';
    return;
  }

  isLoading.value = true;
  error.value = null;
  try {
    // 1. 获取全部食谱
    const { recipes } = await recipeService.fetchRecipes();
    allRecipes.value = recipes;

    // 2. 获取当前用户收藏的食谱ID列表
    favoriteRecipeIds.value = await favoriteService.fetchFavoritesByUser(currentUserId.value);
  } catch (e) {
    error.value = e.message || '加载失败';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="favorites-view">
    <el-page-header @back="router.back()" content="我的收藏" class="page-header" />

    <div v-if="isLoading" v-loading class="loading-state"></div>

    <el-row v-else-if="favoriteRecipes.length" :gutter="20">
      <el-col
          v-for="recipe in favoriteRecipes"
          :key="recipe.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
      >
        <RecipeCard :recipe="recipe" />
      </el-col>
    </el-row>

    <el-empty v-else description="你还没有收藏任何食谱哦">
      <el-button type="primary" @click="router.push('/')">去逛逛</el-button>
    </el-empty>

    <el-alert v-if="error" type="error" :title="error" />
  </div>
</template>

<style scoped>
.loading-state {
  height: 50vh;
}

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