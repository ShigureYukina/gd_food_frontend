<template>
  <div class="dynamic-demo-page">
    <el-page-header
      @back="$router.back()"
      class="mb-6 px-2 py-3 bg-[var(--el-fill-color-lighter)] rounded"
    >
      <template #content
        ><span class="text-large font-600">动态组件示例</span></template
      >
    </el-page-header>

    <el-card>
      <el-form label-position="top">
        <el-form-item label="选择视图组件:">
          <el-select
            v-model="currentViewName"
            placeholder="请选择组件"
            class="w-full"
          >
            <el-option
              v-for="viewName in viewNames"
              :key="viewName"
              :label="viewName"
              :value="viewName"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <el-divider content-position="left">动态渲染区域</el-divider>

      <keep-alive>
        <component
          :is="activeComponent"
          class="mt-4 p-4 border rounded"
        ></component>
      </keep-alive>
    </el-card>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed } from "vue";

const InfoComponent = {
  template:
    '<el-alert title="信息组件 (InfoComponent)" type="info" show-icon :closable="false" />',
};
const WarningComponent = {
  template:
    '<el-alert title="警告组件 (WarningComponent)" type="warning" show-icon :closable="false" />',
};
const SuccessComponent = {
  template:
    '<el-alert title="成功组件 (SuccessComponent)" type="success" show-icon :closable="false" />',
};

const componentsMap = { InfoComponent, WarningComponent, SuccessComponent };
const currentViewName = ref("InfoComponent");
const viewNames = Object.keys(componentsMap);
const activeComponent = computed(() => componentsMap[currentViewName.value]);
</script>

<style scoped>
.dynamic-demo-page .el-card {
  min-height: 300px;
}
</style>
