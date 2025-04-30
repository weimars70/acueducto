<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>();

const handleInput = (value: string | null) => {
  // Si el valor es null o undefined, emitir string vacío
  if (value === null || value === undefined) {
    emit('update:modelValue', '');
    return;
  }

  // Solo permitir letras, espacios y caracteres especiales (á,é,í,ó,ú,ñ)
  const lettersOnly = value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, '');
  
  // Limitar a 30 caracteres
  const finalValue = lettersOnly.length > 30 ? lettersOnly.slice(0, 30) : lettersOnly;
  
  emit('update:modelValue', finalValue);
};
</script>

<template>
  <q-input
    :model-value="modelValue"
    label="Buscar por nombre"
    outlined
    dense
    clearable
    maxlength="30"
    style="width: 200px"
    @update:model-value="handleInput"
  >
    <template v-slot:append>
      <q-icon name="search" />
    </template>
  </q-input>
</template>