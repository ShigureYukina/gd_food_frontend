<template>
  <el-card
    class="news-list-item"
    :body-style="{ padding: '0px' }"
    @click="handleCardClick"
    shadow="hover"
  >
    <div class="card-content-wrapper">
      <div v-if="article.imageUrl" class="image-container">
        <el-image :src="article.imageUrl" fit="cover" class="news-image">
          <template #error>
            <div class="image-slot-error">
              <el-icon><Picture /></el-icon>
              <span>图片加载失败</span>
            </div>
          </template>
        </el-image>
      </div>
      <div class="content-container">
        <div class="header">
          <h3 class="title" v-highlight="props.highlightText">
            {{ article.title }}
          </h3>
          <el-button
            type="danger"
            :icon="CloseBold"
            circle
            size="small"
            class="close-button"
            @click.stop="toggleFeedbackOptions"
            style="
              background-color: rgba(128, 128, 128, 0.5);
              border-color: transparent;
            "
          />
        </div>
        <div v-if="!showFeedbackOptions">
          <div class="meta">
            <el-tag
              v-if="article.category"
              type="primary"
              size="small"
              class="category-tag"
              >{{ article.category }}</el-tag
            >
            <span class="date">{{ formatDate(article.date) }}</span>
            <span v-if="article.author" class="author"
              >作者: {{ article.author }}</span
            >
          </div>
          <p class="summary" v-if="article.summary">{{ article.summary }}</p>
          <div class="footer">
            <div class="stats">
              <span><el-icon><View /></el-icon> {{ article.views }}</span>
              <span><el-icon><Pointer /></el-icon> {{ article.likes }}</span>
              <span><el-icon><Star /></el-icon> {{ article.favorites }}</span>
              <span><el-icon><Share /></el-icon> {{ article.shares }}</span>
              <el-tag
                v-if="isRead"
                type="info"
                size="small"
                effect="light"
                class="read-tag"
                >已读</el-tag
              >
            </div>
            <slot name="actions"></slot>
          </div>
        </div>
        <div v-else class="feedback-options-container">
          <p class="feedback-title">您为什么不喜欢这条新闻？</p>
          <el-radio-group v-model="selectedReason" class="feedback-radios">
            <el-radio :label="'不感兴趣'">不感兴趣</el-radio>
            <el-radio :label="'内容重复'">内容重复</el-radio>
            <el-radio :label="'质量较低'">质量较低</el-radio>
            <el-radio :label="'其他原因'">其他原因</el-radio>
          </el-radio-group>
          <div class="feedback-actions">
            <el-button type="primary" size="small" @click.stop="submitFeedback"
              >提交</el-button
            >
            <el-button size="small" @click.stop="cancelFeedback"
              >取消</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
// 新闻列表项组件，用于在新闻列表中展示单条新闻

import { ref, defineProps, defineEmits } from "vue";
import { ElMessage } from "element-plus";
// ===== UPDATED: 导入新增的图标 =====
import {
  Picture,
  CloseBold,
  View,
  Pointer,
  Star,
  Share,
} from "@element-plus/icons-vue";
import { useGlobalStore } from "@/store/global";

const props = defineProps({
  // 新闻对象
  article: {
    type: Object,
    required: true,
  },
  // 高亮显示的文本
  highlightText: {
    type: String,
    default: "",
  },
  // 是否已读
  isRead: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["read-more", "close-news"]);
const globalStore = useGlobalStore();

const showFeedbackOptions = ref(false);
const selectedReason = ref("");

/**
 * @description 格式化日期
 * @param {string} dateString 日期字符串
 * @returns {string} 格式化后的日期
 */
const formatDate = (dateString) => {
  if (!dateString) return ""; // 如果日期字符串为空，则返回空字符串
  const date = new Date(dateString);
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return "日期无效"; // 如果日期无效，则返回提示信息
  }
  // 使用台湾时区来格式化日期
  return date.toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei' });
};

/**
 * @description 处理卡片点击事件，如果反馈选项未显示，则触发阅读更多
 */
const handleCardClick = () => {
  if (!showFeedbackOptions.value) {
    emit("read-more", props.article.id);
  }
};

/**
 * @description 切换反馈选项的显示状态
 */
const toggleFeedbackOptions = () => {
  showFeedbackOptions.value = !showFeedbackOptions.value;
  selectedReason.value = ""; // 重置选项
};

