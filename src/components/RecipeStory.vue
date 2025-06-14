<template>
  <el-card v-if="recipe && recipe.story" class="story-card">
    <template #header>
      <div class="card-header">
        <h3>菜谱故事</h3>
      </div>
    </template>
    <p class="story-content">{{ recipe.story }}</p>
  </el-card>
</template>

<script setup>
import {defineProps} from 'vue';

defineProps({
  recipe: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.story-card {
  margin-top: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  border-left: 4px solid var(--el-color-primary);
  padding-left: 10px;
  color: var(--text-color);
}

.story-content {
  line-height: 1.7;
  font-size: 14px;
  color: var(--text-color);
  margin: 0;
  white-space: pre-line;
}
</style>