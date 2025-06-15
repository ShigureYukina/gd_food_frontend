<template>
  <div class="comment-section">
    <h3>评论区 ({{ comments.length }})</h3>

    <el-card v-if="isAuth && comments.length" class="comment-list">
      <div v-for="c in comments" :key="c.ReviewID" class="comment-item">
        <div class="comment-header">
          <div class="user-info-clickable" @click="goToUserHomepage(c.UserID)">
            <el-avatar :src="c.avatar" :fit="'cover'">
              <el-icon>
                <UserFilled/>
              </el-icon>
            </el-avatar>
            <strong>{{ c.username }}</strong>
          </div>
          <span class="time">{{ formatTime(c.ReviewTime) }}</span>
        </div>
        <el-rate v-model="c.Rating" disabled style="margin: 8px 0;"/>
        <p class="comment-content">{{ c.Comment || '无评论内容' }}</p>
      </div>
    </el-card>

    <el-empty
        v-if="isAuth && comments.length === 0"
        description="暂无评论，快来抢沙发吧！"
    />

    <el-empty
        v-else-if="!isAuth"
        description="请先登录以查看和发表评论"
    />

    <div v-if="isAuth" class="add-comment">
      <h4>发表您的看法</h4>
      <el-rate
          v-model="newRating"
          :texts="['极差', '失望', '一般', '推荐', '力荐']"
          show-text
          size="large"
          allow-half
      />
      <el-input
          v-model="newComment"
          type="textarea"
          :rows="3"
          placeholder="分享你的制作心得、口味评价或改进建议吧..."
          style="margin: 12px 0;"
      />
      <el-button type="primary" @click="submitComment">
        发表评论
      </el-button>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {UserFilled} from '@element-plus/icons-vue'
import {useGlobalStore} from '@/store/globalStore'
import {commentService} from '@/services/commentService'
import {userService} from '@/services/userService'

const props = defineProps({
  recipeId: {type: String, required: true}
})

const globalStore = useGlobalStore()
const router = useRouter()

const comments = ref([])
const newComment = ref('')
const newRating = ref(0)

const isAuth = computed(() => globalStore.isAuthenticated)

// 异步加载评论
onMounted(async () => {
  comments.value = await commentService.getCommentsByRecipeId(props.recipeId)
})

// 时间格式化
function formatTime(iso) {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '时间未知' : d.toLocaleString('zh-CN')
}

// 跳转到用户主页
function goToUserHomepage(userId) {
  if (userId) {
    router.push({name: 'profile', params: {userId}})
  }
}

// 提交评论
async function submitComment() {
  if (!newComment.value.trim() || newRating.value <= 0) {
    alert('评论内容和评分不能为空！');
    return;
  }
  try {
    await commentService.addComment(props.recipeId, newComment.value, globalStore.userId, newRating.value);
    newComment.value = '';
    newRating.value = 0;
    comments.value = await commentService.getCommentsByRecipeId(props.recipeId);
  } catch (e) {
    console.error(e);
  }
}


</script>


<style scoped>
.comment-section {
  margin-top: 40px;
}

.comment-list {
  margin-top: 20px;
}

.comment-item {
  border-bottom: 1px solid var(--el-border-color-lighter); /* 使用 Element Plus 变量 */
  padding: 15px 0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  gap: 10px; /* 头像、用户名和时间之间的间距 */
  margin-bottom: 8px;
}

.comment-header strong {
  display: flex; /* 让用户名和可能的图标保持一行 */
  align-items: center;
  /* 移除这里的 gap，因为头像已经独立出来 */
}

/* 头像容器样式 */
.comment-avatar {
  width: 36px; /* 头像宽度 */
  height: 36px; /* 头像高度 */
  border-radius: 50%; /* 圆形头像 */
  background-color: var(--el-color-primary-light-9); /* 背景色，使用 Element Plus 变量 */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0; /* 防止头像缩小 */
  overflow: hidden; /* 确保图片超出圆形容器时被裁剪 */
}

/* 新增：图片头像样式 */
.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 确保图片填充容器并保持比例 */
}

/* 默认图标头像样式 */
.comment-avatar .user-avatar-icon {
  font-size: 20px; /* 图标大小 */
  color: var(--el-color-primary); /* 图标颜色 */
}

.time {
  font-size: 0.8em;
  color: #999;
  margin-left: auto; /* 让时间戳靠右对齐 */
}

.comment-content {
  margin: 0;
  line-height: 1.6;
}

.add-comment {
  margin-top: 30px;
  background-color: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.add-comment h4 {
  margin-top: 0;
  margin-bottom: 15px;
}

/* 为评分组件添加一些间距 */
.rating-input {
  margin-bottom: 20px;
}
</style>
