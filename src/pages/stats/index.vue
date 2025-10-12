<!-- src/pages/stats/index.vue -->
<script setup lang="ts">
import { ref } from 'vue'

import CalendarView from './CalendarView.vue'
import DailyChart from './DailyChart.vue'

const selectedDate = ref('')

function onDateSelected(date: string) {
  selectedDate.value = date
}
</script>

<template>
  <div class="stats-page">
    <h1>键盘统计</h1>
    <CalendarView @date-selected="onDateSelected" />
    <div
      v-if="selectedDate"
      class="daily-chart"
    >
      <h2>{{ selectedDate }} 统计</h2>
      <DailyChart :date="selectedDate" />
    </div>
  </div>
</template>
