<script setup lang="ts">
const props = defineProps<{
  modelValue: number | null
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>();

const months = [
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 }
];
</script>

<template>
  <q-select
    :model-value="modelValue"
    :options="months"
    label="Mes"
    outlined
    dense
    emit-value
    map-options
    clearable
    option-label="label"
    option-value="value"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>