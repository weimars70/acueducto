<script setup lang="ts">
defineProps<{
  modelValue: string;
  label: string;
  type?: string;
}>();
</script>

<template>
  <q-input
    :model-value="modelValue"
    :label="label"
    :type="type"
    outlined
    dense
    readonly
    class="readonly-field"
  />
</template>

<style lang="scss" scoped>
.readonly-field {
  :deep() {
    .q-field__native {
      color: #666;
      cursor: not-allowed;
    }
  }
}
</style>


