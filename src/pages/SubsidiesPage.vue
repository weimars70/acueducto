<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { months } from '../utils/dates';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const formData = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1
});

// Get last 5 years in descending order
const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
});

const generatePdf = async () => {
  if (!authStore.isAuthenticated) {
    $q.notify({
      type: 'negative',
      message: 'No está autenticado'
    });
    router.push('/login');
    return;
  }

  try {
    loading.value = true;
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/pdf/subsidios?mes=${formData.value.month}&year=${formData.value.year}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Accept': 'application/pdf'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        authStore.logout();
        router.push('/login');
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al generar el PDF');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/pdf')) {
      throw new Error('La respuesta del servidor no es un PDF válido');
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('El PDF generado está vacío');
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subsidios-${formData.value.year}-${formData.value.month}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    $q.notify({
      type: 'positive',
      message: 'PDF generado exitosamente'
    });
  } catch (error) {
    console.error('Error al generar PDF:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al generar el PDF',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <q-page padding>
    <div class="row q-pa-md">
      <div class="col-12">
        <h5 class="q-mt-none q-mb-md">Generar Reporte de Subsidios</h5>
        
        <div class="row q-col-gutter-md" style="max-width: 500px">
          <div class="col-12 col-sm-6">
            <q-select
              v-model="formData.year"
              :options="years"
              label="Año"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          
          <div class="col-12 col-sm-6">
            <q-select
              v-model="formData.month"
              :options="months"
              label="Mes"
              outlined
              dense
              option-value="value"
              option-label="text"
              emit-value
              map-options
            />
          </div>
          
          <div class="col-12">
            <q-btn
              color="primary"
              label="Generar PDF"
              :loading="loading"
              @click="generatePdf"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>