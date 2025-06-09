// 全局状态管理模块，使用 Pinia 实现

import { defineStore } from "pinia";

// 创建并导出全局状态存储
export const useGlobalStore = defineStore("global", {
  // 状态定义
  state: () => ({
    // 用户ID（模拟）
    userId: "user-" + Math.random().toString(36).substring(2, 9),
    // 消息状态，用于在App.vue中显示提示信息
    message: null, // { text: String, type: String }
    // 主题设置：从localStorage读取或默认为'light'
    theme: localStorage.getItem("news-app-theme") || "light",
    // 已读新闻ID列表：初始化为空数组（不使用localStorage）
    readNewsIds: [],
    // 缓存新闻列表：初始化为空数组
    cachedNews: [],
    // 新增: 收藏的新闻ID列表
    favoriteNewsIds: [],
    // 新增: 点赞的新闻ID列表
    likedNewsIds: [],
  }),

  // 新增: Getters 用于派生状态
  getters: {
    /**
     * 检查指定ID的新闻是否已被收藏
     * @param {object} state
     * @returns {function(string | number): boolean}
     */
    isFavorite: (state) => (newsId) => {
      return state.favoriteNewsIds.includes(newsId);
    },
    /**
     * 获取所有已收藏的新闻对象
     * @param {object} state
     * @returns {Array<object>}
     */
    favoriteNews: (state) => {
      return state.cachedNews.filter((news) =>
        state.favoriteNewsIds.includes(news.id)
      );
    },
    /**
     * 获取收藏的新闻数量
     * @param {object} state
     * @returns {number}
     */
    favoriteCount: (state) => {
      return state.favoriteNewsIds.length;
    },
    // 新增: 检查新闻是否已点赞
    isLiked: (state) => (newsId) => {
      return state.likedNewsIds.includes(newsId);
    },
  },

  // 动作方法（修改状态的方法）
  actions: {
    // 显示消息
    showMessage(text, type = "info") {
      this.message = { text, type };
    },
    // 清除消息
    clearMessage() {
      this.message = null;
    },
    // 切换主题
    toggleTheme() {
      this.theme = this.theme === "light" ? "dark" : "light";
      if (this.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("news-app-theme", this.theme);
      this.showMessage(
        `主题已切换为 ${this.theme === "light" ? "明亮" : "暗黑"}模式`
      );
    },
    // 初始化主题
    initTheme() {
      if (this.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    // 将新闻标记为已读
    markNewsAsRead(newsId) {
      if (!this.readNewsIds.includes(newsId)) {
        this.readNewsIds.push(newsId);
      }
    },
    // 检查新闻是否已读
    isNewsRead(newsId) {
      return this.readNewsIds.includes(newsId);
    },
    // 添加缓存新闻
    addCachedNews(news) {
      if (Array.isArray(news)) {
        news.forEach((n) => {
          if (!this.cachedNews.some((item) => item.id === n.id)) {
            this.cachedNews.push(n);
          }
        });
      } else if (news && news.id) {
        if (!this.cachedNews.some((item) => item.id === news.id)) {
          this.cachedNews.push(news);
        }
      }
    },
    // 获取缓存新闻
    getCachedNews() {
      return this.cachedNews;
    },
    // 新增: 切换新闻的收藏状态
    toggleFavorite(newsId) {
      const index = this.favoriteNewsIds.indexOf(newsId);
      if (index > -1) {
        // 如果已收藏，则取消收藏
        this.favoriteNewsIds.splice(index, 1);
        this.showMessage("已取消收藏", "warning");
      } else {
        // 如果未收藏，则添加收藏
        this.favoriteNewsIds.push(newsId);
        this.showMessage("收藏成功", "success");
      }
    },
    // 新增: 切换新闻的点赞状态
    toggleLike(newsId) {
      const index = this.likedNewsIds.indexOf(newsId);
      if (index > -1) {
        this.likedNewsIds.splice(index, 1);
      } else {
        this.likedNewsIds.push(newsId);
        this.showMessage("点赞成功！", "success");
      }
    },
  },
});
