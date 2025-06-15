<script setup>
import {computed, defineProps, defineEmits} from 'vue';

const props = defineProps({
  recipes: {
    type: Array,
    required: true,
  },
  selectedRecipeId: {
    type: Number,
    default: null,
  },
  selectedStatus: { // 接收父组件传递的筛选状态
    type: String,
    default: '', // 默认为空字符串，表示“全部”
  },
});

const emit = defineEmits(['select-recipe', 'update:selectedStatus']); // 声明发射事件
const handleTabClick = (status) => {
  emit('update:selectedStatus', status); // 发出事件，父组件更新
};
const statusOptions = [
  {label: '全部', value: ''},
  {label: '待审核', value: 'pending'},
  {label: '已通过', value: 'approved'},
  {label: '已拒绝', value: 'rejected'},
];

const filteredRecipes = computed(() => {
  // 注意：这里不再需要额外的过滤逻辑，因为父组件 AuditDashboard 已经根据 selectedFilterStatus 过滤了数据。
  // props.recipes 已经是经过父组件筛选后的结果。
  return props.recipes;
});

const selectRecipe = (recipe) => {
  emit('select-recipe', recipe);
};

// 使用 computed 属性的 getter 和 setter 来实现 v-model 的效果
const selectedStatusProxy = computed({
  get() {
    return props.selectedStatus;
  },
  set(value) {
    emit('update:selectedStatus', value); // 当值改变时，发射事件通知父组件
  },
});
</script>

<template>
  <div class="recipe-list-container">
    <div style="margin-bottom: 15px;">
      <el-select
          v-model="selectedStatusProxy"
          placeholder="请选择审核状态"
          clearable
      >
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
          :key="recipe.id"
          @click="selectRecipe(recipe)"
          :class="[
          'recipe-item',
          `status-${recipe.status}`,
          { selected: selectedRecipeId === recipe.id }
        ]"
      >
        <h4>{{ recipe.title }}</h4>
        <p>分类: {{ recipe.recipetypename }}</p>
        <p>提交于: {{ recipe.createdAt }}</p>
      </li>
    </ul>
    <p v-else>没有符合当前筛选条件的菜谱。</p>
  </div>
</template>





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