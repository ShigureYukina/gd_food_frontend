import {defineStore} from 'pinia'
import {ElMessage} from 'element-plus';

export const useGlobalStore = defineStore("global", {
    state: () => ({
        userId: null,
        username: null,
        email: null,
        isAuthenticated: false,
        isAdmin: false, // 确保初始状态为 false
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
        // 登录方法
        login(userData) {
            this.userId = userData.UserID;
            this.username = userData.Username;
            this.email = userData.Email;
            this.isAuthenticated = true;
            this.isAdmin = !!userData.isAdmin;
        },
        // 登出方法
        logout() {
            this.userId = null;
            this.username = null;
            this.email = null;
            this.isAuthenticated = false;
            this.isAdmin = false; // 登出时重置 isAdmin 状态
            localStorage.removeItem('user'); // 如果你将用户数据存储在 localStorage，登出时应移除
        }
    }
});