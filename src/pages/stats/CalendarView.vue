<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, onMounted, ref } from 'vue'

import { useKeyboardStatsStore } from '@/stores/keyboardStats'

const emit = defineEmits<{
  (e: 'date-selected', date: string): void
}>()
const keyboardStats = useKeyboardStatsStore()
// 当前显示的月份（默认今天）
const currentMonth = ref(dayjs())

// 初始化：加载统计数据（修复原代码拼写错误）
onMounted(async () => {
  await keyboardStats.init()
})

// 月份文本（如：2025年10月）
const currentMonthText = computed(() => {
  return currentMonth.value.format('YYYY年MM月')
})

// 当月天数
const currentMonthDays = computed(() => {
  return currentMonth.value.daysInMonth()
})

// 上月残留天数（填充第一行空白）
const prevMonthDays = computed(() => {
  const firstDayOfMonth = currentMonth.value.startOf('month').day() // 0-6（周日-周六）
  const prevMonthLastDay = currentMonth.value.subtract(1, 'month').daysInMonth()
  return Array.from({ length: firstDayOfMonth }, (_, i) => prevMonthLastDay - firstDayOfMonth + 1 + i)
})

// 下月残留天数（填充最后一行空白）
const nextMonthDays = computed(() => {
  const lastDayOfMonth = currentMonth.value.endOf('month').day() // 0-6
  const need = 6 - lastDayOfMonth // 需要填充的天数
  return Array.from({ length: need }, (_, i) => i + 1)
})

// 选中的日期（格式：YYYY-MM-DD）
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))

// 获取当月所有日期的计数数据
const currentMonthCounts = computed(() => {
  return Array.from({ length: currentMonthDays.value }, (_, i) => {
    const day = i + 1
    const date = currentMonth.value.date(day).format('YYYY-MM-DD')
    return keyboardStats.getDayData(date).total
  })
})

// 获取当月最大计数
const maxCount = computed(() => {
  const counts = currentMonthCounts.value.filter(count => count > 0)
  return counts.length > 0 ? Math.max(...counts) : 0
})

// 全局最佳战绩
const bestRecord = computed(() => {
  const allDates = keyboardStats.getDateList()
  if (allDates.length === 0) return { date: '', total: 0 }

  let bestDate = allDates[0]
  let maxTotal = keyboardStats.getDayData(bestDate).total

  allDates.forEach((date) => {
    const currentTotal = keyboardStats.getDayData(date).total
    if (currentTotal > maxTotal) {
      maxTotal = currentTotal
      bestDate = date
    }
  })

  return { date: bestDate, total: maxTotal }
})

// 判断日期是否被选中
function isSelected(day: number) {
  const date = currentMonth.value.date(day).format('YYYY-MM-DD')
  return date === selectedDate.value
}

// 判断日期是否有数据
function hasData(day: number) {
  const date = currentMonth.value.date(day).format('YYYY-MM-DD')
  return keyboardStats.getDayData(date).total > 0
}

// 获取当日计数
function getDayCount(day: number) {
  const date = currentMonth.value.date(day).format('YYYY-MM-DD')
  return keyboardStats.getDayData(date).total
}

// 判断是否为当月最大计数
function isHighestCount(day: number) {
  const count = getDayCount(day)
  return count > 0 && count === maxCount.value
}

// 选择日期
function selectDate(day: number) {
  const date = currentMonth.value.date(day).format('YYYY-MM-DD')
  selectedDate.value = date
  // eslint-disable-next-line vue/custom-event-name-casing
  emit('date-selected', date)
}

// 切换到上月
function prevMonth() {
  currentMonth.value = currentMonth.value.subtract(1, 'month')
}

// 切换到下月
function nextMonth() {
  currentMonth.value = currentMonth.value.add(1, 'month')
}

// 回到今天
function today() {
  currentMonth.value = dayjs()
  const today = dayjs().format('YYYY-MM-DD')
  selectedDate.value = today
  // eslint-disable-next-line vue/custom-event-name-casing
  emit('date-selected', today)
}
</script>