/**
 * @description 提交反馈
 */
const submitFeedback = () => {
  if (!selectedReason.value) {
    ElMessage.warning("请选择一个原因");
    return;
  }
  ElMessage.success(`感谢您的反馈: ${selectedReason.value}`);
  emit("close-news", {
    articleId: props.article.id,
    reason: selectedReason.value,
  });
  showFeedbackOptions.value = false;
};

/**
 * @description 取消反馈
 */
const cancelFeedback = () => {
  showFeedbackOptions.value = false;
  selectedReason.value = "";
  ElMessage.info("已取消反馈");
};

// 自定义指令：高亮文本
const vHighlight = {
  mounted: (el, binding) => {
    const textToHighlight = binding.value;
    if (textToHighlight && el.textContent) {
      const regex = new RegExp(textToHighlight, "gi");
      el.innerHTML = el.textContent.replace(
        regex,
        (match) => `<mark>${match}</mark>`
      );
    }
  },
  updated: (el, binding) => {
    // 清除之前的高亮
    const originalText = props.article.title; // 假设高亮作用于标题
    el.innerHTML = originalText;
    const textToHighlight = binding.value;
    if (textToHighlight && originalText) {
      const regex = new RegExp(textToHighlight, "gi");
      el.innerHTML = originalText.replace(
        regex,
        (match) => `<mark>${match}</mark>`
      );
    }
  },
};
</script>

<style scoped>
.author {
  margin-left: 10px;
  color: #888;
  font-size: 0.85em;
}

.dark .author {
  color: #d1d5db; /* 灰白色文字 */
}

.news-list-item {
  margin-bottom: 20px;
  background-color: #ffffff; /* 浅色背景 */
  transition: transform 0.2s ease-in-out;
}

.dark .news-list-item {
  background-color: #1f2937; /* 深色背景 */
}

.news-list-item:hover {
  transform: translateY(-5px);
}

.dark .news-list-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* 更明显的阴影 */
}

.card-content-wrapper {
  display: flex;
  cursor: pointer;
}

.image-container {
  width: 180px;
  height: 120px;
  flex-shrink: 0;
  margin-right: 15px;
  overflow: hidden;
}

.news-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-slot-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: var(--el-fill-color-lighter);
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.dark .image-slot-error {
  background-color: #1f2937; /* 深色背景 */
  color: #d1d5db; /* 灰白色文字 */
}

.image-slot-error .el-icon {
  font-size: 30px;
  margin-bottom: 8px;
}

.content-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 15px;
  min-width: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.title {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
  flex-grow: 1;
  margin-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .title {
  color: #f9fafb; /* 浅色文字 */
}

.close-button {
  flex-shrink: 0;
}

.meta {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 8px;
}

.dark .meta {
  color: #d1d5db; /* 灰白色文字 */
}

.category-tag {
  margin-right: 10px;
}

.date {
  margin-right: 10px;
}

.summary {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .summary {
  color: #f9fafb; /* 浅色文字 */
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

/* ===== NEW/UPDATED STYLES for stats ===== */
.stats {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px; /* 使用 gap 属性来创建元素间的空隙 */
  color: #888;
}

.dark .stats {
  color: #d1d5db; /* 灰白色文字 */
}

.stats > span {
  display: inline-flex;
  align-items: center;
}

.stats .el-icon {
  margin-right: 4px; /* 图标和文字之间的距离 */
  font-size: 1.1em;
}

.read-tag {
  background-color: #e0e0e0; /* 浅灰色背景 */
  color: #555555; /* 深灰色文字 */
  border: none; /* 移除边框 */
  padding: 4px 8px; /* 添加内边距 */
  border-radius: 4px; /* 圆角边框 */
}

.dark .read-tag {
  background-color: #374151; /* 深色标签背景 */
  color: #f9fafb; /* 浅色文字 */
}

.theme-info {
  font-style: italic;
}

.feedback-options-container {
  padding-top: 10px;
}

.feedback-title {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 10px;
}

.dark .feedback-title {
  color: #f9fafb; /* 浅色文字 */
}

.feedback-radios .el-radio {
  display: block;
  margin-bottom: 8px;
}

.feedback-actions {
  margin-top: 15px;
  text-align: right;
}

:deep(mark) {
  background-color: yellow;
  padding: 0;
}
</style>