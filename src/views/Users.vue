<script setup>
import {ref, computed, onMounted, watch} from 'vue';
import {useRoute} from 'vue-router';
import {ElMessage} from 'element-plus';
import mockData from '@/utils/mock-data.js';
import {Edit, Camera} from '@element-plus/icons-vue';
import {useGlobalStore} from '@/store/global';

const route = useRoute();
const globalStore = useGlobalStore();

// --- 数据状态 ---
const currentUser = ref(null);
const allRecipes = ref(mockData.recipes);
const activeTab = ref('posts');
const profileForm = ref({
  username: '',
  email: '',
  bio: '',
});

// --- 数据加载函数 ---
const loadUserData = (userId) => {
  const foundUser = mockData.users.find(u => u.UserID.toString() === userId);
  currentUser.value = foundUser || null;

  if (currentUser.value) {
    profileForm.value = {
      username: currentUser.value.Username,
      email: currentUser.value.Email,
      bio: currentUser.value.Bio,
    };
  }
};

// --- 生命周期与侦听器 ---
onMounted(() => {
  loadUserData(route.params.userId);
});

watch(() => route.params.userId, (newId) => {
  if (newId) {
    loadUserData(newId);
  }
});


// --- 计算属性 ---
const userPosts = computed(() => {
  if (!currentUser.value) return [];
  return allRecipes.value.filter(recipe => recipe.UserID === currentUser.value.UserID);
});

const userFavorites = computed(() => {
  if (!currentUser.value) return [];
  return allRecipes.value.filter(recipe => recipe.UserID !== currentUser.value.UserID);
});

// 3. 新增计算属性，判断当前查看的是否是自己的主页
const isOwnProfile = computed(() => {
  // 确保当前登录用户ID和路由中的用户ID都存在且相等
  return globalStore.userId !== null && globalStore.userId.toString() === route.params.userId;
});

// --- 方法 ---
const handleProfileUpdate = () => {
  if (!currentUser.value) return;
  currentUser.value.Username = profileForm.value.username;
  currentUser.value.Bio = profileForm.value.bio;
  ElMessage.success('个人资料更新成功！');
};

const handlePasswordChange = () => {
  ElMessage.info('密码修改功能待实现。');
};

const handleAvatarUpload = () => {
  ElMessage.info('头像上传功能待实现。');
}
</script>

<template>
  <div>
    <div v-if="currentUser" class="profile-page">
      <el-card class="profile-header-card">
        <div class="profile-header">
          <el-avatar :size="100" :src="currentUser.Avatar" class="profile-avatar" @click="handleAvatarUpload">
            <el-icon :size="50">
              <Camera/>
            </el-icon>
          </el-avatar>
          <div class="profile-info">
            <h1>{{ currentUser.Username }}</h1>
            <p>{{ currentUser.Bio || '这位用户很神秘，什么也没留下...' }}</p>
          </div>
        </div>
      </el-card>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-card>
            <el-tabs v-model="activeTab" class="profile-tabs">
              <el-tab-pane :label="`发布的食谱 (${userPosts.length})`" name="posts">
                <div v-if="userPosts.length > 0" class="recipe-grid">
                  <el-card v-for="recipe in userPosts" :key="recipe.RecipeID" shadow="hover"
                           class="recipe-card-item">
                    <img :src="recipe.CoverImage" class="recipe-image" alt="菜谱图片"/>
                    <div style="padding: 14px;">
                      <span>{{ recipe.Title }}</span>
                    </div>
                  </el-card>
                </div>
                <el-empty v-else description="还没有发布任何食谱"></el-empty>
              </el-tab-pane>
              <el-tab-pane :label="`收藏的食谱 (${userFavorites.length})`" name="favorites">
                <div v-if="userFavorites.length > 0" class="recipe-grid">
                  <el-card v-for="recipe in userFavorites" :key="recipe.RecipeID" shadow="hover"
                           class="recipe-card-item">
                    <img :src="recipe.CoverImage" class="recipe-image" alt="菜谱图片"/>
                    <div style="padding: 14px;">
                      <span>{{ recipe.Title }}</span>
                    </div>
                  </el-card>
                </div>
                <el-empty v-else description="还没有收藏任何食谱"></el-empty>
              </el-tab-pane>
              <!-- 4. 使用 v-if 指令来根据 isOwnProfile 的值决定是否渲染“账户设置”标签页 -->
              <el-tab-pane v-if="isOwnProfile" label="账户设置" name="settings">
                <el-row justify="center">
                  <el-col :xs="24" :sm="18" :md="12">
                    <el-form :model="profileForm" label-width="80px">
                      <el-form-item label="用户名">
                        <el-input v-model="profileForm.username"></el-input>
                      </el-form-item>
                      <el-form-item label="邮箱">
                        <el-input v-model="profileForm.email" disabled></el-input>
                      </el-form-item>
                      <el-form-item label="个人简介">
                        <el-input v-model="profileForm.bio" type="textarea" :rows="3"></el-input>
                      </el-form-item>
                      <el-form-item>
                        <el-button type="primary" @click="handleProfileUpdate">保存更改</el-button>
                      </el-form-item>
                    </el-form>
                    <el-divider/>
                    <el-button type="danger" @click="handlePasswordChange" plain>修改密码</el-button>
                  </el-col>
                </el-row>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <div v-else class="profile-page-placeholder">
      <el-empty description="用户不存在或数据加载失败"/>
    </div>
  </div>
</template>

<style scoped>
/* 样式部分保持不变 */
.profile-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 15px;
}

.profile-page-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
}

.profile-header-card {
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  position: relative;
}

.profile-avatar {
  border: 3px solid #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  flex-shrink: 0;
}

.profile-info {
  margin-left: 25px;
}

.profile-info h1 {
  margin: 0;
  font-size: 2em;
}

.profile-info p {
  color: #666;
  margin-top: 5px;
}

.profile-tabs {
  width: 100%;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding: 10px;
}

.recipe-card-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.recipe-card-item:hover {
  transform: translateY(-5px);
}

.recipe-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}
</style>
