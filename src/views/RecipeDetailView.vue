<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRecipeStore } from '@/store/recipe';

// 導入子組件
import RecipeStory from '@/components/RecipeStory.vue';
import StepByStepGuide from '@/components/StepByStepGuide.vue';
import CommentSection from '@/components/CommentSection.vue';
import IngredientList from '@/components/IngredientList.vue';

const route = useRoute();
const recipeStore = useRecipeStore();

const props = defineProps({
  id: {
    type: String,
    required: true,
  }
});

onMounted(() => {
  recipeStore.fetchRecipes();
});

// 透過 ID 獲取食譜數據
const recipe = computed(() => recipeStore.getRecipeById(props.id));

// 獲取點讚和收藏的狀態
const isLiked = computed(() => recipeStore.isLiked(props.id));
const isFavorite = computed(() => recipeStore.isFavorite(props.id));

</script>

<template>
  <div v-if="recipe" class="recipe-detail-view">
    <el-page-header @back="$router.back()" :content="recipe.title" class="page-header"/>

    <el-row :gutter="30">
      <el-col :md="14">
        <el-card>
          <img :src="recipe.coverImage" class="recipe-image" alt="食谱封面"/>
          <div class="recipe-header">
            <h1>{{ recipe.title }}</h1>
            <div class="meta">
              <span>作者: {{ recipe.authorName }}</span>
              <span>难度: {{ recipe.difficulty }}</span>
<!--              <span>耗时: {{ recipe.prepTime }} 分钟</span>-->
            </div>
            <div class="recipe-detail-content">
              <p class="description">{{ recipe.description }}</p>
            </div>
          </div>
        </el-card>

        <RecipeStory :recipe="recipe" />

        <el-card class="steps-card">
          <StepByStepGuide :steps="recipe.steps"/>
        </el-card>

        <el-card class="comment-card">
          <CommentSection :recipe-id="recipe.id"/>
        </el-card>
      </el-col>

      <el-col :md="10">
        <el-affix :offset="80">
          <el-card class="actions-card">
            <div class="action-buttons">
              <el-button
                  :type="isLiked ? 'primary' : 'default'"
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
            <IngredientList :ingredients="recipe.ingredients"/>
          </el-card>
        </el-affix>
      </el-col>
    </el-row>
  </div>
  <el-empty v-else description="正在加载食谱..."/>
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
  object-fit: cover;
}

.recipe-header {
  margin-top: 20px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: #888;
  margin: 10px 0;
}

.description {
  line-height: 1.7;
}

.ingredients-section {
  margin-top: 20px;
}

.steps-card, .comment-card, .actions-card, .ingredients-card {
  margin-top: 20px;
}

.action-buttons {
  display: flex;
  gap: 15px;
}
</style>