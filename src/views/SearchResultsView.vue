<template>
  <div class="search-results-view">
    <div class="search-header">
      <h1>{{ query === '*' ? '所有结果' : `搜索结果 for "${query}"` }}</h1>
    </div>

    <el-main>
      <el-tabs v-model="activeTab" class="search-tabs">
        <el-tab-pane label="食谱" name="recipes"></el-tab-pane>
        <el-tab-pane label="用户" name="users"></el-tab-pane>
      </el-tabs>

      <div v-if="activeTab === 'recipes'" class="controls-bar">
        <el-radio-group v-model="selectedCategory" size="large" class="category-filter">
          <el-radio-button v-for="cat in categories" :key="cat" :label="cat"/>
        </el-radio-group>

        <el-select v-model="sortBy" placeholder="排序方式" size="large" class="sort-select">
          <el-option label="默认排序" value="default"></el-option>
          <el-option label="最新发布" value="newest"></el-option>
          <el-option label="最早发布" value="oldest"></el-option>
        </el-select>
      </div>

      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="activeTab === 'recipes' && !filteredRecipes.length" class="empty-state">
        <el-empty :description="`没有找到与 '${query}' 相关的食谱`"/>
      </div>
      <div v-else-if="activeTab === 'users' && !filteredUsers.length" class="empty-state">
        <el-empty :description="`没有找到与 '${query}' 相关的用户`"/>
      </div>

      <div v-else>
        <div v-show="activeTab === 'recipes'" class="results-container">
          <el-row :gutter="20">
            <el-col v-for="recipe in filteredRecipes" :key="recipe.id" :xs="24" :sm="12" :md="8" :lg="6">
              <RecipeCard :recipe="recipe"/>
            </el-col>
          </el-row>
        </div>

        <div v-show="activeTab === 'users'" class="results-container">
          <el-row :gutter="20">
            <el-col v-for="user in filteredUsers" :key="user.UserID" :span="24">
              <el-card class="user-card-list-item">
                <div class="user-info-wrapper">
                  <el-avatar :size="80" :src="user.avatar"/>
                  <div class="user-details">
                    <h3 class="username">{{ user.Username }}</h3>
                    <p class="user-meta">
                      <span>ID: {{ user.UserID }}</span>
                      <span> | </span>
                      <span>邮箱: {{ user.Email }}</span>
                      <span> | </span>
                      <span>注册于: {{ formatDate(user.RegistrationTime) }}</span>
                    </p>
                    <p class="user-stats">已发布 {{ user.recipesPublished }} 篇食谱</p>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { recipeService } from '@/services/recipeService'; // 确保路径正确
import MOCK_DATA from '@/utils/mock-data'; // 确保路径正确
import { userService } from '@/services/userService'; // 确保路径正确
import RecipeCard from "@/components/recipe/RecipeCard.vue"; // 确保路径正确
import { ElMessage } from 'element-plus'; // 导入ElMessage用于错误提示

const route = useRoute();

const query = ref('');
const selectedCategory = ref('全部');
const sortBy = ref('default');
const activeTab = ref('recipes');
const loading = ref(true); // 添加 loading 状态

// 监听路由查询参数的变化
watchEffect(() => {
  query.value = route.query.q || '';
  // 当查询参数改变时，重置分类和排序
  selectedCategory.value = '全部';
  sortBy.value = 'default';
});

// 计算属性：食谱分类
const categories = computed(() => {
  // 确保 recipeService.recipes.value 是一个数组
  const recipes = recipeService.recipes.value || [];
  let sourceRecipes;

  if (query.value === '*') {
    sourceRecipes = recipes;
  } else if (query.value) {
    const searchQuery = query.value.toLowerCase();
    sourceRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchQuery)) // 也可以搜索描述
    );
  } else {
    // 如果没有查询，默认显示所有食谱的分类
    sourceRecipes = recipes;
  }

  const all = new Set(sourceRecipes.map(r => r.recipetypename || '未知类型'));
  return ['全部', ...Array.from(all)]; // 将 Set 转换为数组
});

