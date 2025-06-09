<script setup>
import {ref, computed} from 'vue';
import {useRecipeStore} from '@/store/recipe';

const props = defineProps({
  recipeId: {
    type: String,
    required: true,
  },
});

const recipeStore = useRecipeStore();
const newComment = ref('');

const comments = computed(() => recipeStore.getCommentsByRecipeId(props.recipeId));

const submitComment = () => {
  if (newComment.value.trim()) {
    recipeStore.addComment(props.recipeId, newComment.value);
    newComment.value = '';
  }
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? '' : date.toLocaleString();
};
</script>

<template>
  <div class="comment-section">
    <h3>评论区 ({{ comments.length }})</h3>
    <el-card v-if="comments.length > 0" class="comment-list">
      <div v-for="comment in comments" :key="comment.commentId" class="comment-item">
        <div class="comment-header">
          <strong>
            <el-icon>
              <UserFilled/>
            </el-icon>
            {{ comment.username }}</strong>
          <span class="time">{{comment.createdAt }}</span>
        </div>
        <el-rate v-model="comment.rating" disabled style="margin-bottom: 10px;"/>
        <p class="comment-content">{{ comment.content }}</p>
      </div>
    </el-card>
    <el-empty v-else description="暂无评论，快来抢沙发吧！"/>

    <div class="add-comment">
      <el-input
          v-model="newComment"
          type="textarea"
          :rows="3"
          placeholder="发表你的看法..."
      />
      <el-button type="primary" @click="submitComment" style="margin-top: 10px;">发表评论</el-button>
    </div>
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
  border-bottom: 1px solid var(--border-color);
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
  margin-top: 20px;
}
</style>