<template>
  <div class="auth-container">
    <el-row justify="center" align="middle" style="height: 100vh;">
      <el-col :xs="22" :sm="16" :md="10" :lg="7">
        <el-card class="auth-card">
          <div class="auth-toggle-wrapper">
            <el-button-group>
              <el-button
                  :class="['toggle-button', { 'is-active': isLogin }]"
                  @click="isLogin = true"
                  size="large"
              >登录
              </el-button>
              <el-button
                  :class="['toggle-button', { 'is-active': !isLogin }]"
                  @click="isLogin = false"
                  size="large"
              >注册
              </el-button>
            </el-button-group>
          </div>

          <!-- Login Form -->
          <transition name="fade" mode="out-in">
            <div v-if="isLogin" key="login" class="form-container">
              <el-form label-position="top" :model="loginForm" ref="loginRef">
                <h2 class="auth-title">欢迎回来</h2>
                <el-form-item label="用户名或邮箱">
                  <el-input v-model="loginForm.usernameOrEmail" placeholder="请输入用户名或邮箱" size="large"/>
                </el-form-item>
                <el-form-item label="密码">
                  <el-input v-model="loginForm.password" type="password" show-password placeholder="请输入密码"
                            size="large"/>
                </el-form-item>
                <!-- FIX: Added verification code section -->
                <el-form-item label="验证码">
                  <div class="verify-code-container">
                    <el-input v-model="loginForm.verifyCode" placeholder="请输入验证码" size="large"/>
                    <VerifyCode v-model="correctCode" class="verify-code-img"/>
                  </div>
                </el-form-item>
                <el-button type="primary" @click="handleLogin" class="auth-button">立即登录</el-button>
                <el-button type="text" @click="handleForgotPassword" class="forgot-password-button">忘记密码？
                </el-button>
                <!-- 新增：以普通用户和管理员身份登录的按钮 -->
                <div class="user-role-buttons">
                  <el-button @click="loginAsUser" class="role-button user">以普通用户身份登录</el-button>
                  <el-button @click="loginAsAdmin" class="role-button admin">以管理员身份登录</el-button>
                </div>
              </el-form>
            </div>

            <!-- Register Form -->
            <div v-else key="register" class="form-container">
              <el-form label-position="top" :model="registerForm" ref="registerRef">
                <h2 class="auth-title">创建新账户</h2>
                <el-form-item label="用户名">
                  <el-input v-model="registerForm.username" placeholder="请输入用户名" size="large"/>
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="registerForm.email" placeholder="请输入邮箱" size="large"/>
                </el-form-item>
                <el-form-item label="密码">
                  <el-input v-model="registerForm.password" type="password" show-password placeholder="请输入密码"
                            size="large"/>
                </el-form-item>
                <el-form-item label="确认密码">
                  <el-input v-model="registerForm.confirmPassword" type="password" show-password
                            placeholder="请再次输入密码" size="large"/>
                </el-form-item>
                <el-button type="primary" @click="handleRegister" class="auth-button">立即注册</el-button>
              </el-form>
            </div>
          </transition>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {ElMessage} from 'element-plus';
import VerifyCode from '@/components/VerifyCode.vue'; // FIX: Import the component
import {useGlobalStore} from '@/store/global';

// State to toggle between login and register
const isLogin = ref(true);

// FIX: Added refs for verification code
const correctCode = ref(''); // Stores the correct code from the component
const loginForm = ref({
  usernameOrEmail: '',
  password: '',
  verifyCode: '', // Field for user input
});

// Register form data
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// Handle login logic
const handleLogin = () => {
  // FIX: Add verification code validation
  if (!loginForm.value.verifyCode) {
    ElMessage.error('请输入验证码');
    return;
  }
  if (loginForm.value.verifyCode.toLowerCase() !== correctCode.value.toLowerCase()) {
    ElMessage.error('验证码不正确，请重试');
    // Optionally, refresh the code
    // Note: This would require exposing the refresh method from the child component
    return;
  }
  console.log('Attempting to log in:', loginForm.value);
  // TODO: Implement login API call
  ElMessage.success('登录成功（模拟）');
};

