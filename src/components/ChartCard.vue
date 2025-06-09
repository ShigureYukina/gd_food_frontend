<template>
  <el-card shadow="hover" class="chart-card">
    <template #header>
      <div class="card-header">
        <span>{{ title }}</span>
      </div>
    </template>
    <v-chart class="chart" :option="option" autoresize />
  </el-card>
</template>

<script setup>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart, BarChart, LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { defineProps } from "vue";

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

defineProps({
  title: {
    type: String,
    required: true,
  },
  option: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.chart-card {
  height: 400px;
}
.chart {
  height: 320px;
}
.card-header span {
  font-weight: bold;
  font-size: 1.1rem;
}
</style>
