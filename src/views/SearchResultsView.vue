<template>
  <div class="search-results-view">
    <div class="search-header">
      <!-- FIX: Update header title to be more generic for tabbed view -->
      <h1>{{ query === '*' ? '所有结果' : `搜索结果 for "${query}"` }}</h1>
    </div>

    <el-main>
      <!-- FIX: Add tabs to switch between recipe and user search results -->
      <el-tabs v-model="activeTab" class="search-tabs">
        <el-tab-pane label="食谱" name="recipes"></el-tab-pane>
        <el-tab-pane label="用户" name="users"></el-tab-pane>
      </el-tabs>

      <!-- Filter and Sort Controls - Only for Recipes -->
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

      <!-- Loading State -->
      <div v-if="recipeStore.isLoading" class="loading-state" v-loading="true"></div>

      <!-- Empty State for Recipes -->
      <div v-else-if="activeTab === 'recipes' && !filteredRecipes.length" class="empty-state">
        <el-empty :description="`没有找到与 '${query}' 相关的食谱`"/>
      </div>

      <!-- Empty State for Users -->
      <div v-else-if="activeTab === 'users' && !filteredUsers.length" class="empty-state">
        <el-empty :description="`没有找到与 '${query}' 相关的用户`"/>
      </div>

      <!-- Search Results Lists -->
      <div v-else>
        <!-- Recipe Results -->
        <div v-show="activeTab === 'recipes'" class="results-container">
          <el-row :gutter="20">
            <el-col v-for="recipe in filteredRecipes" :key="recipe.id" :xs="24" :sm="12" :md="8" :lg="6">
              <RecipeCard :recipe="recipe"/>
            </el-col>
          </el-row>
        </div>

        <!-- User Results -->
        <div v-show="activeTab === 'users'" class="results-container">
          <!-- FIX: Change to a single-column list layout -->
          <el-row :gutter="20">
            <el-col v-for="user in filteredUsers" :key="user.UserID" :span="24">
              <!-- FIX: Redesigned user card for list view -->
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
                      <span>注册于: {{ user.RegistrationTime }}</span>
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
import {ref, computed, onMounted, watchEffect} from 'vue';
import {useRoute} from 'vue-router';
import {useRecipeStore} from '@/store/recipe';
import RecipeCard from '@/components/RecipeCard.vue';
import MOCK_DATA from '@/utils/mock-data'; // Import the full mock data

const route = useRoute();
const recipeStore = useRecipeStore();

// State for search, filter, and sort
const query = ref('');
const selectedCategory = ref('全部');
const sortBy = ref('default');
const activeTab = ref('recipes'); // Default to the recipes tab

// Update the query when the route changes
watchEffect(() => {
  query.value = route.query.q || '';
});

// Get available categories from the initial recipe search results
const categories = computed(() => {
  let sourceRecipes;
  if (query.value === '*') {
    sourceRecipes = recipeStore.recipes;
  } else if (query.value) {
    sourceRecipes = recipeStore.recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(query.value.toLowerCase())
    );
  } else {
    return ['全部'];
  }
  const all = new Set(sourceRecipes.map(r => r.recipetypename || '未知类型'));
  return ['全部', ...all];
});


// Computed property to filter and sort recipes
const filteredRecipes = computed(() => {
  let recipes;
  if (query.value === '*') {
    recipes = [...recipeStore.recipes];
  } else if (query.value) {
    const searchQuery = query.value.toLowerCase();
    recipes = recipeStore.recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery)
    );
  } else {
    return [];
  }

  if (selectedCategory.value && selectedCategory.value !== '全部') {
    recipes = recipes.filter(r => (r.recipetypename || '未知类型') === selectedCategory.value);
  }

  if (sortBy.value === 'newest') {
    recipes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy.value === 'oldest') {
    recipes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  return recipes;
});

// Computed property to filter users
const filteredUsers = computed(() => {
  let users;
  // FIX: Start with all users if query is '*'
  if (query.value === '*') {
    users = MOCK_DATA.users;
  }
  // Filter by username for other queries
  else if (query.value) {
    const searchQuery = query.value.toLowerCase();
    users = MOCK_DATA.users.filter(user =>
        user.Username.toLowerCase().includes(searchQuery)
    );
  }
  // Return empty if no query
  else {
    return [];
  }

  // FIX: Augment user data with recipe count and avatar
  return users.map(user => {
    const recipesPublished = recipeStore.recipes.filter(recipe => recipe.authorId === user.UserID).length;
    return {
      ...user,
      recipesPublished: recipesPublished,
      avatar: `https://i.pravatar.cc/150?u=${user.UserID}`
    }
  });
});

// Fetch recipe data on component mount
onMounted(() => {
  recipeStore.fetchRecipes();
});
</script>

<style scoped>
.search-results-view {
  max-width: 1500px;
  margin: 20px auto;
  padding: 0 20px;
}

.search-header {
  text-align: center;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.search-tabs {
  margin-bottom: 20px;
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 15px;
  background-color: var(--card-bg-color);
  border-radius: 4px;
  margin-bottom: 30px;
}

.category-filter {
  flex-grow: 1;
}

.sort-select {
  width: 150px;
  flex-shrink: 0;
}

.results-container {
  padding: 20px 0;
}

/* FIX: Remove old user card styles */

.loading-state, .empty-state {
  height: 50vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* FIX: Add new styles for the list-item user card */
.user-card-list-item {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.user-card-list-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--el-box-shadow-light);
}

.user-info-wrapper {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 8px;
}

.user-details {
  flex-grow: 1;
}

.username {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.user-meta,
.user-stats {
  font-size: 0.9rem;
  color: var(--el-text-color-secondary);
  margin: 4px 0;
}

.user-meta span {
  margin-right: 8px;
}
</style>
