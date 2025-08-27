<template>
  <q-page>
    <div class="q-pa-sm">
      <div class="row items-center q-col-gutter-xs filters-container" :class="{ 'mobile-filters': isMobile }">
        <!-- Primera fila en móvil: Mes, Año, Registrada -->
        <div :class="isMobile ? 'col-4' : 'col-auto'">
          <q-select
            v-model="filters.month"
            :options="months"
            label="Mes"
            outlined
            dense
            class="filter-field"
            option-value="value"
            option-label="text"
            emit-value
            map-options
            :style="isMobile ? undefined : 'width: 150px'"
          >
            <template v-slot:prepend>
              <q-icon name="event" color="primary" size="xs" />
            </template>
          </q-select>
        </div>
        
        <div :class="isMobile ? 'col-4' : 'col-auto'">
          <q-select
            v-model="filters.year"
            :options="years"
            label="Año"
            outlined
            dense
            class="filter-field"
            :style="isMobile ? undefined : 'width: 120px'"
          >
            <template v-slot:prepend>
              <q-icon name="calendar_today" color="primary" size="xs" />
            </template>
          </q-select>
        </div>

        <div :class="isMobile ? 'col-4' : 'col-auto'">
          <q-select
            v-model="filters.registrada"
            :options="estadoOptions"
            label="Registrada"
            outlined
            dense
            class="filter-field"
            emit-value
            map-options
            :style="isMobile ? undefined : 'width: 150px'"
          >
            <template v-slot:prepend>
              <q-icon name="check_circle" color="primary" size="xs" />
            </template>
          </q-select>
        </div>

        <!-- Segunda fila en móvil: Nombre (70%) e Instalación (30%) -->
        <div :class="isMobile ? 'col-8' : 'col-auto'">
          <q-input
            v-model="filters.nombre"
            label="Nombre"
            outlined
            dense
            class="filter-field"
            :style="isMobile ? undefined : 'width: 200px'"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" size="xs" />
            </template>
          </q-input>
        </div>

        <div :class="isMobile ? 'col-4' : 'col-auto'">
          <q-input
            v-model="filters.instalacion"
            label="Instalación"
            outlined
            dense
            class="filter-field"
            :style="isMobile ? undefined : 'width: 120px'"
          >
            <template v-slot:prepend>
              <q-icon name="home" color="primary" size="xs" />
            </template>
          </q-input>
        </div>

        <!-- Tercera fila en móvil: Botones de acción -->
        <div :class="isMobile ? 'col-12 flex justify-end q-mt-xs' : 'col-auto'">
          <div class="row items-center q-gutter-x-xs">
            <ViewToggle v-model="view" />
            <q-btn
              flat
              round
              dense
              color="grey-6"
              icon="clear"
              @click="clearFilters"
            >
              <q-tooltip>Limpiar filtros</q-tooltip>
            </q-btn>
            <q-btn
              color="primary"
              icon="search"
              :label="isMobile ? undefined : 'Buscar'"
              :loading="loading"
              @click="fetchReadings"
              size="sm"
            />
          </div>
        </div>
      </div>

      <!-- Grid View -->
      <template v-if="view === 'grid'">
        <div class="row q-col-gutter-sm q-mt-xs">
          <div v-for="reading in filteredReadings" :key="reading.instalacion" class="col-12 col-sm-6 col-md-4">
            <q-card flat bordered class="reading-card">
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-subtitle2">{{ reading.nombre }}</div>
                    <div class="text-caption">Instalación: {{ reading.instalacion }}</div>
                  </div>
                  <div class="col-auto">
                    <q-chip
                      :color="reading.registrada === 'SI' ? 'positive' : 'warning'"
                      text-color="white"
                      size="sm"
                      dense
                    >
                      {{ reading.registrada }}
                    </q-chip>
                  </div>
                </div>
                <div class="text-caption q-mt-sm">
                  <div class="row q-col-gutter-sm">
                    <div class="col-12">
                      <q-icon name="location_on" size="xs" class="q-mr-xs" />
                      Sector: {{ reading.sector }}
                    </div>
                    <div class="col-12">
                      <q-icon name="speed" size="xs" class="q-mr-xs" />
                      Lectura: {{ reading.lectura || 'No registrada' }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </template>

      <!-- Table View -->
      <template v-else>
        <q-table
          :rows="filteredReadings"
          :columns="columns"
          row-key="instalacion"
          :loading="loading"
          :pagination="{
            rowsPerPage: 10
          }"
            rows-per-page-label="Registros por página:"
      no-data-label="No hay datos disponibles"
      loading-label="Cargando..."
          flat
          bordered
          class="readings-table q-mt-xs"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                style="font-size: 11px; padding: 4px 8px; height: 32px;"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                style="font-size: 9px; padding: 2px 8px; height: 28px;"
              >
                <template v-if="col.name === 'registrada'">
                  <q-chip
                    :color="props.row.registrada === 'SI' ? 'positive' : 'warning'"
                    text-color="white"
                    size="sm"
                    dense
                    class="status-chip"
                  >
                    {{ props.row.registrada }}
                  </q-chip>
                </template>
                <template v-else>
                  {{ props.row[col.name] }}
                </template>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { apiClient } from '../services/api/client';
