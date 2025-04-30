<script setup lang="ts">
const props = defineProps<{
  modelValue: 'grid' | 'list'
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'grid' | 'list'): void
}>();
</script>

<template>
  <div class="q-gutter-sm">
    <q-btn-toggle
      :model-value="modelValue"
      flat
      toggle-color="primary"
      :options="[
        { value: 'grid', slot: 'grid' },
        { value: 'list', slot: 'list' }
      ]"
      @update:model-value="value => emit('update:modelValue', value)"
    >
      <template v-slot:grid>
        <q-icon name="grid_view" />
      </template>
      <template v-slot:list>
        <q-icon name="list" />
      </template>
    </q-btn-toggle>
  </div>
</template>