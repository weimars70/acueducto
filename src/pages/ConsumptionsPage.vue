<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { io } from 'socket.io-client';
import { consumptionService } from '../services/api';
import { exportToExcel } from '../utils/export';
import { useScreenSize } from '../composables/useScreenSize';
import ViewToggle from '../components/ViewToggle.vue';
import ConsumptionGrid from '../components/ConsumptionGrid.vue';
import ConsumptionTable from '../components/table/ConsumptionTable.vue';
import ConsumptionFilters from '../components/filters/ConsumptionFilters.vue';
import type { Consumption } from '../types/consumption';

const $q = useQuasar();
const router = useRouter();
const { isMobile } = useScreenSize();
const view = ref<'grid' | 'list'>(isMobile.value ? 'grid' : 'list');
const consumptions = ref<Consumption[]>([]);
const loading = ref(true);
const currentFilters = ref({});
const socket = ref<any>(null);
const pagination = ref({
  sortBy: 'codigo',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

watch(isMobile, (newValue) => {
  view.value = newValue ? 'grid' : 'list';
});

const loadData = async () => {
  try {
    loading.value = true;
    const response = await consumptionService.getConsumptions({
      ...currentFilters.value,
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage
    });
    
    consumptions.value = response.data;
    pagination.value.rowsNumber = response.total;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al cargar los datos';
    console.error('Error al cargar datos:', errorMessage);
    $q.notify({
      type: 'negative',
      message: errorMessage
    });
  } finally {
    loading.value = false;
  }
};

const handleExport = () => {
  try {
    exportToExcel(consumptions.value);
    $q.notify({
      type: 'positive',
      message: 'Exportación exitosa'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al exportar';
    console.error('Error en exportación:', errorMessage);
    $q.notify({
      type: 'negative',
      message: errorMessage
    });
  }
};

const handleNewRecord = () => {
  router.push('/consumptions/new');
};

const handleFilter = async (filters: any) => {
  currentFilters.value = filters;
  pagination.value.page = 1;
  await loadData();
};

const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending };
  await loadData();
};

const setupSocketConnection = () => {
  socket.value = io('http://108.181.193.178:3007', {
    transports: ['websocket'],
    autoConnect: true
  });

  socket.value.on('connect', () => {
    console.log('Conectado al servidor de Socket.IO');
  });

  socket.value.on('consumo_update', (data: any) => {
    console.log('Actualización de consumo recibida:', data);
    if (data.type === 'consumo_update' && data.operation === 'INSERT') {
      // Agregar el nuevo consumo al inicio de la lista
      consumptions.value.unshift(data.record);
      
      // Actualizar el contador total
      pagination.value.rowsNumber += 1;
      
      $q.notify({
        type: 'positive',
        message: 'Nuevo consumo registrado',
        position: 'top'
      });
    }
  });

  socket.value.on('disconnect', () => {
    console.log('Desconectado del servidor de Socket.IO');
  });

  socket.value.on('error', (error: any) => {
    console.error('Error de Socket.IO:', error);
  });
};

onMounted(() => {
  setupSocketConnection();
  loadData();
});

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect();
  }
});
</script>

<template>
  <q-page padding>
    <div class="consumption-page q-pa-md">
      <div class="page-header q-mb-md">
        <div class="row items-center no-wrap">
          <div class="col">
            <ConsumptionFilters @filter="handleFilter" />
          </div>
          <div class="col-auto actions-wrapper q-ml-sm">
            <div class="row items-center no-wrap q-gutter-x-xs">
              <ViewToggle v-model="view" />
              <q-btn
                color="primary"
                :icon-right="isMobile ? undefined : 'download'"
                :icon="isMobile ? 'download' : undefined"
                :label="isMobile ? undefined : 'Exportar'"
                dense
                @click="handleExport"
              />
              <q-btn
                color="primary"
                :icon-right="isMobile ? undefined : 'add'"
                :icon="isMobile ? 'add' : undefined"
                :label="isMobile ? undefined : 'Nuevo'"
                dense
                @click="handleNewRecord"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="content-section">
        <template v-if="view === 'list'">
          <ConsumptionTable
            :rows="consumptions"
            :loading="loading"
            :pagination="pagination"
            @request="onRequest"
          />
        </template>
        <template v-else>
          <div class="grid-container">
            <ConsumptionGrid :items="consumptions" />
            
            <div class="row justify-center q-mt-md">
              <q-pagination
                v-model="pagination.page"
                :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
                :max-pages="6"
                boundary-links
                direction-links
                color="primary"
                @update:model-value="page => onRequest({ pagination: { ...pagination, page } })"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.consumption-page {
  .page-header .row {
    flex-wrap: nowrap;
  }

  .actions-wrapper {
    white-space: nowrap;
  }

  .q-btn {
    min-width: unset;
  }

  .grid-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (max-width: 599px) {
    .page-header .row {
      flex-wrap: wrap;
      row-gap: 8px;
      
      .col {
        width: 100%;
      }
      
      .actions-wrapper {
        width: 100%;
        justify-content: flex-end;
        display: flex;
      }
    }
  }
}
</style>