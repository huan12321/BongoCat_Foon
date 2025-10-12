<!-- src/pages/preference/components/stats-viewer/index.vue -->
<script setup lang="ts">
import { ref } from 'vue'

import CalendarView from '@/pages/stats/CalendarView.vue'
import DailyChart from '@/pages/stats/DailyChart.vue'

const selectedDate = ref('')

// 接收日历选中的日期
function onDateSelected(date: string) {
  selectedDate.value = date
}
</script>

<template>
  <div class="stats-viewer">
    <h3>计数器管理</h3>

    <!-- 整月日历视图 -->
    <div class="calendar-container">
      <CalendarView @date-selected="onDateSelected" />
    </div>

    <!-- 当日统计图（选中日期后显示） -->
    <div
      v-if="selectedDate"
      class="chart-container"
    >
      <h4>{{ selectedDate }} 敲击次数统计（按小时）</h4>
      <DailyChart :date="selectedDate" />
    </div>
  </div>
</template>

<style scoped>
.stats-viewer {
  padding: 20px;
  max-width: 1000px;
}

.calendar-container {
  margin-bottom: 30px;
  border-radius: 8px;
  padding: 10px;
}

.chart-container {
  margin-top: 20px;
}
</style>
