<template>
  <div class="recipe-list-container">
    <div style="margin-bottom: 15px;">
      <el-select v-model="selectedStatus" placeholder="请选择审核状态" clearable>
        <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
    </div>
    <ul v-if="filteredRecipes.length > 0">
      <li
          v-for="recipe in filteredRecipes"
          :key="recipe.RecipeID"
          @click="selectRecipe(recipe)"

          :class="[
            'recipe-item',
            `status-${recipe.Status}`,
            { selected: selectedRecipeId === recipe.RecipeID }
          ]"
      >
        <h4>{{ recipe.Title }}</h4>
        <p>分类: {{ recipe.RecipetypeName }}</p>
        <p>提交于: {{ recipe.UploadTime }}</p>
      </li>
    </ul>
    <p v-else>没有符合当前筛选条件的菜谱。</p>
  </div>
</template>

<script setup>
import {defineProps, defineEmits, computed} from 'vue';

const props = defineProps({
  recipes: {
    type: Array,
    required: true
  },
  selectedRecipeId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['select-recipe', 'update:selectedStatus']);

const selectedStatus = defineModel('selectedStatus', {default: ''});
const statusOptions = [
  {label: '全部', value: ''},
  {label: '待审核', value: 'pending'},
  {label: '已通过', value: 'approved'},
  {label: '已拒绝', value: 'rejected'}
];

const filteredRecipes = computed(() => {
  if (!selectedStatus.value) {
    return props.recipes;
  }
  return props.recipes.filter(recipe => recipe.Status === selectedStatus.value);
});

const selectRecipe = (recipe) => {
  emit('select-recipe', recipe);
};
</script>

<style scoped>
.recipe-list-container div[style] {
  display: flex;
  justify-content: flex-end;
}

.el-select {
  width: 150px;
}

.recipe-list-container ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* ⭐ 改动 2: 将原 li 样式移至 .recipe-item，并添加 position: relative */
.recipe-item {
  position: relative; /* 为伪元素定位提供基准 */
  border: 1px solid #e0e0e0;
  padding: 15px;
  padding-left: 25px; /* 为左侧标记留出空间 */
  margin-bottom: 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s, box-shadow 0.3s;
  overflow: hidden; /* 确保伪元素不会超出圆角范围 */
}

/* ⭐ 改动 3: 使用 ::before 伪元素创建状态标记 */
.recipe-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px; /* 标记的宽度 */
  background-color: #ccc; /* 默认颜色 */
}

.recipe-item:hover {
  background-color: #f9f9f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.recipe-item.selected {
  background-color: #e7f3ff;
  border-color: #409eff;
}

.recipe-list-container h4 {
  margin: 0 0 5px 0;
}

.recipe-list-container p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

/* ⭐ 改动 4: 为不同的状态设置不同的标记颜色 */
.recipe-item.status-approved::before {
  background-color: #67c23a; /* 绿色: 已通过 */
}

.recipe-item.status-pending::before {
  background-color: #e6a23c; /* 黄色: 待审核 */
}

.recipe-item.status-rejected::before {
  background-color: #f56c6c; /* 红色: 已拒绝 */
}
</style>