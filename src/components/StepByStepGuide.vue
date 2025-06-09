<script setup>
defineProps({
  steps: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="step-guide">
    <h3><el-icon><Dish /></el-icon> 烹饪步骤</h3>
    <el-timeline>
      <el-timeline-item
          v-for="step in steps"
          :key="step.stepNumber"
          :timestamp="`第 ${step.stepNumber} 步`"
          placement="top"
      >
        <el-card>
          <p>{{ step.description }}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<style scoped>
.step-guide {
  margin-top: 30px;
}
h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}
</style>