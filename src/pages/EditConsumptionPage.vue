<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { consumptionService } from '../services/api/consumption.service';
import NewConsumptionForm from '../components/forms/NewConsumptionForm.vue';
import { getTextFromMesCodigo } from '../types/consumption';
import { getCurrentDate } from '../utils/dates';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const loading = ref(true);
const formRef = ref(null);
const consumptionData = ref(null);

const setFormData = async () => {
  await nextTick();
  
  if (!formRef.value) {
    return;
  }

  if (!consumptionData.value) {
    return;
  }

  const consumption = consumptionData.value;

  try {
    const formattedData = {
      codigo: consumption.instalacion.toString(),
      mes: getTextFromMesCodigo(consumption.mes_codigo),
      year: consumption.year.toString(),
      fecha: consumption.fecha || getCurrentDate(),
      medidor: consumption.medidor || '',
      cliente: consumption.nombre || '',
      sector: consumption.sector || '',
      direccion: consumption.direccion || '',
      lectura_anterior: consumption.lectura_anterior?.toString() || '0',
      lectura_actual: consumption.lectura?.toString() || '',
      consumo: consumption.consumo?.toString() || '0',
      promedio: consumption.promedio?.toString() || '0',
      otros_cobros: consumption.otros_cobros?.toString() || '0',
      reconexion: consumption.reconexion?.toString() || '0'
    };

    formRef.value.setFormData(formattedData);

    const installationData = {
      codigo: consumption.instalacion,
      codigo_medidor: consumption.medidor,
      nombre: consumption.nombre,
      sector_nombre: consumption.sector,
      direccion: consumption.direccion,
      lectura_anterior: Number(consumption.lectura_anterior) || 0,
      promedio: Number(consumption.promedio) || 0
    };

    formRef.value.onInstallationFound(installationData);
  } catch (error) {
    console.error('Error al configurar datos del formulario:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los datos en el formulario'
    });
  }
};

const handleFormMounted = async () => {
  await setFormData();
};

onMounted(async () => {
  try {
    const id = route.params.id;
    if (!id) {
      throw new Error('ID no proporcionado');
    }

    loading.value = true;
    const consumption = await consumptionService.getById(Number(id));

    if (!consumption) {
      throw new Error('No se encontraron datos del consumo');
    }

    consumptionData.value = consumption;
    await handleFormMounted();

  } catch (error) {
    console.error('Error al cargar el consumo:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al cargar los datos del consumo'
    });
    router.push('/consumptions');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <q-page padding>
    <div class="text-h6 q-mb-md">Editar Consumo</div>
    
    <template v-if="loading">
      <div class="flex flex-center q-pa-md">
        <q-spinner color="primary" size="3em" />
      </div>
    </template>
    
    <template v-else>
      <NewConsumptionForm
        ref="formRef"
        mode="edit"
        @mounted="handleFormMounted"
      />
    </template>
  </q-page>
</template>