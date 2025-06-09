<script setup>
import { computed, onMounted } from 'vue';
import { useRecipeStore } from '@/store/recipe';
import { useRoute } from 'vue-router';
import IngredientList from '@/components/IngredientList.vue';
import StepByStepGuide from '@/components/StepByStepGuide.vue';
import CommentSection from '@/components/CommentSection.vue';

const props = defineProps({
  id: String,
});

const recipeStore = useRecipeStore();
const route = useRoute();

onMounted(() => {
  // Ensure data is available if user directly navigates to this page
  recipeStore.fetchRecipes();
});

const recipe = computed(() => recipeStore.getRecipeById(props.id));

const isLiked = computed(() => recipeStore.isLiked(props.id));
const isFavorite = computed(() => recipeStore.isFavorite(props.id));

</script>

<template>
  <div v-if="recipe" class="recipe-detail-view">
    <el-page-header @back="$router.back()" :content="recipe.title" class="page-header" />

    <el-row :gutter="30">
      <el-col :md="14">
        <el-card>
          <img :src="recipe.coverImage" class="recipe-image" />
          <div class="recipe-header">
            <h1>{{ recipe.title }}</h1>
            <div class="meta">
              <span>作者: {{ recipe.authorName }}</span>
              <span>难度: {{ recipe.difficulty }}</span>
              <span>耗时: {{ recipe.prepTime }} 分钟</span>
            </div>
            <p class="description">{{ recipe.description }}</p>
          </div>
        </el-card>

        <el-card class="steps-card">
          <StepByStepGuide :steps="recipe.steps" />
        </el-card>

        <el-card>
          <CommentSection :recipe-id="recipe.id" />
        </el-card>
      </el-col>

      <el-col :md="10">
        <el-affix :offset="80">
          <el-card class="actions-card">
            <div class="action-buttons">
              <el-button
                  :type="isLiked ? 'danger' : 'default'"
                  :icon="'Pointer'"
                  @click="recipeStore.toggleLike(recipe.id)"
              >
                {{ isLiked ? '已点赞' : '点赞' }} ({{ recipe.likes }})
              </el-button>
              <el-button
                  :type="isFavorite ? 'warning' : 'default'"
                  :icon="'Star'"
                  @click="recipeStore.toggleFavorite(recipe.id)"
              >
                {{ isFavorite ? '已收藏' : '收藏' }} ({{ recipe.favorites }})
              </el-button>
            </div>
          </el-card>

          <el-card class="ingredients-card">
            <IngredientList :ingredients="recipe.ingredients" />
          </el-card>
        </el-affix>
      </el-col>
    </el-row>
  </div>
  <el-empty v-else description="正在加载食谱..." />
</template>

<style scoped>
.recipe-detail-view {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}
.page-header {
  margin-bottom: 20px;
}
.recipe-image {
  width: 100%;
  border-radius: 8px;
}
.recipe-header {
  margin-top: 20px;
}
.meta {
  display: flex;
  gap: 20px;
  color: #888;
  margin: 10px 0;
}
.description {
  line-height: 1.7;
}
.steps-card, .ingredients-card {
  margin-top: 20px;
}
.action-buttons {
  display: flex;
  gap: 15px;
}
</style>