<template>
  <div
    class="not-found-page flex justify-center items-center"
    style="flex-grow: 1"
  >
    <el-result
      icon="error"
      title="404 - 页面未找到"
      sub-title="抱歉，您访问的页面不存在或已被移除。"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')"
          >返回首页</el-button
        >
      </template>
    </el-result>
  </div>
</template>

<script setup>
// 无特定脚本逻辑
</script>

<style scoped>
.not-found-page {
  padding: 20px;
}
</style>
