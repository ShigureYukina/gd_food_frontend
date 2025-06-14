// src/services/userService.js
import MOCK_DATA from '../utils/mock-data';

export const userService = {
    // 根据用户ID获取用户信息
    getUserById(userId) {
        return MOCK_DATA.users.find(user => user.UserID === userId) || null;
    },

    // 获取所有用户
    getAllUsers() {
        return MOCK_DATA.users;
    },

    // 获取用户头像
    getUserAvatar(userId) {
        const user = this.getUserById(userId);
        return user && user.Avatar
            ? user.Avatar
            : `https://i.pravatar.cc/150?u=${userId}`;
    },

    // 获取用户名称
    getUserName(userId) {
        const user = this.getUserById(userId);
        return user ? user.Username : '匿名用户';
    }
};
