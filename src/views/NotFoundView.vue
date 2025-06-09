<template>
  <div class="not-found-view">
    <el-result
        icon="error"
        title="404 - 页面未找到"
        sub-title="抱歉，您访问的页面不存在。"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.not-found-view {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 100px);
}
</style>