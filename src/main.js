// src/main.js
// 应用入口文件，负责初始化Vue应用并配置全局依赖

import { createApp } from "vue";
import App from "./App.vue"; // 根组件
import router from "./router"; // 路由配置
import { createPinia } from "pinia"; // Pinia 状态管理
import ElementPlus from "element-plus"; // Element Plus UI 组件库
// import 'element-plus/dist/index.css' // 在 index.html 中通过 CDN 引入
import { ElMessage } from "element-plus"; // 单独导入 ElMessage 以便在错误处理器中使用


// 创建 Vue 应用实例
const app = createApp(App);
// 创建 Pinia 状态管理器
const pinia = createPinia();

// 安装 Pinia 状态管理
app.use(pinia);
// 安装路由
app.use(router);
// 安装 Element Plus UI 组件库
app.use(ElementPlus /*, { locale: zhCn } */); // 安装 Element Plus, 可选: 设置语言

// 全局自定义指令示例 (v-focus) - 保持不变
app.directive("focus", {
  mounted(el) {
    // Element Plus input 组件的 input 元素可能嵌套较深
    const inputEl = el.querySelector("input") || el.querySelector("textarea");
    if (inputEl) {
      inputEl.focus();
    } else {
      el.focus();
    }
  },
});

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error("全局错误捕获:", err);
  console.log("Vue 实例:", instance);
  console.log("错误信息:", info);

  ElMessage({
    // 使用 Element Plus 的 ElMessage
    message: `发生错误: ${err.message || "未知错误"}`,
    type: "error",
    duration: 5000, // 持续时间长一点，方便查看
  });
};

// 挂载应用到 #app 容器
app.mount("#app");
