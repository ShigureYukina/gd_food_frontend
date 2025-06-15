<script setup>
import {computed, ref, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import {useGlobalStore} from '@/store/globalStore';
import {recipeService} from '@/services/recipeService';
import {favoriteService} from '@/services/favoriteService';
import {likeService} from '@/services/likeService'; // 引入点赞服务
import StepByStepGuide from '@/components/recipe/StepByStepGuide.vue';
import CommentSection from '@/components/comment/CommentSection.vue';
import IngredientList from '@/components/recipe/IngredientList.vue';

const route = useRoute();
const globalStore = useGlobalStore();

const props = defineProps({
  id: {
    type: String,
    required: true,
  }
});

const currentUserId = computed(() => globalStore.userId);

onMounted(() => {
  recipeService.fetchRecipes();
  updateFavoriteState();
  updateLikeState(); // 初始加载点赞状态
});

const recipe = computed(() => recipeService.getRecipeById(props.id));

const isFavorite = ref(false);
const isLiked = ref(false);

// 加载收藏状态
async function updateFavoriteState() {
  if (currentUserId.value && props.id) {
    isFavorite.value = favoriteService.isFavorite(currentUserId.value, props.id);
  }
}

// 加载点赞状态
async function updateLikeState() {
  if (currentUserId.value && props.id) {
    isLiked.value = await likeService.isLiked(currentUserId.value, props.id);
  }
}

// 切换收藏状态
async function handleToggleFavorite() {
  await favoriteService.toggleFavorite(currentUserId.value, props.id);
  isFavorite.value = favoriteService.isFavorite(currentUserId.value, props.id);

  const r = recipe.value;
  if (r) {
    if (isFavorite.value) {
      r.favorites++;
    } else {
      r.favorites = Math.max(0, r.favorites - 1);
    }
  }
}

// 切换点赞状态
async function handleToggleLike() {
  await likeService.toggleLike(currentUserId.value, props.id);
  isLiked.value = await likeService.isLiked(currentUserId.value, props.id);

  const r = recipe.value;
  if (r) {
    if (isLiked.value) {
      r.likes++;
    } else {
      r.likes = Math.max(0, r.likes - 1);
    }
  }
}
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
              <!-- 新增分类显示 -->
              <span>分类ID: {{ recipe.recipetypeid || '未知ID' }}</span>
              <span>分类名称: {{ recipe.recipetypename || '未知类型' }}</span>
            </div>
            <p class="description">{{ recipe.description }}</p>
          </div>
        </el-card>

        <el-card v-if="recipe.story" class="story-card">
          <template #header>
            <div class="card-header">
              <h3>菜谱故事</h3>
            </div>
          </template>
          <p class="story-content">{{ recipe.story }}</p>
        </el-card>

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
                  @click="handleToggleFavorite"
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

.steps-card, .comment-card, .actions-card, .ingredients-card, .story-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.story-content {
  line-height: 1.6;
  color: #555;
}

.action-buttons {
  display: flex;
  gap: 15px;
}
</style>