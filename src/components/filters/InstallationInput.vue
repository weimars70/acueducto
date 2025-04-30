<script setup lang="ts">
const props = defineProps<{
  modelValue: number | null
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>();

const handleInput = (value: string | null) => {
  if (!value) {
    emit('update:modelValue', null);
    return;
  }

  // Solo permitir números y limitar a 5 dígitos
  const numericValue = value.replace(/[^\d]/g, '').slice(0, 5);
  const numValue = numericValue ? Number(numericValue) : null;
  emit('update:modelValue', numValue);
};
</script>

<template>
  <q-input
    :model-value="modelValue?.toString()"
    type="text"
    label="Instalación"
    outlined
    dense
    clearable
    maxlength="5"
    style="width: 130px"
    @update:model-value="handleInput"
  >
    <template v-slot:append>
      <q-icon name="home" />
    </template>
  </q-input>
</template>