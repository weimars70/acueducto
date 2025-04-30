<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: number | null
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>();

const currentYear = new Date().getFullYear();
const years = computed(() => {
  const result = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    result.push(i);
  }
  return result;
});
</script>

<template>
  <q-select
    :model-value="modelValue"
    :options="years"
    label="Año"
    outlined
    dense
    emit-value
    map-options
    clearable
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>