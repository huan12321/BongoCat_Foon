<!-- src/pages/stats/DailyChart.vue -->
<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, ref, watch } from 'vue'

import { useKeyboardStatsStore } from '@/stores/keyboardStats'

const props = defineProps<{ date: string }>()
const chartRef = ref<HTMLDivElement>(null)
const chart = ref<echarts.ECharts | null>(null)
const keyboardStats = useKeyboardStatsStore()

onMounted(() => {
  if (chartRef.value) {
    chart.value = echarts.init(chartRef.value)
    updateChart(props.date)
    window.addEventListener('resize', () => chart.value?.resize())
  }
})

watch(() => props.date, (newDate) => {
  updateChart(newDate)
})

// 计算最高次数及索引
function getMaxCountInfo(data: number[]) {
  if (data.length === 0) return { maxCount: 0, maxIndex: -1 }
  const maxCount = Math.max(...data)
  const maxIndex = data.indexOf(maxCount)
  return { maxCount, maxIndex }
}

// 更新图表（按连续分钟区间显示）
function updateChart(date: string) {
  if (!chart.value) return

  // 1. 获取连续分钟数据（仅包含有数据的区间）
  const { axis: minuteAxis, data: minuteData } = keyboardStats.getContinuousMinuteStats(date)
  const { maxIndex } = getMaxCountInfo(minuteData)

  // 2. 动态计算X轴标签间隔（根据数据量自动调整，避免密集）
  const labelInterval = minuteAxis.length > 60
    ? Math.ceil(minuteAxis.length / 30) // 数据多：每30个显示1个
    : minuteAxis.length > 30
      ? Math.ceil(minuteAxis.length / 15) // 数据中等：每15个显示1个
      : 0 // 数据少：全部显示

  chart.value.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#ddd',
      borderWidth: 1,
      textStyle: { color: '#333' },
      padding: 10,
      formatter: (params: any) => {
        const count = params.value || params.data
        const isMax = params.dataIndex === maxIndex && count > 0
        return `<div style="font-weight: 600;">${params.name}</div>
                <div>敲击次数：${count} 次${isMax ? '（最高）' : ''}</div>`
      },
    },
    grid: {
      left: '5%',
      right: '10%',
      bottom: minuteAxis.length > 30 ? '18%' : '10%', // 数据多则扩大底部边距
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: minuteAxis,
      name: '时间（分钟）',
      nameTextStyle: { fontSize: 12, padding: [10, 0, 0, 0] },
      axisLabel: {
        fontSize: 10,
        rotate: minuteAxis.length > 30 ? 45 : 0, // 数据多则旋转标签
        interval: labelInterval, // 动态间隔
        align: 'right',
      },
      axisLine: { lineStyle: { color: '#eee' } },
    },
    yAxis: {
      type: 'value',
      name: '敲击次数',
      min: 0,
      nameTextStyle: { fontSize: 12, padding: [0, 10, 0, 0] },
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { color: '#f5f5f5' } },
    },
    series: [{
      data: minuteData,
      type: 'bar',
      // 动态调整柱体宽度（数据多则变窄）
      barWidth: minuteAxis.length > 100 ? 2 : minuteAxis.length > 50 ? 4 : 6,
      itemStyle: {
        color: (params: any) => params.dataIndex === maxIndex && maxIndex !== -1 ? '#FFD700' : '#42b983',
      },
      emphasis: {
        focus: 'self',
        itemStyle: { opacity: 0.8 },
      },
    }],
    animationDuration: 0,
  })
}
</script>

<template>
  <div
    ref="chartRef"
    class="chart-wrapper"
  />
</template>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 450px;
}
</style>
