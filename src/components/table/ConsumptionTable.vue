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
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            class="bg-primary text-white"
          >
            {{ col.label }}
          </q-th>
          <q-th class="bg-primary text-white">
            Acciones
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <template v-if="col.name === 'facturado'">
              <q-chip
                :color="props.row.facturado ? 'positive' : 'warning'"
                text-color="white"
                size="sm"
                dense
              >
                {{ props.row.facturado ? 'Facturado' : 'Pendiente' }}
              </q-chip>
            </template>
            <template v-else>
              {{ props.row[col.field] }}
            </template>
          </q-td>
          <q-td>
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="edit"
              @click="handleEdit(props.row)"
            >
              <q-tooltip>
                Editar consumo
              </q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:loading>
        <q-inner-loading showing color="primary">
          <q-spinner size="50px" color="primary" />
        </q-inner-loading>
      </template>

      <template v-slot:pagination="props">
        <q-pagination
          v-model="props.pagination.page"
          :max="Math.ceil(props.pagination.rowsNumber / props.pagination.rowsPerPage)"
          :max-pages="6"
          boundary-links
          direction-links
          color="primary"
          class="q-mt-sm pagination-controls"
          @update:model-value="page => onPageChange(page, props.pagination)"
        />
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