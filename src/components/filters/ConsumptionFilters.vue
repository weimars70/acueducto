<script setup lang="ts">
import { ref } from 'vue';
import YearSelect from './YearSelect.vue';
import MonthSelect from './MonthSelect.vue';
import SearchInput from './SearchInput.vue';
import InstallationInput from './InstallationInput.vue';

const filters = ref({
  year: null as number | null,
  mes_codigo: null as number | null,
  nombre: '' as string,
  instalacion: null as number | null
});

const emit = defineEmits<{
  (e: 'filter', filters: typeof filters.value): void
}>();

const applyFilters = () => {
  emit('filter', filters.value);
};

const clearFilters = () => {
  filters.value = {
    year: null,
    mes_codigo: null,
    nombre: '',
    instalacion: null
  };
  emit('filter', filters.value);
};
</script>

<template>
  <div class="row items-center q-gutter-x-sm">
    <YearSelect v-model="filters.year" class="year-select" />
    <MonthSelect v-model="filters.mes_codigo" class="month-select" />
    <SearchInput v-model="filters.nombre" />
    <InstallationInput v-model="filters.instalacion" />
    <div class="filter-actions">
      <q-btn
        flat
        dense
        color="negative"
        icon="close"
        @click="clearFilters"
      />
      <q-btn
        dense
        unelevated
        color="primary"
        icon="filter_alt"
        label="Filtrar"
        @click="applyFilters"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.year-select {
  width: 100px;
}

.month-select {
  width: 130px;
}

.filter-actions {
  display: flex;
  gap: 2px;
  margin-left: 2px;
  
  .q-btn {
    min-height: 20px;
  }
}
</style>