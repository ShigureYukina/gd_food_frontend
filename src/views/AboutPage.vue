<template>
  <div class="about-page el-container is-vertical">
    <el-main class="page-content">
      <el-row justify="center">
        <el-col :xs="24" :sm="22" :md="18" :lg="16" :xl="14">
          <el-card shadow="never" class="content-card">
            <div class="prose">
              <section>
                <h2>我们的使命</h2>
                <p>
                  欢迎来到 <strong>Vue新闻</strong>！这是一个基于 Vue 3 和
                  Element Plus
                  构建的现代化新闻聚合平台示例。我们的目标是展示如何利用这些先进技术打造一个功能丰富、用户体验优秀的前端应用。我们致力于为您提供最新、最相关的（模拟）新闻资讯，内容涵盖技术前沿、行业动态等。
                </p>
              </section>

              <el-divider />

              <section>
                <h2>平台特色</h2>
                <ul>
                  <li>
                    <strong>现代技术栈</strong>: 采用 Vue 3 (Composition API 与
                    <code>&lt;script setup&gt;</code>), Element Plus UI 库,
                    Pinia 进行状态管理, 以及 Vue Router 负责前端路由。
                  </li>
                  <li>
                    <strong>响应式设计</strong>:
                    确保在桌面和移动设备上均有良好的浏览体验。
                  </li>
                  <li>
                    <strong>动态主题切换</strong>:
                    支持明亮与暗黑模式一键切换，提升个性化阅读感受 (此功能通过
                    Pinia 全局状态管理实现)。
                  </li>
                  <li>
                    <strong>模拟数据源</strong>: 新闻内容通过
                    <code class="inline-code">Mock.js</code>
                    动态生成，为您提供丰富的测试数据而无需依赖后端接口。
                  </li>
                  <li>
                    <strong>规范化样式</strong>:
                    全局及组件样式精心设计，文本密集型页面（如本页）采用
                    <code class="inline-code">.prose</code>
                    类进行排版优化，定义于
                    <code class="inline-code">src/assets/main.css</code>。
                  </li>
                </ul>
              </section>

              <el-divider />

              <section>
                <h2>核心技术一览</h2>
                <p>本项目主要基于以下开源技术构建：</p>
                <el-row :gutter="16" class="tech-stack-display">
                  <el-col :xs="12" :sm="6">
                    <el-card shadow="hover" class="tech-card">
                      <el-image
                        src="https://vuejs.org/images/logo.png"
                        alt="Vue 3 Logo"
                        fit="contain"
                        style="height: 50px; margin-bottom: 10px"
                      ></el-image>
                      <p><strong>Vue 3</strong><br />渐进式 JavaScript 框架</p>
                    </el-card>
                  </el-col>
                  <el-col :xs="12" :sm="6">
                    <el-card shadow="hover" class="tech-card">
                      <el-image
                        src="https://element-plus.org/images/element-plus-logo.svg"
                        alt="Element Plus Logo"
                        fit="contain"
                        style="height: 50px; margin-bottom: 10px"
                      ></el-image>
                      <p>
                        <strong>Element Plus</strong><br />基于 Vue 3 的组件库
                      </p>
                    </el-card>
                  </el-col>
                  <el-col :xs="12" :sm="6">
                    <el-card shadow="hover" class="tech-card">
                      <el-image
                        src="https://pinia.vuejs.org/logo.svg"
                        alt="Pinia Logo"
                        fit="contain"
                        style="height: 50px; margin-bottom: 10px"
                      ></el-image>
                      <p><strong>Pinia</strong><br />Vue 官方状态管理库</p>
                    </el-card>
                  </el-col>
                  <el-col :xs="12" :sm="6">
                    <el-card shadow="hover" class="tech-card">
                      <el-image
                        src="https://router.vuejs.org/logo.png"
                        alt="Vue Router Logo"
                        fit="contain"
                        style="height: 50px; margin-bottom: 10px"
                      ></el-image>
                      <p><strong>Vue Router</strong><br />Vue.js 的官方路由</p>
                    </el-card>
                  </el-col>
                </el-row>
              </section>

              <el-divider />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script setup>
defineOptions({
  name: "AboutPage",
});
</script>

<style scoped>
.about-page {
  padding-bottom: 2rem;
}

.page-header h1 {
  color: var(--el-text-color-primary);
}

.content-card {
  border: none;
  padding: 1rem 0;
}

.tech-stack-display .el-col {
  margin-bottom: 16px;
}

.tech-card {
  text-align: center;
  height: 100%; /* Make cards in a row same height */
}
.tech-card .el-image {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>
