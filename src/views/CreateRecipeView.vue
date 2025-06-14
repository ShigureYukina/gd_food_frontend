<script setup>
import {ref} from 'vue';
import {recipeService} from '@/services/recipeService';
import {useRouter} from 'vue-router';
import {ElMessage} from 'element-plus';

const router = useRouter();
const formRef = ref(null);
const recipeForm = ref({
  title: '',
  description: '',
  category: '',
  difficulty: '简单',
  prepTime: 30,
  ingredients: [{name: '', quantity: ''}],
  steps: [{description: ''}],
});

const rules = {
  title: [{required: true, message: '请输入食谱标题', trigger: 'blur'}],
  description: [{required: true, message: '请输入食谱描述', trigger: 'blur'}],
  category: [{required: true, message: '请输入食谱分类', trigger: 'blur'}],
};

const addIngredient = () => {
  recipeForm.value.ingredients.push({name: '', quantity: ''});
};
const removeIngredient = (index) => {
  recipeForm.value.ingredients.splice(index, 1);
};

const addStep = () => {
  recipeForm.value.steps.push({description: ''});
};
const removeStep = (index) => {
  recipeForm.value.steps.splice(index, 1);
};

// 将 validate 包装成 Promise 方便 async/await 使用
function validateForm() {
  return new Promise((resolve) => {
    formRef.value.validate((valid) => {
      resolve(valid);
    });
  });
}

const submitForm = async () => {
  const valid = await validateForm();
  if (!valid) {
    ElMessage.error('请检查表单是否填写完整');
    return;
  }
  const finalData = {
    ...recipeForm.value,
    steps: recipeForm.value.steps.map((s, i) => ({stepNumber: i + 1, description: s.description})),
  };
  try {
    await recipeService.addRecipe(finalData);
    ElMessage.success('食谱发布成功');
    router.push('/');
  } catch (error) {
    ElMessage.error('发布失败，请重试');
  }
};
const fillTestData = () => {
  recipeForm.value = {
    title: '红烧肉',
    description: '经典的红烧肉做法，肥而不腻，入口即化。',
    category: '家常菜',
    difficulty: '中等',
    prepTime: 60,
    story: '这道红烧肉是我奶奶传给我的家传秘方。',
    ingredients: [
      { name: '五花肉', quantity: '500g' },
      { name: '生姜', quantity: '适量' },
      { name: '冰糖', quantity: '30g' },
    ],
    steps: [
      { description: '五花肉切块，焯水备用。' },
      { description: '锅中放油，加入冰糖炒糖色。' },
      { description: '加入五花肉煸炒上色，加入调味料炖煮。' },
    ],
  };
  console.log('已填充测试数据:', JSON.stringify(recipeForm.value, null, 2));
};

</script>


<template>
  <div class="create-view">
    <el-card>
      <template #header>
        <h2>分享你的美味食谱</h2>
        <el-button type="warning" size="small" @click="fillTestData" style="margin-left: 20px;">
          一键填充测试数据
        </el-button>
      </template>
      <el-form ref="formRef" :model="recipeForm" :rules="rules" label-width="100px">
        <el-form-item label="食谱标题" prop="title">
          <el-input v-model="recipeForm.title"/>
        </el-form-item>
        <el-form-item label="食谱描述" prop="description">
          <el-input v-model="recipeForm.description" type="textarea"/>
        </el-form-item>
        <el-form-item label="菜谱故事" prop="story">
          <el-input
              v-model="recipeForm.story"
              type="textarea"
              :rows="4"
              placeholder="分享这道菜背后的小故事，让它更有温度"
          />
        </el-form-item>

        <!-- 预览区域 -->
        <div v-if="recipeForm.story" class="story-preview">
          <h3>菜谱故事预览</h3>
          <p>{{ recipeForm.story }}</p>
        </div>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="分类" prop="category">
              <el-input v-model="recipeForm.category" placeholder="如: 家常菜, 烘焙"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="难度">
              <el-select v-model="recipeForm.difficulty">
                <el-option label="简单" value="简单"/>
                <el-option label="中等" value="中等"/>
                <el-option label="困难" value="困难"/>
              </el-select>
            </el-form-item>

          </el-col>
          <el-col :span="8">
            <el-form-item label="准备时间">
              <el-input-number v-model="recipeForm.prepTime" :min="5"/>
              <span style="margin-left: 10px;">分钟</span>
            </el-form-item>
          </el-col>

        </el-row>


        <el-divider/>
        <h3>食材清单</h3>
        <div v-for="(item, index) in recipeForm.ingredients" :key="index" class="dynamic-item">
          <el-input v-model="item.name" placeholder="食材名称" style="width: 200px; margin-right: 10px;"/>
          <el-input v-model="item.quantity" placeholder="用量" style="width: 150px; margin-right: 10px;"/>
          <el-button @click="removeIngredient(index)" type="danger" :icon="'Delete'" circle/>
        </div>
        <el-button @click="addIngredient" :icon="'Plus'" style="margin-top: 10px;">添加食材</el-button>

        <el-divider/>
        <h3>烹饪步骤</h3>
        <div v-for="(step, index) in recipeForm.steps" :key="index" class="dynamic-item">
          <span class="step-number">第 {{ index + 1 }} 步</span>
          <el-input v-model="step.description" placeholder="步骤描述" type="textarea" :rows="2"/>
          <el-button @click="removeStep(index)" type="danger" :icon="'Delete'" circle style="margin-left: 10px;"/>
        </div>
        <el-button @click="addStep" :icon="'Plus'" style="margin-top: 10px;">添加步骤</el-button>

        <el-form-item style="margin-top: 30px;">
          <el-button type="primary" @click="submitForm">立即分享</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

  </div>
</template>

<style scoped>
.create-view {
  max-width: 900px;
  margin: 20px auto;
  padding: 0 20px;
}

.dynamic-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.step-number {
  margin-right: 10px;
  font-weight: bold;
  min-width: 60px;
}

.story-preview {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.story-preview h3 {
  color: #333;
  margin-top: 0;
}
</style>