<template>
  <div class="custom-calendar">
    <!-- 最佳战绩展示区 -->
    <div class="best-record-section">
      <div class="record-header">
        <span class="trophy-icon">🏆</span>
        <span class="record-title">全局最佳战绩</span>
      </div>
      <div class="record-content">
        <template v-if="bestRecord.total > 0">
          <span class="record-date">
            {{ dayjs(bestRecord.date).format('YYYY年MM月DD日') }}
          </span>
          <span class="record-separator">|</span>
          <span class="record-total">
            总敲击次数：<span class="golden-text">{{ bestRecord.total }} 次</span>
          </span>
        </template>
        <template v-else>
          <span class="no-record">暂无历史记录，开始积累你的战绩吧！</span>
        </template>
      </div>
    </div>

    <!-- 月份导航 -->
    <div class="calendar-header">
      <button @click="prevMonth">
        ←
      </button>
      <h4>{{ currentMonthText }}</h4>
      <button @click="nextMonth">
        →
      </button>
      <button @click="today">
        今天
      </button>
    </div>

    <!-- 星期标题 -->
    <div class="weekdays">
      <div class="weekday">
        日
      </div>
      <div class="weekday">
        一
      </div>
      <div class="weekday">
        二
      </div>
      <div class="weekday">
        三
      </div>
      <div class="weekday">
        四
      </div>
      <div class="weekday">
        五
      </div>
      <div class="weekday">
        六
      </div>
    </div>

    <!-- 日期网格 -->
    <div class="days-grid">
      <!-- 上月残留日期（灰色） -->
      <div
        v-for="day in prevMonthDays"
        :key="`prev-${day}`"
        class="day prev-month"
      >
        <div class="day-number">
          {{ day }}
        </div>
      </div>

      <!-- 当月日期 -->
      <div
        v-for="day in currentMonthDays"
        :key="day"
        class="day current-month"
        :class="{
          'selected': isSelected(day),
          'has-data': hasData(day),
          'highest-count': isHighestCount(day),
        }"
        @click="selectDate(day)"
      >
        <div class="day-number">
          {{ day }}
        </div>
        <div
          v-if="hasData(day)"
          class="day-count"
          :class="{ 'golden-count': isHighestCount(day) }"
        >
          {{ getDayCount(day) }}次
        </div>
      </div>

      <!-- 下月残留日期（灰色） -->
      <div
        v-for="day in nextMonthDays"
        :key="`next-${day}`"
        class="day next-month"
      >
        <div class="day-number">
          {{ day }}
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* 1. 无scoped的style：定义全局颜色变量和媒体查询（避免scoped隔离） */
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #888888;
  --secondary-bg: #f9f9f9;
  --accent-color: #42b983;
  --light-gray: #f5f5f5;
  --light-text: #666666;
  --muted-text: #aaaaaa;
  --selected-bg: #ccc;
  --golden-color: #ffd700;
  --hover-color: #f0f0f0;
}

/* 暗黑模式媒体查询（全局生效，不受scoped影响） */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #333333;
    --text-color: #f0f0f0;
    --border-color: #888;
    --secondary-bg: #2d2d2d;
    --accent-color: #42b983;
    --light-gray: #444;
    --light-text: #bbbbbb;
    --muted-text: #666666;
    --selected-bg: #444;
    --golden-color: #ffdf33;
    --hover-color: #555555;
  }
}
</style>

<style scoped>
/* 2. scoped的style：组件具体样式（用var引用全局变量） */
.custom-calendar {
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
  background-color: transparent;
  color: var(--text-color);
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}

/* 最佳战绩样式 */
.best-record-section {
  background-color: var(--secondary-bg);
  border-radius: 6px;
  padding: 12px 15px;
  margin-bottom: 15px;
  text-align: center;
  transition: background-color 0.3s ease;
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--text-color);
  font-weight: 500;
}

.trophy-icon {
  font-size: 18px;
}

.record-title {
  font-size: 15px;
}

.record-content {
  font-size: 14px;
  color: var(--light-text);
}

.record-date {
  color: var(--accent-color);
  font-weight: 500;
}

.record-separator {
  margin: 0 8px;
  color: var(--border-color);
}

.golden-text {
  color: var(--golden-color);
  font-weight: bold;
  text-shadow: 0 0 1px rgba(255, 215, 0, 0.5);
}

.no-record {
  color: var(--muted-text);
  font-style: italic;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
}

.calendar-header button {
  padding: 4px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  color: var(--text-color);
  transition: all 0.3s ease;
}

.calendar-header button:hover {
  background: var(--light-gray);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 10px;
}

.weekday {
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  color: var(--light-text);
  padding: 8px 0;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day {
  height: 60px;
  padding: 8px 5px;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s ease;
}

.day-number {
  font-size: 16px;
  margin-bottom: 4px;
}

.day-count {
  font-size: 12px;
  color: var(--accent-color);
  position: static;
  margin-top: auto;
}

/* 上月/下月日期样式 */
.prev-month,
.next-month {
  background: transparent;
  color: var(--muted-text);
  border: 1px solid transparent;
}

/* 当月日期样式 */
.current-month {
  background: transparent;
  border: 1px solid var(--border-color);
}

.current-month:hover {
  background: var(--light-gray);
}

/* 有数据的日期 */
.has-data {
  border-color: var(--accent-color);
}

/* 选中日期样式 */
.selected {
  background: var(--selected-bg);
  border-color: var(--selected-bg);
}

/* 最高计数样式 */
.golden-count {
  color: var(--golden-color);
  text-shadow: 0 0 1px rgba(255, 215, 0, 0.5);
}
</style>
