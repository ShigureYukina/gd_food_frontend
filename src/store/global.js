import {defineStore} from 'pinia'
import {ElMessage} from 'element-plus';

// 从 localStorage 获取用户数据的辅助函数
const getUserFromStorage = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const useGlobalStore = defineStore("global", {
    // 现在从 localStorage 初始化 state，以实现会话持久化。
    state: () => {
        const storedUser = getUserFromStorage();
        return {
            userId: storedUser?.UserID || null,
            username: storedUser?.Username || null,
            email: storedUser?.Email || null,
            isAuthenticated: !!storedUser,
            isAdmin: storedUser?.UserRole === 1 || false,
            theme: localStorage.getItem("recipe-app-theme") || "light",
        };
    },
    actions: {
        /**
         * 在亮色和暗色模式之间切换应用主题。
         */
        toggleTheme() {
            this.theme = this.theme === "light" ? "dark" : "light";
            document.documentElement.className = this.theme;
            localStorage.setItem("recipe-app-theme", this.theme);
            ElMessage({
                message: `主题已切换为 ${this.theme === 'light' ? '明亮' : '暗黑'} 模式`,
                type: 'success',
                plain: true
            });
        },
        /**
         * 根据 localStorage 中的值初始化主题。
         */
        initTheme() {
            document.documentElement.className = this.theme;
        },
        /**
         * 用户登录，更新 state, 并将用户数据存储到 localStorage。
         * @param {object} userData - 来自 API 的用户数据对象。
         */
        login(userData) {
            this.userId = userData.UserID;
            this.username = userData.Username;
            this.email = userData.Email;
            this.isAuthenticated = true;
            this.isAdmin = userData.UserRole === 1;
            // 将用户数据持久化到 localStorage
            localStorage.setItem('user', JSON.stringify(userData));
        },
        /**
         * 用户登出，清空 state，并从 localStorage 中移除用户数据。
         */
        logout() {
            this.userId = null;
            this.username = null;
            this.email = null;
            this.isAuthenticated = false;
            this.isAdmin = false;
            // 从 localStorage 移除用户数据以结束会话
            localStorage.removeItem('user');
        }
    }
});
