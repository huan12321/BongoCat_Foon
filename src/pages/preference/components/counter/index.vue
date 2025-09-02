<script setup lang="ts">
import { Slider } from 'ant-design-vue'

import ProList from '@/components/pro-list/index.vue'
import ProListItem from '@/components/pro-list-item/index.vue'
import { useCatStore } from '@/stores/cat'

const catStore = useCatStore()
</script>

<template>
  <ProList title="计数器">
    <ProListItem
      title="字体颜色"
      vertical
    >
      <div class="flex items-center gap-2">
        <span>R: </span>
        <Slider
          v-model:value="catStore.counterColorR"
          class="flex-1 m-0!"
          :max="255"
          :min="0"
          :tip-formatter="(value) => `${value}`"
        />
      </div>
      <div class="flex items-center gap-2">
        <span>G: </span>
        <Slider
          v-model:value="catStore.counterColorG"
          class="flex-1 m-0!"
          :max="255"
          :min="0"
          :tip-formatter="(value) => `${value}`"
        />
      </div>
      <div class="flex items-center gap-2">
        <span>B: </span>
        <Slider
          v-model:value="catStore.counterColorB"
          class="flex-1 m-0!"
          :max="255"
          :min="0"
          :tip-formatter="(value) => `${value}`"
        />
      </div>
    </ProListItem>
    <ProListItem
      title="字体大小"
      vertical
    >
      <Slider
        v-model:value="catStore.counterSize"
        class="flex-1 m-0!"
        :max="100"
        :min="1"
        :tip-formatter="(value) => `${value}px`"
      />
    </ProListItem>
  </ProList>
</template>
