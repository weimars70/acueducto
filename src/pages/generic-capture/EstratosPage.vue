<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../services/api/client';

const TABLE_NAME = 'estratos';
const TITLE = 'Estratos';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const records = ref([]);
const editMode = ref(false);
const selectedRecord = ref(null);

// Form data for inline editing/adding
const formData = ref({
  codigo: '',
  nombre: '',
  abreviado: '',
  tabla: TABLE_NAME
});

const fetchRecords = async () => {
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
    
    const { data } = await apiClient.get(`/generic-capture/${TABLE_NAME}`);
    records.value = data;
  } catch (error) {
    console.error('Error fetching records:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 
               error.message || 
               'Error al cargar los datos'
    });
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    codigo: '',
    nombre: '',
    abreviado: '',
    tabla: TABLE_NAME
  };
  editMode.value = false;
  selectedRecord.value = null;
};

const editRecord = (record) => {
  formData.value = {
    codigo: record.codigo,
    nombre: record.nombre,
    abreviado: record.abreviado,
    tabla: TABLE_NAME
  };
  editMode.value = true;
  selectedRecord.value = record;
};

const deleteRecord = async (codigo) => {
  try {
    $q.dialog({
      title: 'Confirmar',
      message: '¿Está seguro que desea eliminar este registro?',
      cancel: true,
      persistent: true
    }).onOk(async () => {
      if (!authStore.isAuthenticated) {
        $q.notify({
          type: 'negative',
          message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
        });
        router.push('/login');
        return;
      }
      
      await apiClient.delete(`/generic-capture/${TABLE_NAME}/${codigo}`);
      
      $q.notify({
        type: 'positive',
        message: 'Registro eliminado exitosamente'
      });
      
      fetchRecords();
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 
               error.message || 
               'Error al eliminar el registro'
    });
  }
};

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
    
    if (editMode.value) {
      await apiClient.put('/generic-capture', formData.value);
      $q.notify({
        type: 'positive',
        message: 'Registro actualizado exitosamente'
      });
    } else {
      await apiClient.post('/generic-capture', formData.value);
      $q.notify({
        type: 'positive',
        message: 'Registro creado exitosamente'
      });
    }
    
    resetForm();
    fetchRecords();
  } catch (error) {
    console.error('Error saving record:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 
               error.message || 
               `Error al ${editMode.value ? 'actualizar' : 'crear'} el registro`
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRecords();
});
</script>

<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <h5 class="q-mt-none q-mb-none">{{ TITLE }}</h5>
      </div>
      
      <!-- Form Section -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">{{ editMode ? 'Editar Estrato' : 'Nuevo Estrato' }}</div>
        </q-card-section>
        
        <q-card-section>
          <q-form @submit.prevent="saveRecord" class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <q-input
                v-model="formData.codigo"
                label="Código"
                outlined
                dense
                :disable="editMode"
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
            
            <div class="col-12 col-md-3">
              <q-input
                v-model="formData.abreviado"
                label="Abreviado"
                outlined
                dense
                :rules="[val => !!val || 'Campo requerido']"
              />
            </div>
            
            <div class="col-12 col-md-2 flex items-center justify-end">
              <q-btn
                v-if="editMode"
                label="Cancelar"
                color="negative"
                flat
                class="q-mr-sm"
                @click="resetForm"
              />
              <q-btn
                :label="editMode ? 'Actualizar' : 'Guardar'"
                type="submit"
                color="primary"
                :loading="loading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
      
      <!-- Table Section -->
      <q-table
        :rows="records"
        :columns="[
          { name: 'codigo', label: 'Código', field: 'codigo', sortable: true, align: 'left' },
          { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, align: 'left' },
          { name: 'abreviado', label: 'Abreviado', field: 'abreviado', sortable: true, align: 'left' },
          { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
        ]"
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
        
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="edit"
              @click="editRecord(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              @click="deleteRecord(props.row.codigo)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
        
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-8">
            No hay registros disponibles
          </div>
        </template>
      </q-table>
    </div>
  </q-page>
</template>