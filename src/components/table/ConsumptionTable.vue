<script setup lang="ts">
import { consumptionColumns } from './ConsumptionTableColumns';
import type { Consumption } from '../../types/consumption';
import type { TablePagination } from './types';
import { useRouter } from 'vue-router';

const router = useRouter();

defineProps<{
  rows: Consumption[];
  loading: boolean;
  pagination: TablePagination;
}>();

const emit = defineEmits<{
  (e: 'request', props: { pagination: TablePagination }): void;
}>();

const onPageChange = (newPage: number, pagination: TablePagination) => {
  emit('request', {
    pagination: {
      ...pagination,
      page: newPage
    }
  });
};

const handleEdit = (consumption: Consumption) => {
  router.push({
    name: 'edit-consumption',
    params: {
      id: consumption.codigo
    }
  });
};
</script>

<template>
  <div class="consumption-table-wrapper">
    <q-table
      :rows="rows"
      :columns="consumptionColumns"
      :pagination="pagination"
      :loading="loading"
      row-key="codigo"
      @request="emit('request', $event)"
      class="consumption-table"
      flat
      bordered
      binary-state-sort
      :rows-per-page-options="[5, 10, 15, 20, 25, 50]"
      rows-per-page-label="Registros por página:"
      no-data-label="No hay datos disponibles"
      loading-label="Cargando..."
      selected-rows-label="Filas seleccionadas"
      
    >
      <!-- Slot de paginación simplificado y corregido -->
      <template v-slot:pagination="scope">
        <div class="row items-center q-gutter-sm full-width">
          <!-- Selector de registros por página -->
        
          
          <!-- Información de rango calculada manualmente -->
          <div class="col-auto text-caption">
            {{ ((pagination.page - 1) * pagination.rowsPerPage) + 1 }}-{{ Math.min(pagination.page * pagination.rowsPerPage, pagination.rowsNumber) }} of {{ pagination.rowsNumber }}
          </div>
          
          <!-- Spacer -->
          <div class="col"></div>
          
          <!-- Información de página calculada manualmente -->
          <div class="col-auto text-caption q-mx-sm">
            Página {{ pagination.page }} de {{ Math.ceil(pagination.rowsNumber / pagination.rowsPerPage) }}
          </div>
          
          <!-- Botones de navegación -->
          <div class="col-auto">
            <div class="row items-center q-gutter-xs">
              <q-btn
                icon="first_page"
                color="grey-8"
                round
                dense
                flat
                :disable="pagination.page === 1"
                @click="emit('request', { pagination: { ...pagination, page: 1 } })"
              />
              
              <q-btn
                icon="chevron_left"
                color="grey-8"
                round
                dense
                flat
                :disable="pagination.page === 1"
                @click="emit('request', { pagination: { ...pagination, page: pagination.page - 1 } })"
              />
              
              <q-btn
                icon="chevron_right"
                color="grey-8"
                round
                dense
                flat
                :disable="pagination.page >= Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
                @click="emit('request', { pagination: { ...pagination, page: pagination.page + 1 } })"
              />
              
              <q-btn
                icon="last_page"
                color="grey-8"
                round
                dense
                flat
                :disable="pagination.page >= Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
                @click="emit('request', { pagination: { ...pagination, page: Math.ceil(pagination.rowsNumber / pagination.rowsPerPage) } })"
              />
            </div>
          </div>
        </div>
      </template>
    </q-table>
  </div>
</template>

<style lang="scss" scoped>
.consumption-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.consumption-table {
  :deep() {
    .q-table__container {
      background: white;
    }

    .q-table__top {
      padding: 4px;
      background: #f5f5f5;
    }

    .q-table__middle {
      max-width: 100%;
    }

    thead tr th {
      position: sticky;
      top: 0;
      z-index: 1;
      font-weight: 600;
      font-size: 10px;
      padding: 2px 4px;
      height: 32px;
      white-space: nowrap;
      background: var(--q-primary);
      transition: background-color 0.3s ease;

      &:hover {
        background: var(--q-primary-dark);
      }
    }

    tbody tr td {
      padding: 2px 4px;
      height: 32px;
      font-size: 10px;
      white-space: nowrap;

      .q-chip {
        height: 10px;
        font-size: 10px;
      }
    }

    tbody tr:nth-child(even) {
      background: #f9f9f9;
    }

    tbody tr:hover {
      background: #f5f5f5;
    }
  }
}

.pagination-controls {
  :deep() {
    .q-btn {
      padding: 2px;
      min-height: 28px;
      font-size: 9px;
    }

    .q-btn--active {
      background: var(--q-primary);
      color: white;
    }
  }
}
</style>