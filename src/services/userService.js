// src/services/userService.js

import Mock from "mockjs";
import multiavatar from "@multiavatar/multiavatar";

const R = Mock.Random;

// ===== 核心改动 1: 创建一个预生成、固定的用户基础信息库 =====
const MOCK_USER_COUNT = 100; // 假设我们有100个模拟用户
const mockUserBaseData = (() => {
  const users = [];
  for (let i = 1; i <= MOCK_USER_COUNT; i++) {
    users.push({
      userId: i,
      username: Mock.mock("@cname"), // 在创建时就固定用户名
      avatar: multiavatar(String(i)), // 根据ID生成固定、可复现的头像
    });
  }
  return users;
})();

// 为了快速查询，将数组转换为 Map
const userMap = new Map(mockUserBaseData.map((user) => [user.userId, user]));

/**
 * ===== 核心改动 2: 导出一个可供其他服务使用的函数 =====
 * 根据用户ID获取固定的基础用户信息 (用户名、头像)
 * @param {string | number} userId
 * @returns {{userId: number, username: string, avatar: string}}
 */
export const getUserBaseById = (userId) => {
  const id = parseInt(userId, 10);
  return (
    userMap.get(id) || {
      userId: id,
      username: "未知用户",
      avatar: multiavatar(String(id)),
    }
  );
};

const userProfileCache = {};

/**
 * 生成完整的、包含随机信息的个人资料
 * @param {string | number} userId
 * @returns {object}
 */
const generateUserProfile = (userId) => {
  // ===== 核心改动 3: 从基础信息库获取固定的信息 =====
  const baseUser = getUserBaseById(userId);

  return {
    ...baseUser, // 展开固定的 userId, username, avatar
    // 以下是每次可以随机生成的、非关键识别信息
    email: R.email(),
    registrationDate: R.date("yyyy-MM-dd"),
    bio: R.cparagraph(1, 3),
    address: {
      city: R.city(true),
      street: R.cword(3, 5) + "路" + R.natural(1, 100) + "号",
      zipcode: R.zip(),
    },
    stats: {
      articlesRead: R.natural(10, 500),
      commentsMade: R.natural(5, 100),
      likesReceived: R.natural(50, 2000),
    },
  };
};

// userService 的 getProfile 方法保持不变，它会调用上面的新版 generateUserProfile
export const userService = {
  async getProfile(userId) {
    if (!userId) {
      return Promise.reject(new Error("未提供有效的用户ID"));
    }
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 300)
    );
    if (!userProfileCache[userId]) {
      userProfileCache[userId] = generateUserProfile(userId);
    }
    return { data: userProfileCache[userId] };
  },
};