// Handle register logic
const handleRegister = () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致');
    return;
  }
  console.log('Attempting to register:', registerForm.value);
  // TODO: Implement register API call
  ElMessage.success('注册成功（模拟）');
};

const handleForgotPassword = () => {
  ElMessage.info('忘记密码功能暂未实现');
};

// 新增：模拟以普通用户身份登录
const globalStore = useGlobalStore();
const loginAsUser = () => {
  const mockUser = {
    UserID: 1,
    Username: 'testuser',
    Email: 'user@example.com',
    PasswordHash: 'password123',
    UserRole: 0, // 0 表示普通用户
    Avatar: 'https://via.placeholder.com/100',
    Bio: '这是一个普通用户',
    RecipesPublished: 5
  };
  globalStore.login(mockUser);
  ElMessage.success('已以普通用户身份登录');
};

// 新增：模拟以管理员身份登录
const loginAsAdmin = () => {
  const mockAdmin = {
    UserID: 0,
    Username: 'admin',
    Email: 'admin@example.com',
    PasswordHash: 'admin123',
    UserRole: 1, // 1 表示管理员
    Avatar: 'https://via.placeholder.com/100',
    Bio: '系统管理员',
    RecipesPublished: 10
  };
  globalStore.login(mockAdmin);
  ElMessage.success('已以管理员身份登录');
};
</script>

<style scoped>
.auth-container {
  background: linear-gradient(135deg, var(--bg-color), #e9f0f7);
  overflow: hidden;
}

html.dark .auth-container {
  background: linear-gradient(135deg, var(--bg-color), #2c3e50);
}

.auth-card {
  padding: 30px 40px;
  border-radius: 15px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  background-color: var(--card-bg-color);
  border: none;
}

.auth-toggle-wrapper {
  text-align: center;
  margin-bottom: 30px;
}

.toggle-button {
  color: var(--el-text-color-primary);
  border-color: var(--border-color);
  transition: all 0.3s ease;
}

.toggle-button.is-active {
  background-color: var(--el-color-primary);
  color: #ffffff;
  border-color: var(--el-color-primary);
}

.html.dark .toggle-button.is-active {
  color: var(--bg-color);
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.html.dark .auth-title {
  color: #ffffff;
}

.html.dark .el-form-item__label {
  color: #e6e6e6;
}

.html.dark .el-input__inner {
  background-color: #2c2c2c;
  color: #ffffff;
  border-color: #595959;
}

.html.dark .el-button--primary {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.html.dark .el-button--primary:hover {
  background-color: var(--el-color-primary-light-5);
  border-color: var(--el-color-primary-light-5);
}

.toggle-button:hover:not(.is-active) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-5);
}

.auth-title {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
  color: var(--text-color);
}

.auth-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  margin-top: 15px;
  border-radius: 8px;
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: #ffffff;
  transition: all 0.3s ease;
}

.auth-button:hover {
  background-color: var(--el-color-primary-light-5);
  border-color: var(--el-color-primary-light-5);
}

.auth-button:active {
  background-color: var(--el-color-primary-dark-2);
  border-color: var(--el-color-primary-dark-2);
}

.el-form-item {
  margin-bottom: 22px;
}

.form-container {
  min-height: 500px;
}

/* FIX: Styles for the verification code container */
.verify-code-container {
  display: flex;
  align-items: center;
}

.verify-code-container .el-input {
  flex-grow: 1;
}

.verify-code-img {
  height: 40px;
  width: 170px;
}

.verify-code-container .el-input {
  flex-grow: 1;
}

.forgot-password-button {
  margin-top: 10px;
  font-size: 14px;
  color: var(--el-color-primary);
}

.user-role-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.role-button {
  flex-grow: 1;
  margin: 0 5px;
  transition: all 0.3s ease;
}

.role-button.user {
  background-color: var(--el-color-primary);
  color: #ffffff;
}

.role-button.admin {
  background-color: var(--el-color-warning);
  color: #ffffff;
}

.html.dark .role-button.user {
  background-color: var(--el-color-primary);
}

.html.dark .role-button.admin {
  background-color: var(--el-color-warning);
}

.role-button:hover {
  opacity: 0.9;
}

.role-button:active {
  transform: scale(0.98);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
