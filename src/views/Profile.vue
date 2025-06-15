<script setup>
import {ref, computed, onMounted, watch} from 'vue';
import {useRoute} from 'vue-router';
import {useGlobalStore} from '@/store/globalStore';
import {Camera, Loading} from '@element-plus/icons-vue';
import {ElMessage} from 'element-plus';
import mockData from '@/utils/mock-data';
import {favoriteService} from '@/services/favoriteService';
import {userService} from '@/services/userService';

const route = useRoute();
const globalStore = useGlobalStore();
const dialogFormVisible = ref(false)
const currentUser = ref(null);
const allRecipes = ref([]);
const userFavoriteIds = ref([]);

const profileForm = ref({
  username: '',
  email: '',
  bio: '',
});

const activeTab = ref('posts');

const isUploading = ref(false); // 上传中状态

// 读取当前用户信息
const loadUserData = (userId) => {
  const foundUser = mockData.users.find(u => u.UserID.toString() === userId);
  currentUser.value = foundUser || null;

  if (foundUser) {
    profileForm.value = {
      username: foundUser.Username,
      email: foundUser.Email,
      bio: foundUser.Bio,
    };
  }
};

// 读取所有食谱
const loadRecipes = () => {
  allRecipes.value = mockData.recipes;
};

// 读取收藏
const loadFavorites = async (userId) => {
  userFavoriteIds.value = await favoriteService.fetchFavoritesByUser(userId);
};

// 页面加载时加载数据
onMounted(async () => {
  const userId = route.params.userId;
  if (userId) {
    await Promise.all([
      loadUserData(userId),
      loadRecipes(),
      loadFavorites(userId),
    ]);
  }
});

// 监听路由变化，重新加载
watch(() => route.params.userId, async (newId) => {
  if (newId) {
    await Promise.all([
      loadUserData(newId),
      loadRecipes(),
      loadFavorites(newId),
    ]);
  }
});

// 用户发布的食谱
const userPosts = computed(() => {
  if (!currentUser.value) return [];
  return allRecipes.value.filter(recipe => recipe.UserID === currentUser.value.UserID);
});

// 收藏的食谱
const userFavorites = computed(() => {
  if (!currentUser.value || userFavoriteIds.value.length === 0) return [];
  const favIdsNum = userFavoriteIds.value.map(id => Number(id));
  return allRecipes.value.filter(recipe => favIdsNum.includes(recipe.RecipeID));
});

// 是否是本人页面
const isOwnProfile = computed(() => {
  console.log('当前用户密码:', currentUser.value?.Password);
  return globalStore.userId !== null && globalStore.userId.toString() === route.params.userId;
});

// 更新个人资料
const handleProfileUpdate = () => {
  if (!currentUser.value) return;
  currentUser.value.Username = profileForm.value.username;
  currentUser.value.Bio = profileForm.value.bio;
  ElMessage.success('个人资料更新成功！');
};


const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const handleConfirmChange = async () => {
  if (!form.value.oldPassword || !form.value.newPassword || !form.value.confirmPassword) {
    ElMessage.error('请填写完整所有字段');
    return;
  }
  if (form.value.newPassword !== form.value.confirmPassword) {
    ElMessage.error('两次输入的新密码不一致');
    return;
  }

  const res = await userService.updatePassword(currentUser.value.UserID, form.value.oldPassword, form.value.newPassword);

  if (res.success) {
    ElMessage.success(res.message);
    dialogFormVisible.value = false;
    form.value.oldPassword = '';
    form.value.newPassword = '';
    form.value.confirmPassword = '';
  } else {
    ElMessage.error(res.message);
  }
};


const handleCancel = () => {
  dialogFormVisible.value = false;
};
// 上传头像函数
const handleAvatarChange = (file) => {
  if (!file || !file.raw) {
    ElMessage.error('上传的文件无效');
    return;
  }

  isUploading.value = true;

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    const success = userService.updateAvatar(currentUser.value.UserID, base64);

    if (success) {
      currentUser.value.Avatar = base64;
      ElMessage.success('头像上传成功');
    } else {
      ElMessage.error('头像上传失败');
    }

    isUploading.value = false;
  };

  reader.onerror = () => {
    ElMessage.error('读取图片失败');
    isUploading.value = false;
  };

  // ✅ 关键点：读取 raw 文件对象
  reader.readAsDataURL(file.raw);
};

</script>


<template>
  <div>
    <div v-if="currentUser" class="profile-page">
      <el-card class="profile-header-card">
        <div class="profile-header">
          <el-tooltip content="上传头像" placement="top" v-if="isOwnProfile">
            <el-upload
                class="avatar-uploader"
                :show-file-list="false"
                :on-change="handleAvatarChange"
                :before-upload="() => false"
            >
              <el-avatar :size="100" :src="currentUser.Avatar" class="profile-avatar" style="cursor: pointer;">
                <template #default>
                  <el-icon>
                    <Camera/>
                  </el-icon>
                </template>
              </el-avatar>
            </el-upload>
          </el-tooltip>

          <!-- 非本人头像，禁用上传功能 -->
          <el-avatar
              v-else
              :size="100"
              :src="currentUser.Avatar"
              class="profile-avatar"
          />

          <div class="profile-info">
            <h1>{{ currentUser.Username }}</h1>
            <p class="profile-email">{{ currentUser.Email }}</p> <!-- 新增邮箱显示 -->
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
                  <el-card v-for="recipe in userPosts" :key="recipe.RecipeID" shadow="hover" class="recipe-card-item">
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
                  <el-card
                      v-for="recipe in userFavorites"
                      :key="recipe.RecipeID"
                      shadow="hover"
                      class="recipe-card-item"
                  >
                    <img :src="recipe.CoverImage" class="recipe-image" alt="菜谱图片"/>
                    <div style="padding: 14px;">
                      <span>{{ recipe.Title }}</span>
                    </div>
                  </el-card>
                </div>
                <el-empty v-else description="还没有收藏任何食谱"></el-empty>
              </el-tab-pane>

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
                    <el-button type="danger" @click="dialogFormVisible = true">修改密码</el-button>

                    <el-dialog title="修改密码" v-model="dialogFormVisible" width="400px">

                      <el-form label-position="top">
                        <el-form-item label="旧密码">
                          <el-input
                              v-model="form.oldPassword"
                              type="password"
                              placeholder="请输入旧密码"
                              autocomplete="off"
                          />
                        </el-form-item>

                        <el-form-item label="新密码">
                          <el-input
                              v-model="form.newPassword"
                              type="password"
                              placeholder="请输入新密码"
                              autocomplete="off"
                          />
                        </el-form-item>

                        <el-form-item label="确认新密码">
                          <el-input
                              v-model="form.confirmPassword"
                              type="password"
                              placeholder="请确认新密码"
                              autocomplete="off"
                          />
                        </el-form-item>
                      </el-form>

                      <template #footer>
                        <el-button @click="handleCancel">取消</el-button>
                        <el-button type="primary" @click="handleConfirmChange">确认修改</el-button>
                      </template>
                    </el-dialog>
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

.profile-email {
  color: #666;
  font-size: 14px;
  margin: 4px 0;
}

.avatar-uploader:hover .el-avatar {
  opacity: 0.8;
  transition: 0.3s;
}


</style>
