<script setup>
import {ref, computed, onMounted} from 'vue';
import {useRecipeStore} from '@/store/recipe';
import {useGlobalStore} from '@/store/global';
import { UserFilled } from '@element-plus/icons-vue'; // 确保图标已导入

const props = defineProps({
  recipeId: {
    type: String,
    required: true,
  },
});

const recipeStore = useRecipeStore();
const globalStore = useGlobalStore();

const newComment = ref('');
// ⭐ 1. 为新评论添加评分的状态
const newRating = ref(0);

const comments = computed(() => recipeStore.getCommentsByRecipeId(props.recipeId));

// ⭐ 2. 修改提交逻辑以包含评分
const submitComment = () => {
  // 增加评分必须大于0的校验
  if (newComment.value.trim() && newRating.value > 0) {
    // 假设 store action 已更新为接受一个包含多项数据的对象
    recipeStore.addComment({
      recipeId: props.recipeId,
      content: newComment.value,
      rating: newRating.value,
    });

    // 提交后重置输入框和评分
    newComment.value = '';
    newRating.value = 0;
  } else {
    // 可以添加一个提示，提醒用户需要填写评论和评分
    // ElMessage({ type: 'warning', message: '请填写评论并给出评分！' });
    console.warn("评论内容和评分不能为空！");
  }
};

// ⭐ 3. (修复) 应用这个时间格式化函数
const formatTime = (isoString) => {
  if (!isoString) return '时间未知';
  const date = new Date(isoString);
  // 简单容错，防止传入无效日期字符串
  return isNaN(date.getTime()) ? isoString : date.toLocaleString('zh-CN');
};
</script>

<template>
  <div v-if="globalStore.isAuthenticated" class="comment-section">
    <h3>评论区 ({{ comments.length }})</h3>
    <el-card v-if="comments.length > 0" class="comment-list">
      <div v-for="comment in comments" :key="comment.commentId" class="comment-item">
        <div class="comment-header">
          <strong>
            <el-icon>
              <UserFilled/>
            </el-icon>
            {{ comment.username }}</strong>
          <span class="time">{{ formatTime(comment.createdAt) }}</span>
        </div>
        <el-rate v-model="comment.rating" disabled style="margin-bottom: 10px;"/>
        <p class="comment-content">{{ comment.content }}</p>
      </div>
    </el-card>
    <el-empty v-else description="暂无评论，快来抢沙发吧！"/>

    <div class="add-comment">
      <h4>发表您的看法</h4>
      <div class="rating-input">
        <el-rate
            v-model="newRating"
            :texts="['极差', '失望', '一般', '推荐', '力荐']"
            show-text
            size="large"
            allow-half
        />
      </div>
      <el-input
          v-model="newComment"
          type="textarea"
          :rows="3"
          placeholder="分享你的制作心得、口味评价或改进建议吧..."
      />
      <el-button type="primary" @click="submitComment" style="margin-top: 10px;">发表评论</el-button>
    </div>
  </div>
  <div v-else class="comment-section">
    <h3>评论区</h3>
    <el-empty description="请先登录以查看和发表评论"/>
  </div>
</template>

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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.comment-header strong {
  display: flex;
  align-items: center;
  gap: 5px;
}
.time {
  font-size: 0.8em;
  color: #999;
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
/* ⭐ 5. 为评分组件添加一些间距 */
.rating-input {
  margin-bottom: 20px;
}
</style>