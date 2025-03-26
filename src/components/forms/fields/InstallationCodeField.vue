<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { installationService } from '../../../services/api/installation.service';
import { syncService } from '../../../services/sync/sync.service';

const emit = defineEmits<{
  (e: 'installation-found', data: any): void;
}>();

const $q = useQuasar();
const codigo = ref('');
const loading = ref(false);

const handleSearch = async () => {
  if (!codigo.value) {
    $q.notify({
      type: 'warning',
      message: 'Ingrese un código de instalación'
    });
    return;
  }
  
  loading.value = true;
  try {
    const installation = await installationService.getByCode(Number(codigo.value));
    console.log('____installation____', installation);
    if (!installation) {
      throw new Error('Instalación no encontrada');
    }

    // Asegurarse de que los valores numéricos estén presentes
    const normalizedInstallation = {
      ...installation,
      lectura_anterior: installation.lectura_anterior || 0,
      promedio: installation.promedio || 0
    };

    emit('installation-found', normalizedInstallation);
    
    if (!syncService.isOnline()) {
      $q.notify({
        type: 'warning',
        message: 'Trabajando en modo sin conexión',
        timeout: 2000
      });
    }
  } catch (error) {
    console.error('Error buscando instalación:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al buscar la instalación',
      timeout: 2000
    });
    emit('installation-found', null);
  } finally {
    loading.value = false;
  }
};

const handleInput = (value: string) => {
  // Solo permitir números y limitar a 5 dígitos
  codigo.value = value.replace(/[^\d]/g, '').slice(0, 5);
};

const handleKeyPress = async (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    await handleSearch();
  }
};

const clear = () => {
  codigo.value = '';
};

defineExpose({
  clear,
  focus: () => {
    const input = document.querySelector('input[aria-label="Código"]');
    if (input) {
      input.focus();
    }
  }
});
</script>

<template>
  <q-input
    v-model="codigo"
    label="Código"
    outlined
    dense
    :rules="[val => !!val || 'Campo requerido']"
    @keypress="handleKeyPress"
    @input="handleInput"
    :loading="loading"
  >
    <template v-slot:append>
      <q-icon 
        name="search" 
        class="cursor-pointer"
        @click="handleSearch"
      />
    </template>
  </q-input>
</template>