<script setup>
defineProps({
  ingredients: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="ingredient-list">
    <h3>
      <el-icon>
        <Notebook/>
      </el-icon>
      食材清单
    </h3>
    <el-table :data="ingredients" stripe border style="width: 100%">
      <el-table-column prop="name" label="食材"/>
      <el-table-column prop="quantity" label="用量"/>
    </el-table>
  </div>
</template>

<style scoped>
.ingredient-list {
  margin-bottom: 30px;
}

h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}
</style>