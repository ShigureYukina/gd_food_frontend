<template>
  <div class="dashboard-page" v-if="!loading">
    <el-row :gutter="20" class="kpi-row">
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="kpi-card">
            <div
              class="kpi-icon"
              style="background-color: #e6f7ff; color: #1890ff"
            >
              <el-icon><Document /></el-icon>
            </div>
            <div class="kpi-text">
              <div class="kpi-label">新闻总数</div>
              <div class="kpi-value">{{ kpi.totalNews }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="kpi-card">
            <div
              class="kpi-icon"
              style="background-color: #fffbe6; color: #faad14"
            >
              <el-icon><Collection /></el-icon>
            </div>
            <div class="kpi-text">
              <div class="kpi-label">总分类数</div>
              <div class="kpi-value">{{ kpi.totalCategories }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="kpi-card">
            <div
              class="kpi-icon"
              style="background-color: #f6ffed; color: #52c41a"
            >
              <el-icon><View /></el-icon>
            </div>
            <div class="kpi-text">
              <div class="kpi-label">总浏览量</div>
              <div class="kpi-value">{{ kpi.totalViews }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="kpi-card">
            <div
              class="kpi-icon"
              style="background-color: #e9e3ff; color: #722ed1"
            >
              <el-icon><Pointer /></el-icon>
            </div>
            <div class="kpi-text">
              <div class="kpi-label">总点赞数</div>
              <div class="kpi-value">{{ kpi.totalLikes }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="kpi-card">
            <div
              class="kpi-icon"
              style="background-color: #fff2e8; color: #fa541c"
            >
              <el-icon><Star /></el-icon>
            </div>
            <div class="kpi-text">
              <div class="kpi-label">总收藏数</div>
              <div class="kpi-value">{{ kpi.totalFavorites }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover">
          <div class="kpi-card">
            <div
              class="kpi-icon"
              style="background-color: #fff1f0; color: #f5222d"
            >
              <el-icon><ChatLineSquare /></el-icon>
            </div>
            <div class="kpi-text">
              <div class="kpi-label">总评论数</div>
              <div class="kpi-value">{{ kpi.totalComments }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <ChartCard title="新闻分类占比" :option="categoryPieOption" />
      </el-col>
      <el-col :span="12">
        <ChartCard title="各分类平均浏览量" :option="viewsBarOption" />
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <ChartCard
          title="各分类互动数据"
          :option="interactionBarOption"
        />
      </el-col>
       <el-col :span="12">
        <ChartCard
          title="新闻发布趋势 (近30天)"
          :option="publicationLineOption"
        />
      </el-col>
    </el-row>
  </div>
  <el-skeleton v-else :rows="10" animated />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { newsService } from "@/services/newsService";
import ChartCard from "@/components/ChartCard.vue";
// ===== UPDATED: 导入新增图标 =====
import {
  Document,
  Collection,
  View,
  ChatLineSquare,
  Pointer,
  Star,
} from "@element-plus/icons-vue";

const allNews = ref([]);
const loading = ref(true);

// ===== UPDATED: 在KPI计算中增加点赞和收藏 =====
const kpi = computed(() => {
  const totalViews = allNews.value.reduce((sum, news) => sum + news.views, 0);
  const totalLikes = allNews.value.reduce((sum, news) => sum + (news.likes || 0), 0);
  const totalFavorites = allNews.value.reduce((sum, news) => sum + (news.favorites || 0), 0);
  const totalComments = allNews.value.reduce(
    (sum, news) => sum + (news.comments?.length || 0),
    0
  );
  const uniqueCategories = [
    ...new Set(allNews.value.map((news) => news.category)),
  ];
  return {
    totalNews: allNews.value.length,
    totalCategories: uniqueCategories.length,
    totalViews: totalViews.toLocaleString(),
    totalLikes: totalLikes.toLocaleString(),
    totalFavorites: totalFavorites.toLocaleString(),
    totalComments: totalComments.toLocaleString(),
  };
});

// 新闻分类占比（饼图）数据
const categoryData = computed(() => {
  const categoryCount = allNews.value.reduce((acc, news) => {
    acc[news.category] = (acc[news.category] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(categoryCount).map((key) => ({
    name: key,
    value: categoryCount[key],
  }));
});

// 各分类统计数据（用于多个图表）
const categoryStats = computed(() => {
  const stats = allNews.value.reduce((acc, news) => {
    if (!acc[news.category]) {
      acc[news.category] = { totalViews: 0, totalLikes: 0, totalFavorites: 0, count: 0 };
    }
    acc[news.category].totalViews += news.views || 0;
    acc[news.category].totalLikes += news.likes || 0;
    acc[news.category].totalFavorites += news.favorites || 0;
    acc[news.category].count += 1;
    return acc;
  }, {});

  return Object.keys(stats).map((key) => ({
    name: key,
    avgViews: Math.round(stats[key].totalViews / stats[key].count),
    avgLikes: Math.round(stats[key].totalLikes / stats[key].count),
    avgFavorites: Math.round(stats[key].totalFavorites / stats[key].count),
  }));
});

// 近30天发布趋势数据
const publicationTrendData = computed(() => {
  const last30Days = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last30Days[d.toISOString().split("T")[0]] = 0;
  }
  allNews.value.forEach((news) => {
    const date = news.date;
    if (last30Days[date] !== undefined) {
      last30Days[date]++;
    }
  });
  return {
    dates: Object.keys(last30Days),
    counts: Object.values(last30Days),
  };
});

// --- ECharts 配置 ---

// 分类占比饼图配置
const categoryPieOption = computed(() => ({
  tooltip: { trigger: "item" },
  legend: { top: "5%", left: "center" },
  series: [
    {
      name: "新闻分类",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
      label: { show: false, position: "center" },
      emphasis: { label: { show: true, fontSize: "20", fontWeight: "bold" } },
      labelLine: { show: false },
      data: categoryData.value,
    },
  ],
}));

// 平均浏览量条形图配置
const viewsBarOption = computed(() => ({
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  xAxis: {
    type: "category",
    data: categoryStats.value.map((item) => item.name).sort((a,b) => b.avgViews - a.avgViews),
  },
  yAxis: { type: "value" },
  series: [
    {
      name: "平均浏览量",
      data: categoryStats.value.map((item) => item.avgViews),
      type: "bar",
    },
  ],
}));

// ===== NEW: 各分类互动数据条形图配置 =====
const interactionBarOption = computed(() => ({
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  legend: { data: ['平均点赞数', '平均收藏数'] },
  xAxis: {
    type: 'category',
    data: categoryStats.value.map(item => item.name),
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '平均点赞数',
      type: 'bar',
      data: categoryStats.value.map(item => item.avgLikes),
      itemStyle: { color: '#722ed1' }
    },
    {
      name: '平均收藏数',
      type: 'bar',
      data: categoryStats.value.map(item => item.avgFavorites),
      itemStyle: { color: '#fa541c' }
    }
  ]
}));


// 发布趋势折线图配置
const publicationLineOption = computed(() => ({
  tooltip: { trigger: "axis" },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: publicationTrendData.value.dates.map((d) => d.substring(5)),
  },
  yAxis: { type: "value" },
  series: [
    {
      name: "发布数量",
      data: publicationTrendData.value.counts,
      type: "line",
      areaStyle: {},
    },
  ],
}));

onMounted(async () => {
  try {
    const response = await newsService.getNews();
    allNews.value = response.data;
  } catch (error) {
    console.error("无法加载新闻数据:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard-page {
  padding: 20px;
  background-color: #f0f2f5;
}
.kpi-row {
  margin-bottom: 20px;
}
.kpi-card {
  display: flex;
  align-items: center;
}
.kpi-icon {
  font-size: 2rem;
  padding: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}
.kpi-text .kpi-label {
  font-size: 0.9rem;
  color: var(--el-text-color-secondary);
}
.kpi-text .kpi-value {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>