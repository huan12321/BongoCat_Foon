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
  bottom: 20px;
  right: 20px;
  /* 移除可能导致裁剪的属性 */
  overflow: visible; /* 确保内容不被裁剪 */
  min-width: 120px; /* 设置最小宽度，确保数字和按钮都能显示 */
  width: auto; /* 自动宽度自适应宽度 */

  /* 其他样式式保持不变 */
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  gap: 15px;
  align-items: center;
  z-index: 9999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.count {
  /* 增加数字区域的宽度适应能力 */
  white-space: nowrap; /* 防止数字换行 */
  font-size: 20px;
  font-weight: bold;
  padding: 0 5px; /* 增加左右内边距 */
}

.reset-btn {
  background: #ff4d4f;
  border: none;
  color: white;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
}
</style>
