<!-- src/pages/main/components/CounterDisplay.vue (新增组件) -->
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const counterStore = useCounterStore()
</script>

<template>
  <div class="counter-container">
    <span class="count">{{ counterStore.keyPressCount }}</span>
  </div>
</template>

<style scoped>
.counter-container {
  position: absolute;
  top: 20px;
  left: 20px;
  overflow: visible;
  width: auto;

  /* 移除背景色和相关样式 */
  color: #333333; /* 使用深色文本提高可读性 */
  padding: 12px 16px;
  gap: 15px;
  align-items: center;
  z-index: 9999;
}

.count {
  white-space: nowrap;
  font-size: 24px; /* 稍微增大字体 */
  font-weight: bold;
  padding: 0 5px;

  /* 使用跨平台兼容的可爱风格字体 */
  font-family: 'Comic Sans MS', 'Marker Felt', sans-serif;
}
</style>
