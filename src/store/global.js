import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus';

export const useGlobalStore = defineStore("global", {
  state: () => ({
    userId: "user-" + Math.random().toString(36).substring(2, 9),
    theme: localStorage.getItem("recipe-app-theme") || "light",
  }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === "light" ? "dark" : "light";
      document.documentElement.className = this.theme;
      localStorage.setItem("recipe-app-theme", this.theme);
      ElMessage({
        message: `主题已切换为 ${this.theme === 'light' ? '明亮' : '暗黑'}模式`,
        type: 'success',
        plain: true
      });
    },
    initTheme() {
      document.documentElement.className = this.theme;
    },
  },
});