// 计算属性：过滤后的食谱
const filteredRecipes = computed(() => {
  const recipes = recipeService.recipes.value || []; // 确保访问 .value
  let filtered = [];

  if (query.value === '*') {
    filtered = [...recipes];
  } else if (query.value) {
    const searchQuery = query.value.toLowerCase();
    filtered = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchQuery))
    );
  } else {
    // 如果没有查询，默认不显示任何食谱（或根据产品需求显示全部）
    // 当前逻辑是：如果无查询参数，则不显示任何食谱
    return [];
  }

  // 根据分类过滤
  if (selectedCategory.value !== '全部') {
    filtered = filtered.filter(r => (r.recipetypename || '未知类型') === selectedCategory.value);
  }

  // 根据排序方式排序
  if (sortBy.value === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy.value === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  return filtered;
});

// 计算属性：过滤后的用户
const filteredUsers = computed(() => {
  const allUsers = MOCK_DATA.users || []; // 确保 MOCK_DATA.users 有值
  const allRecipes = recipeService.recipes.value || []; // 确保 recipes 有值

  let users = [];

  if (query.value === '*') {
    users = [...allUsers];
  } else if (query.value) {
    const searchQuery = query.value.toLowerCase();
    users = allUsers.filter(user =>
        user.Username.toLowerCase().includes(searchQuery) ||
        (user.Email && user.Email.toLowerCase().includes(searchQuery)) || // 也可以搜索邮箱
        (String(user.UserID) === searchQuery) // 搜索用户ID
    );
  } else {
    // 如果没有查询，默认不显示任何用户
    return [];
  }

  return users.map(user => ({
    ...user,
    // 计算每个用户发布的食谱数量
    recipesPublished: allRecipes.filter(recipe => recipe.authorId === user.UserID).length,
    // 获取用户头像，确保 userService.getUserAvatar 存在并返回有效路径
    avatar: userService.getUserAvatar(user.UserID) || 'https://cube.elemecdn.com/3/7c/3ed6895349356cb8f1929d5b7a13d.jpeg', // 提供默认头像
  }));
});

// 格式化日期函数 (用于用户注册时间)
const formatDate = (dateStr) => {
  if (!dateStr) return '未知时间';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) { // 检查日期是否有效
      return '无效日期';
    }
    return date.toLocaleDateString('zh-CN'); // 格式化为本地日期字符串
  } catch (e) {
    console.error("日期格式化错误:", e);
    return '格式错误';
  }
};

// 组件挂载时获取食谱数据
onMounted(async () => {
  loading.value = true;
  try {
    await recipeService.fetchRecipes();
    console.log('食谱数据加载完成:', recipeService.recipes.value);
  } catch (error) {
    console.error('加载食谱数据失败:', error);
    ElMessage.error('加载食谱数据失败，请稍后再试。'); // 用户友好提示
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.search-results-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: 20px;
  text-align: center;
}

.search-tabs {
  margin-bottom: 20px;
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap; /* 允许换行 */
  gap: 15px; /* 间距 */
}

.category-filter {
  flex-grow: 1; /* 允许占据更多空间 */
  min-width: 200px; /* 最小宽度 */
}

.sort-select {
  width: 150px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 50px 0;
}

.results-container {
  margin-top: 20px;
}

/* Recipe Card Styles (保持不变或根据需要调整) */
.recipe-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.recipe-card a {
  text-decoration: none;
  color: inherit;
  display: block;
}

.card-image {
  height: 200px; /* 固定图片高度 */
  overflow: hidden;
  position: relative;
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
  padding: 15px;
}

.card-content .title {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-content .description {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 10px;
  height: 40px; /* 限制描述高度 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 限制两行 */
  -webkit-box-orient: vertical;
}

.card-content .meta,
.card-content .stats {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  gap: 10px; /* 间距 */
  font-size: 0.85em;
  color: #888;
  margin-bottom: 5px;
}

.card-content .meta span,
.card-content .stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* User Card List Item Styles */
.user-card-list-item {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.user-card-list-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-info-wrapper {
  display: flex;
  align-items: center;
  padding: 15px;
}

.user-details {
  margin-left: 20px;
  flex-grow: 1;
}

.user-details .username {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.user-details .user-meta {
  font-size: 0.9em;
  color: #777;
  margin-bottom: 5px;
}

.user-details .user-meta span {
  margin-right: 5px; /* 调整间距 */
}

.user-details .user-stats {
  font-size: 1em;
  color: #555;
  font-weight: 500;
}
</style>