import {defineStore} from 'pinia'
import {ElMessage} from 'element-plus'

export const useGlobalStore = defineStore('global', {
    state: () => ({
        userId: null,
        username: null,
        email: null,
        isAuthenticated: false,
        isAdmin: false,
        theme: localStorage.getItem('recipe-app-theme') || 'light',
    }),
    actions: {
        toggleTheme() {
            this.theme = this.theme === 'light' ? 'dark' : 'light'
            document.documentElement.className = this.theme
            localStorage.setItem('recipe-app-theme', this.theme)
            ElMessage({
                message: `主题已切换为 ${this.theme === 'light' ? '明亮' : '暗黑'}模式`,
                type: 'success',
                plain: true,
            })
        },

        initTheme() {
            document.documentElement.className = this.theme
        },

        /** 初始化登录状态（刷新页面时调用） */
        initAuth() {
            const savedUser = localStorage.getItem('user')
            if (savedUser) {
                try {
                    const userData = JSON.parse(savedUser)
                    this.userId = userData.userId
                    this.username = userData.username
                    this.email = userData.email
                    this.isAuthenticated = true
                    this.isAdmin = !!userData.isAdmin
                } catch (e) {
                    console.error('用户信息解析失败，清除本地登录状态', e)
                    localStorage.removeItem('user')
                }
            }
        },

        /** 登录方法 */
        login(userData) {
            this.userId = userData.UserID
            this.username = userData.Username
            this.email = userData.Email
            this.isAuthenticated = true
            this.isAdmin = !!userData.isAdmin

            // 保存到 localStorage
            localStorage.setItem(
                'user',
                JSON.stringify({
                    userId: this.userId,
                    username: this.username,
                    email: this.email,
                    isAdmin: this.isAdmin,
                })
            )
        },

        /** 登出方法 */
        logout() {
            this.userId = null
            this.username = null
            this.email = null
            this.isAuthenticated = false
            this.isAdmin = false

            localStorage.removeItem('user')
        },
    },
})
