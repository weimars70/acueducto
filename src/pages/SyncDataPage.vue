<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { storageService } from '../services/database/storage.service';
import type { Installation } from '../types/installation';
import type { Consumption } from '../types/consumption';

const $q = useQuasar();
const activeTab = ref('installations');
const installations = ref<Installation[]>([]);
const consumptions = ref<Consumption[]>([]);
const loading = ref(false);

const loadData = async () => {
  try {
    loading.value = true;
    installations.value = await storageService.getInstallations();
    consumptions.value = await storageService.getConsumptions();
  } catch (error) {
    console.error('Error loading data:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los datos sincronizados'
    });
  } finally {
    loading.value = false;
  }
};

const installationColumns = [
  { name: 'codigo', label: 'Código', field: 'codigo', sortable: true },
  { name: 'codigo_medidor', label: 'Medidor', field: 'codigo_medidor', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true },
  { name: 'sector_nombre', label: 'Sector', field: 'sector_nombre', sortable: true },
  { name: 'direccion', label: 'Dirección', field: 'direccion', sortable: true },
  { name: 'promedio', label: 'Promedio', field: 'promedio', sortable: true },
  { name: 'lectura_anterior', label: 'Última Lectura', field: 'lectura_anterior', sortable: true }
];

const consumptionColumns = [
  { name: 'codigo', label: 'Código', field: 'codigo', sortable: true },
  { name: 'instalacion', label: 'Instalación', field: 'instalacion', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true },
  { name: 'lectura', label: 'Lectura', field: 'lectura', sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', sortable: true },
  { name: 'consumo', label: 'Consumo', field: 'consumo', sortable: true },
  { name: 'mes', label: 'Mes', field: 'mes', sortable: true },
  { name: 'year', label: 'Año', field: 'year', sortable: true }
];

onMounted(() => {
  loadData();
});
</script>

<template>
  <q-page padding>
    <div class="q-pa-md">
      <h5 class="q-mt-none q-mb-md">Datos Sincronizados</h5>
      
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="installations" label="Instalaciones" />
        <q-tab name="consumptions" label="Consumos" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="installations">
          <q-table
            :rows="installations"
            :columns="installationColumns"
            row-key="codigo"
            :loading="loading"
            flat
            bordered
          >
            <template v-slot:loading>
              <q-inner-loading showing color="primary">
                <q-spinner size="50px" color="primary" />
              </q-inner-loading>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="consumptions">
          <q-table
            :rows="consumptions"
            :columns="consumptionColumns"
            row-key="codigo"
            :loading="loading"
            flat
            bordered
          >
            <template v-slot:loading>
              <q-inner-loading showing color="primary">
                <q-spinner size="50px" color="primary" />
              </q-inner-loading>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>