<template>
  <div class="audit-dashboard">
    <h1>菜谱管理面板</h1>
    <div class="panel-layout">
      <div class="list-pane">
        <h3>菜谱列表</h3>
        <RecipeList
            :recipes="filteredRecipes"
            :selectedRecipeId="selectedRecipe?.id"
            v-model:selectedStatus="selectedStatus"
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
import { ref, onMounted, computed } from 'vue';
import { recipeService } from '@/services/recipeService';
import RecipeList from '@/components/manager/RecipeList.vue';
import RecipeDetail from '@/components/manager/ManageRecipe.vue';

// 父组件：使用 ref 作为响应式变量
const selectedStatus = ref('pending');


const allRecipes = ref([]);
const selectedRecipe = ref(null);
const commentsByRecipeId = ref({});

onMounted(async () => {
  try {
    // Assuming fetchRecipes fetches all recipes regardless of status
    const { recipes, comments } = await recipeService.fetchRecipes();
    allRecipes.value = recipes;
    commentsByRecipeId.value = comments;
  } catch (error) {
    console.error('加载菜谱失败', error);
  }
});

const filteredRecipes = computed(() =>
    allRecipes.value.filter(recipe =>
        selectedStatus.value === '' || recipe.status === selectedStatus.value
    )
);

const selectedRecipeWithDetails = computed(() => {
  if (!selectedRecipe.value) return null;
  return {
    ...selectedRecipe.value,
    reviews: commentsByRecipeId.value[selectedRecipe.value.id] || [],
  };
});

const handleRecipeSelection = (recipe) => {
  console.log('选中菜谱:', recipe);
  if (recipe && recipe.id) {
    console.log('选中菜谱ID:', recipe.id);
  } else {
    console.warn('选中菜谱无效或无ID');
  }
  selectedRecipe.value = recipe;
};


const handleRecipeStatusUpdate = async (recipeId, newStatus) => {
  const success = await recipeService.updateRecipeStatus(recipeId, newStatus);
  if (success) {
    const recipe = allRecipes.value.find(r => r.id === recipeId);
    if (recipe) {
      recipe.status = newStatus;
    }
    console.log(`菜谱ID ${recipeId} 状态已更新为: ${newStatus}`);
    // The list will now automatically update.
    // Clear the selection to show the placeholder.
    selectedRecipe.value = null;
  } else {
    console.error('更新菜谱状态失败');
  }
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