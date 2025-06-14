<template>
  <div class="recipe-detail-card" v-if="recipe">
    <div class="header">
      <h2>{{ recipe.Title }}</h2>
      <div class="actions">
        <el-popconfirm
            title="确定要批准这个菜谱吗?"
            confirm-button-text="确认批准"
            cancel-button-text="取消"
            icon-color="#67C23A"
            :icon="SuccessFilled"
            @confirm="updateStatus('approved')"
        >
          <template #reference>
            <button class="approve-btn">批准</button>
          </template>
        </el-popconfirm>

        <el-popconfirm
            title="确定要拒绝这个菜谱吗?"
            confirm-button-text="确认拒绝"
            cancel-button-text="取消"
            icon-color="#F56C6C"
            :icon="CircleCloseFilled"
            @confirm="updateStatus('rejected')"
        >
          <template #reference>
            <button class="reject-btn">拒绝</button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <div class="meta-info">
      <span><strong>提交者:</strong> {{ recipe.author.Username }} ({{ recipe.author.Email }})</span>
      <span><strong>难度:</strong> {{ recipe.Difficulty }}</span>
      <span><strong>上传时间:</strong> {{ recipe.UploadTime }}</span>
    </div>

    <div class="section">
      <h4>描述</h4>
      <p>{{ recipe.Description }}</p>
    </div>

    <div class="section">
      <h4>成品图</h4>
      <div class="image-gallery">
        <img v-for="(img, index) in images" :key="index" :src="img" :alt="`菜谱图片 ${index + 1}`"/>
      </div>
    </div>

    <div class="section">
      <h4>食材 ({{ ingredients.length }})</h4>
      <ul>
        <li v-for="(item, index) in ingredients" :key="index">
          {{ item.name }} - {{ item.quantity }}
        </li>
      </ul>
    </div>

    <div class="section">
      <h4>步骤</h4>
      <ol>
        <li v-for="step in steps" :key="step.stepNumber">
          <p>{{ step.description }}</p>
          <img v-if="step.image" :src="step.image" :alt="`步骤 ${step.stepNumber} 图片`" class="step-image"/>
        </li>
      </ol>
    </div>


  </div>
  <div v-else class="placeholder">
    <p>请从左侧列表中选择一个菜谱进行审核。</p>
  </div>
</template>

<script setup>
import {computed} from 'vue';
// ⭐ 3. 导入需要的图标
import {SuccessFilled, CircleCloseFilled} from '@element-plus/icons-vue';

const props = defineProps({
  recipe: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update-status']);

const ingredients = computed(() => props.recipe ? JSON.parse(props.recipe.Ingredients) : []);
const steps = computed(() => props.recipe ? JSON.parse(props.recipe.Steps) : []);
const images = computed(() => props.recipe ? JSON.parse(props.recipe.ImageLinks) : []);

// 此方法现在由 Popconfirm 的 confirm 事件调用
const updateStatus = (status) => {
  if (!props.recipe) return;
  emit('update-status', props.recipe.RecipeID, status);
};
</script>

<style scoped>
/* ... 样式部分保持不变 ... */
.recipe-detail-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px;
  background-color: #fff
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
  margin-bottom: 15px
}

.header h2 {
  margin: 0
}

.actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  font-size: 14px
}

.actions .approve-btn {
  background-color: #28a745;
  margin-right: 10px
}

.actions .reject-btn {
  background-color: #dc3545
}

.meta-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #555;
  margin-bottom: 20px
}

.section {
  margin-bottom: 25px
}

.section h4 {
  margin-top: 0;
  margin-bottom: 10px;
  border-left: 4px solid #409eff;
  padding-left: 8px
}

.section p, .section li {
  line-height: 1.6
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px
}

.image-gallery img {
  max-width: 150px;
  border-radius: 5px
}

.step-image {
  max-width: 300px;
  margin-top: 10px;
  border-radius: 5px
}

.placeholder {
  text-align: center;
  padding: 50px;
  color: #888
}
</style>