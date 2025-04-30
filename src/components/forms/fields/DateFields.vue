```vue
<script setup lang="ts">
import { computed } from 'vue';
import { months } from '../../../utils/dates';

const props = defineProps<{
  modelValue: {
    year: string;
    mes: string;
    fecha: string;
  }
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void
}>();

const currentYear = new Date().getFullYear();
const years = computed(() => {
  const result = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    result.push(i);
  }
  return result;
});

const updateField = (field: keyof typeof props.modelValue, value: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  });
};

const formatDate = (date: string) => {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${year}-${month}-${day}`;
};
</script>

<template>
  <div class="row q-col-gutter-sm">
    <!-- Año -->
    <div class="col-12 col-sm-4">
      <q-select
        :model-value="modelValue.year"
        :options="years"
        label="Año"
        outlined
        dense
        emit-value
        map-options
        @update:model-value="value => updateField('year', value)"
      />
    </div>

    <!-- Mes -->
    <div class="col-12 col-sm-4">
      <q-select
        :model-value="modelValue.mes"
        :options="months"
        label="Mes"
        outlined
        dense
        option-value="text"
        option-label="text"
        emit-value
        map-options
        @update:model-value="value => updateField('mes', value)"
      />
    </div>

    <!-- Fecha -->
    <div class="col-12 col-sm-4">
      <q-input
        :model-value="modelValue.fecha"
        label="Fecha"
        outlined
        dense
        readonly
        @update:model-value="value => updateField('fecha', formatDate(value))"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date
                :model-value="modelValue.fecha"
                mask="YYYY-MM-DD"
                @update:model-value="value => updateField('fecha', value)"
              />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.row {
  margin: 0 -4px;
  > div {
    padding: 0 4px;
  }
}
</style>
```