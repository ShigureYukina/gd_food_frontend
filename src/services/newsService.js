// src/services/newsService.js
import Mock from "mockjs";
import multiavatar from "@multiavatar/multiavatar";
import { getUserBaseById } from "./userService";

const R = Mock.Random; // Mock.Random 的别名，方便使用

// --- 生成单条新闻数据的辅助函数 ---
const generateSingleNewsItem = (id, specifiedCategory) => {
  const categories = [
    "技术",
    "游戏",
    "财经",
    "体育",
    "娱乐",
    "教育",
    "健康",
    // "技术", // (已移除重复项)
    "旅游",
    "时政",
  ]; // 新闻分类示例
  const title = Mock.mock("@ctitle(8, 20)"); // 中文标题，8到20个字
  return {
    id: id,
    title: title,
    content: Mock.mock("@csentence(25, 60)"), // 中文摘要，25到60个字
    category: specifiedCategory || R.pick(categories), // 随机选择一个分类
    date: Mock.mock("@date(yyyy-MM-dd)"), // 日期，格式 YYYY-MM-DD
    // 使用 placehold.co 生成图片 URL，确保 URL 是直接可用的
    imageUrl: `https://placehold.co/600x400/${R.hex()
      .substring(1)
      .toUpperCase()}/${R.hex()
      .substring(1)
      .toUpperCase()}?text=${encodeURIComponent(title.substring(0, 5))}`,
    fullContent: Mock.mock(`@cparagraph(5, 15)`), // 完整内容，5到15个段落
    views: Mock.mock("@integer(50, 3000)"), // 浏览量，50到3000
    author: Mock.mock("@cname"), // 作者名称
    // --- 互动数据 ---
    likes: Mock.mock("@integer(10, 1000)"),
    shares: Mock.mock("@integer(5, 200)"),
    // ===== 新增: 随机生成收藏数 =====
    favorites: Mock.mock("@integer(10, 500)"),

    comments: Mock.mock({
      "list|0-5": [
        {
          "userId|1-100": 1, // 先只生成一个 1-100 的随机ID
          id: "@increment",
        },
      ],
    }).list.map((comment) => {
      // 根据随机生成的 userId，从用户中心获取固定的用户信息
      const user = getUserBaseById(comment.userId);
      // 组装成最终的评论对象
      return {
        ...comment,
        author: user.username, // 使用固定的用户名
        avatarSvg: user.avatar, // 使用固定的头像
        content: Mock.mock("@cparagraph(1, 3)"), // 评论内容依然随机
        date: Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")'), // 日期依然随机
      };
    }),
  };
};

// --- 为当前会话生成一组固定的模拟新闻数据 ---
const TOTAL_NEWS_ITEMS = Math.floor(Math.random() * 10) + 20; // 生成20-30之间的随机数量
const mockNewsDataStore = (() => {
  const data = [];
  for (let i = 0; i < TOTAL_NEWS_ITEMS; i++) {
    data.push(generateSingleNewsItem(i + 1)); // ID 从 1 开始
  }
  return data;
})();

export const newsService = {
  async getNews(params = {}) {
    console.log("Fetching news with params (Mock.js):", params);
    // 模拟网络延迟
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 500)
    );

    let newsToReturn = [...mockNewsDataStore]; // 从完整数据存储中复制一份开始

    // 如果有分类参数，则按分类过滤
    if (params.category) {
      newsToReturn = newsToReturn.filter(
        (item) => item.category === params.category
      );
    }

    // 如果有搜索词参数，则按搜索词过滤 (标题、内容简介、完整内容)
    if (params.searchTerm) {
      const term = params.searchTerm.toLowerCase();
      newsToReturn = newsToReturn.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.content.toLowerCase().includes(term) ||
          item.fullContent.toLowerCase().includes(term)
      );
    }
    return { data: newsToReturn };
  },

  async getNewsById(id) {
    const articleId = parseInt(id);
    console.log(`Fetching news by id (Mock.js): ${articleId}`); // (修正了拼写错误)
    // 模拟网络延迟
    await new Promise((resolve) =>
      setTimeout(resolve, 150 + Math.random() * 300)
    );

    const article = mockNewsDataStore.find((item) => item.id === articleId);

    if (article) {
      // 模拟浏览量增加 (直接修改存储中的数据，以便效果持久)
      article.views = (article.views || 0) + 1;
      return { data: { ...article } }; // 返回文章数据的副本
    } else {
      return Promise.reject({
        response: { status: 404, data: { message: "新闻未找到 (Mock.js)" } },
      });
    }
  },

  async getCategories() {
    console.log("Fetching categories (Mock.js)");
    // 模拟网络延迟
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 200)
    );

    // 从模拟新闻数据中提取分类及其数量
    const categoryCounts = mockNewsDataStore.reduce((acc, newsItem) => {
      acc[newsItem.category] = (acc[newsItem.category] || 0) + 1;
      return acc;
    }, {});

    const categories = Object.keys(categoryCounts).map((catName) => ({
      name: catName,
      count: categoryCounts[catName],
    }));

    return { data: categories };
  },
};
