// src/stores/KeyboardStat.ts
import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface MinuteData {
  timestamp: number
  count: number
}

interface DailyData {
  date: string
  total: number
  minutes: Record<string, MinuteData>
}

export const useKeyboardStatsStore = defineStore('keyboardStats', () => {
  const dailyData = ref<Record<string, DailyData>>({})
  // 缓存分钟级数据计算结果（优化性能）
  const cachedMinuteStats = ref<Record<string, { axis: string[], data: number[] }>>({})

  // 初始化数据
  function init() {
    if (Object.keys(dailyData.value).length === 0) {
      dailyData.value = {}
    }
  }

  // 记录键盘敲击
  function recordKeyPress() {
    const now = dayjs()
    const date = now.format('YYYY-MM-DD')
    const minuteKey = now.format('HH:mm')
    const timestamp = now.startOf('minute').valueOf()

    // 初始化当日数据（如不存在）
    if (!dailyData.value[date]) {
      dailyData.value[date] = { date, total: 0, minutes: {} }
    }
    // 初始化当前分钟数据（如不存在）
    if (!dailyData.value[date].minutes[minuteKey]) {
      dailyData.value[date].minutes[minuteKey] = { timestamp, count: 0 }
    }

    // 累加计数
    dailyData.value[date].total++
    dailyData.value[date].minutes[minuteKey].count++
  }

  // 获取指定日期的详细数据
  function getDayData(date: string) {
    return dailyData.value[date] || { date, total: 0, minutes: {} }
  }

  // 获取所有有数据的日期列表（按时间排序）
  function getDateList() {
    return Object.keys(dailyData.value).sort((a, b) =>
      dayjs(a).valueOf() - dayjs(b).valueOf(),
    )
  }

  // 获取指定日期的小时级统计（0-23小时）
  function getHourlyStats(date: string): number[] {
    const dayData = getDayData(date)
    const hourlyData = Array.from({ length: 24 }).fill(0)

    Object.entries(dayData.minutes).forEach(([timeKey, minuteData]) => {
      const hour = Number.parseInt(timeKey.split(':')[0], 10)
      if (hour >= 0 && hour < 24) {
        hourlyData[hour] += minuteData.count
      }
    })

    return hourlyData
  }

  // 获取指定日期的连续分钟级统计（仅补全有数据的区间）
  function getContinuousMinuteStats(date: string): { axis: string[], data: number[] } {
    const dayData = getDayData(date)
    const minuteKeys = Object.keys(dayData.minutes)

    // 无数据时返回空
    if (minuteKeys.length === 0) {
      return { axis: [], data: [] }
    }

    // 排序分钟键，确定时间区间
    minuteKeys.sort((a, b) =>
      dayjs(`${date} ${a}`).valueOf() - dayjs(`${date} ${b}`).valueOf(),
    )
    const firstKey = minuteKeys[0]
    const lastKey = minuteKeys[minuteKeys.length - 1]

    // 解析起止时间
    const [startHour, startMinute] = firstKey.split(':').map(Number)
    const [endHour, endMinute] = lastKey.split(':').map(Number)

    // 生成连续分钟轴和对应数据
    const minuteAxis: string[] = []
    const minuteData: number[] = []

    let currentHour = startHour
    let currentMinute = startMinute

    while (true) {
      const hourStr = currentHour.toString().padStart(2, '0')
      const minuteStr = currentMinute.toString().padStart(2, '0')
      const timeKey = `${hourStr}:${minuteStr}`

      minuteAxis.push(timeKey)
      minuteData.push(dayData.minutes[timeKey]?.count || 0)

      // 终止条件：到达终点时间
      if (currentHour === endHour && currentMinute === endMinute) {
        break
      }

      // 推进到下一分钟
      currentMinute++
      if (currentMinute === 60) {
        currentMinute = 0
        currentHour++
      }
    }

    // 缓存结果
    const result = { axis: minuteAxis, data: minuteData }
    cachedMinuteStats.value[date] = result
    return result
  }

  // 获取所有数据中的最佳战绩（单日总次数最高）
  function getBestRecord() {
    const allDates = getDateList()
    if (allDates.length === 0) {
      return { date: '', total: 0 }
    }

    // 遍历所有日期，找到最高总次数
    let bestDate = allDates[0]
    let maxTotal = getDayData(bestDate).total

    allDates.forEach((date) => {
      const currentTotal = getDayData(date).total
      if (currentTotal > maxTotal) {
        maxTotal = currentTotal
        bestDate = date
      }
    })

    return { date: bestDate, total: maxTotal }
  }

  return {
    dailyData,
    init,
    recordKeyPress,
    getDayData,
    getDateList,
    getHourlyStats,
    getContinuousMinuteStats,
    getBestRecord, // 导出最佳战绩方法
  }
})
