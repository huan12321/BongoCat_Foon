// src/stores/counter.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const keyPressCount = ref(0)

  const increment = () => {
    keyPressCount.value++
  }

  const reset = () => {
    keyPressCount.value = 0
  }

  return {
    keyPressCount,
    increment,
    reset,
  }
})