import { months } from '../utils/dates';
import { useScreenSize } from '../composables/useScreenSize';
import ViewToggle from '../components/ViewToggle.vue';

const $q = useQuasar();
const { isMobile } = useScreenSize();
const loading = ref(false);
const readings = ref([]);
const view = ref<'grid' | 'list'>(isMobile.value ? 'grid' : 'list');

// Watch para cambiar la vista cuando cambia el tamaño de pantalla
watch(isMobile, (newValue) => {
  view.value = newValue ? 'grid' : 'list';
});

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

const filters = ref({
  month: new Date().getMonth() + 1,
  year: currentYear,
  instalacion: '',
  nombre: '',
  registrada: null
});

const columns = [
  { name: 'instalacion', label: 'Instalación', field: 'instalacion', sortable: true, align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, align: 'left' },
  { name: 'sector', label: 'Sector', field: 'sector', sortable: true, align: 'left' },
  { name: 'lectura', label: 'Lectura', field: 'lectura', sortable: true, align: 'right' },
  { name: 'registrada', label: 'Registrada', field: 'registrada', sortable: true, align: 'center' }
];

const estadoOptions = [
  { label: 'Todos', value: null },
  { label: 'SI', value: 'SI' },
  { label: 'NO', value: 'NO' }
];

const filteredReadings = computed(() => {
  return readings.value.filter(reading => {
    const matchesInstalacion = !filters.value.instalacion || 
      reading.instalacion.toString().includes(filters.value.instalacion);
    
    const matchesNombre = !filters.value.nombre || 
      reading.nombre.toLowerCase().includes(filters.value.nombre.toLowerCase());
    
    const matchesRegistrada = !filters.value.registrada || 
      reading.registrada === filters.value.registrada;
    
    return matchesInstalacion && matchesNombre && matchesRegistrada;
  });
});

const fetchReadings = async () => {
  try {
    loading.value = true;
    const { data } = await apiClient.get('/consumo/last-lecturas', {
      params: {
        month: filters.value.month,
        year: filters.value.year
      }
    });
    readings.value = data;
  } catch (error) {
    console.error('Error fetching readings:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las lecturas'
    });
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  filters.value.instalacion = '';
  filters.value.nombre = '';
  filters.value.registrada = null;
};
</script>

<style lang="scss">
.filters-container {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 4px;
  margin-bottom: 4px;

  &.mobile-filters {
    .filter-field {
      width: 100%;
    }
  }
}

.filter-field {
  .q-field__control {
    height: 32px;
    padding: 0 8px;
  }

  .q-field__marginal {
    height: 32px;
  }

  .q-field__label {
    font-size: 11px;
    top: 6px;
  }

  .q-field__native {
    padding: 0;
    font-size: 11px;
  }
}

.readings-table {
  .q-table__top {
    padding: 4px;
  }

  thead tr th {
    background: #f8f9fa;
  }

  .status-chip {
    min-height: 16px;
    font-size: 9px;
    padding: 0 4px;
  }

  tbody tr:hover {
    background: #f5f5f5;
  }
}

.reading-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px 0 rgba(0,0,0,.1);
  }
}
</style>