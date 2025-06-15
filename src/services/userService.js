import mockData from "@/utils/mock-data";

export const userService = {
    async getUserById(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = mockData.users.find(u => u.UserID.toString() === userId.toString());
                resolve(user || null);
            }, 300);
        });
    },

    async getUserName(userId) {
        const user = await this.getUserById(userId);
        return user ? user.Username : '匿名用户';
    },

    getUserAvatar(userId) {
        const user = mockData.users.find(u => u.UserID.toString() === userId.toString());
        return user ? user.Avatar : `https://i.pravatar.cc/150?u=${userId}`;
    },

    getUserByUsername(username) {
        return mockData.users.find(u => u.Username === username);
    },

    getUserByEmail(email) {
        return mockData.users.find(u => u.Email === email);
    },

    register({username, email, password}) {
        // 这里调用 this.xxx 而不是直接调用函数名
        if (this.getUserByUsername(username)) {
            return {success: false, message: '用户名已被占用'};
        }
        if (this.getUserByEmail(email)) {
            return {success: false, message: '邮箱已被占用'};
        }

        const newUser = {
            UserID: (mockData.users.length + 1).toString(),
            Username: username,
            Email: email,
            Password: password,
            Bio: '',
            Avatar: 'https://picsum.photos/200/200?random=' + Math.random(),
            isAdmin: false,
        };

        mockData.users.push(newUser);

        return {success: true, message: '注册成功', user: newUser};
    },

    /**
     * 更新用户头像（异步处理）
     * @param {number|string} userId
     * @param {string} newAvatar
     * @returns {Promise<boolean>}
     */
    async updateAvatar(userId, newAvatar) {
        const user = await this.getUserById(userId);
        if (user) {
            user.Avatar = newAvatar;

            const index = mockData.users.findIndex(u => u.UserID.toString() === userId.toString());
            if (index !== -1) {
                mockData.users[index].Avatar = newAvatar;
            }

            console.log(`[mock] 用户 ${userId} 的头像已更新`);
            return true;
        }

        console.warn(`[mock] 用户 ${userId} 不存在，头像更新失败`);
        return false;
    },
    /**
     * 模拟更新用户密码
     * @param {number|string} userId
     * @param {string} oldPassword
     * @param {string} newPassword
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async updatePassword(userId, oldPassword, newPassword) {
        // 模拟异步延迟
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = mockData.users.find(u => u.UserID.toString() === userId.toString());
                if (!user) {
                    resolve({ success: false, message: '用户不存在' });
                    return;
                }

                if (user.Password !== oldPassword) {
                    resolve({ success: false, message: '旧密码错误' });
                    return;
                }

                user.Password = newPassword;

                // 这里同步更新 mockData 中的数据（其实已经是同一个对象）
                const idx = mockData.users.findIndex(u => u.UserID.toString() === userId.toString());
                if (idx !== -1) {
                    mockData.users[idx].Password = newPassword;
                }

                console.log(`[mock] 用户 ${userId} 密码已更新`);
                resolve({ success: true, message: '密码修改成功' });
            }, 300);
        });
    },
};
