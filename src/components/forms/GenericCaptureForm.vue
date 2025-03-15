<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../services/api/client';

const props = defineProps<{
  tableName: string;
  title: string;
  editMode?: boolean;
  initialData?: {
    codigo: string;
    nombre: string;
    abreviado: string;
  };
}>();

const emit = defineEmits<{
  (e: 'saved'): void;
  (e: 'cancelled'): void;
}>();

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

const formData = ref({
  codigo: '',
  nombre: '',
  abreviado: '',
  tabla: props.tableName
});

onMounted(() => {
  if (props.initialData) {
    formData.value = {
      ...formData.value,
      codigo: props.initialData.codigo,
      nombre: props.initialData.nombre,
      abreviado: props.initialData.abreviado
    };
  }
});

const saveRecord = async () => {
  try {
    loading.value = true;
    
    if (!authStore.isAuthenticated) {
      $q.notify({
        type: 'negative',
        message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
      });
      router.push('/login');
      return;
    }
    
    // Use the apiClient instead of fetch for consistent error handling
    if (props.editMode) {
      await apiClient.put('/generic-capture', formData.value);
    } else {
      await apiClient.post('/generic-capture', formData.value);
    }
    
    $q.notify({
      type: 'positive',
      message: `Registro ${props.editMode ? 'actualizado' : 'creado'} exitosamente`
    });
    
    emit('saved');
    
    if (!props.editMode) {
      // Reset form if not in edit mode
      formData.value = {
        codigo: '',
        nombre: '',
        abreviado: '',
        tabla: props.tableName
      };
    }
  } catch (error) {
    console.error('Error saving record:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 
               error.message || 
               `Error al ${props.editMode ? 'actualizar' : 'crear'} el registro`
    });
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  emit('cancelled');
};
</script>

<template>
  <div class="q-pa-md">
    <h5 class="q-mt-none q-mb-md">{{ title }}</h5>
    
    <q-form @submit.prevent="saveRecord" class="q-gutter-md">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-input
            v-model="formData.codigo"
            label="Código"
            outlined
            dense
            :disable="props.editMode"
            :rules="[val => !!val || 'Campo requerido']"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            v-model="formData.nombre"
            label="Nombre"
            outlined
            dense
            :rules="[val => !!val || 'Campo requerido']"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            v-model="formData.abreviado"
            label="Abreviado"
            outlined
            dense
            :rules="[val => !!val || 'Campo requerido']"
          />
        </div>
      </div>
      
      <div class="row justify-end q-mt-md">
        <q-btn
          label="Cancelar"
          color="negative"
          flat
          class="q-mr-sm"
          @click="cancel"
        />
        <q-btn
          :label="props.editMode ? 'Actualizar' : 'Guardar'"
          type="submit"
          color="primary"
          :loading="loading"
        />
      </div>
    </q-form>
  </div>
</template>