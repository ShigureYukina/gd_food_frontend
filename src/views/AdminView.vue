<template>
  <div class="audit-dashboard">
    <h1>菜谱管理面板</h1>
    <div class="panel-layout">
      <div class="list-pane">
        <h3>菜谱列表</h3>
        <RecipeList
            :recipes="pendingRecipes"
            :selected-recipe-id="selectedRecipe?.RecipeID"
            @select-recipe="handleRecipeSelection"
        />
      </div>
      <div class="detail-pane">
        <RecipeDetail
            :recipe="selectedRecipeWithDetails"
            @update-status="handleRecipeStatusUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import mockData from '@/utils/mock-data'; // @ 是 src 目录的别名
import RecipeList from '@/components/RecipeList.vue';
import RecipeDetail from '@/components/RecipeDetail.vue';

// 使用 ref 创建响应式状态
const allRecipes = ref([]);
const selectedRecipe = ref(null);

// onMounted 生命周期钩子，在组件挂载后执行
onMounted(() => {
  // 在真实应用中，这里会是 API 请求
  // 为了演示，我们给每个菜谱添加一个 'status' 属性
  allRecipes.value = mockData.recipes.map(recipe => ({
    ...recipe,
    status: 'pending'
  }));
});

// 计算属性，用于筛选出待审核的菜谱
const pendingRecipes = computed(() => {
  return allRecipes.value.filter(r => r.status === 'pending');
});

// 计算属性，为选中的菜谱附加作者和评价信息
const selectedRecipeWithDetails = computed(() => {
  if (!selectedRecipe.value) return null;

  const author = mockData.users.find(user => user.UserID === selectedRecipe.value.UserID);
  const reviews = mockData.reviews.filter(review => review.RecipeID === selectedRecipe.value.RecipeID);

  return {
    ...selectedRecipe.value,
    author,
    reviews
  };
});

// 处理从 RecipeList 组件传来的 'select-recipe' 事件
const handleRecipeSelection = (recipe) => {
  selectedRecipe.value = recipe;
};

// 处理从 RecipeDetail 组件传来的 'update-status' 事件
const handleRecipeStatusUpdate = (recipeId, newStatus) => {
  const recipe = allRecipes.value.find(r => r.RecipeID === recipeId);
  if (recipe) {
    recipe.status = newStatus;
  }
  // 操作完成后清空当前选择
  selectedRecipe.value = null;
};
</script>

<style scoped>
.audit-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.audit-dashboard h1 {
  text-align: center;
  margin-bottom: 30px;
}

.panel-layout {
  display: flex;
  gap: 20px;
}

.list-pane {
  width: 35%;
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 15px;
}

.detail-pane {
  width: 65%;
}

/* 美化滚动条 */
.list-pane::-webkit-scrollbar {
  width: 8px;
}

.list-pane::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.list-pane::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.list-pane::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>