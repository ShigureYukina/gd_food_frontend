<script setup>
defineProps({
  recipe: {
    type: Object,
    required: true,
  },
});

</script>

<template>
  <el-card shadow="hover" class="recipe-card">
    <router-link :to="{ name: 'recipe-detail', params: { id: recipe.id } }">
      <div class="card-image">
        <el-image :src="recipe.coverImage" fit="cover" lazy>
          <template #error>
            <div class="image-slot">
              <el-icon>
                <Picture/>
              </el-icon>
            </div>
          </template>
        </el-image>
      </div>
      <div class="card-content">
        <h3 class="title">{{ recipe.title }}</h3>
        <p class="description">{{ recipe.description }}</p>
        <div class="meta">
          <span><el-icon><User/></el-icon> {{ recipe.authorName }}</span>
          <span><el-icon><Calendar/></el-icon> {{ recipe.createdAt }}</span>
          <span><el-icon><FolderOpened/></el-icon> {{ recipe.recipetypename || '未知类型' }}</span>
        </div>
        <div class="stats">
          <span><el-icon><Star/></el-icon> {{ recipe.favorites }}</span>
          <span><el-icon><Pointer/></el-icon> {{ recipe.likes }}</span>
        </div>
      </div>
    </router-link>
  </el-card>
</template>

<style scoped>
.recipe-card {
  border: 1px solid var(--border-color);
  background-color: var(--card-bg-color);
  transition: transform 0.2s ease-in-out;
  border-radius: 8px;
  overflow: hidden;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  height: 200px;
  background-color: #f0f2f5;
}

.el-image {
  width: 100%;
  height: 100%;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 30px;
}

.card-content {
  padding: 16px;
}

.title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color);
}

.description {
  font-size: 0.9rem;
  color: #888;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta, .stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #aaa;
  margin-top: 16px;
}

.meta span, .stats span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
