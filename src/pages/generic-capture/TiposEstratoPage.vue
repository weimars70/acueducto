<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { apiClient } from '../../services/api/client';

const TABLE_NAME = 'estratos_tipo';
const TITLE = 'Tipos de Estrato';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const records = ref([]);
const editMode = ref(false);
const selectedRecord = ref(null);
const viewMode = ref('table'); // 'table' or 'cards'

// Form data for inline editing/adding
const formData = ref({
  codigo: '',
  nombre: '',
  tabla: TABLE_NAME
});

const fetchRecords = async () => {
  try {
    loading.value = true;
    console.log('Fetching records for table:', TABLE_NAME);
    
    // Comentado temporalmente para pruebas
    // if (!authStore.isAuthenticated) {
    //   $q.notify({
    //     type: 'negative',
    //     message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
    //   });
    //   router.push('/login');
    //   return;
    // }
    
    const { data } = await apiClient.get(`/generic-capture/${TABLE_NAME}`);
    console.log('Records received:', data);
    records.value = data;
  } catch (error) {
    console.error('Error fetching records:', error);
    console.error('Error details:', error.response?.data || error.message);
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
    tabla: TABLE_NAME
  };
  editMode.value = false;
  selectedRecord.value = null;
};

const editRecord = (record) => {
  formData.value = {
    codigo: record.codigo,
    nombre: record.nombre,
    tabla: TABLE_NAME
  };
  editMode.value = true;
  selectedRecord.value = record;
};

const deleteRecord = async (codigo) => {
  try {
    console.log('Attempting to delete record with codigo:', codigo);
    $q.dialog({
      title: 'Confirmar',
      message: '¿Está seguro que desea eliminar este registro?',
      cancel: true,
      persistent: true
    }).onOk(async () => {
      // Comentado temporalmente para pruebas
      // if (!authStore.isAuthenticated) {
      //   $q.notify({
      //     type: 'negative',
      //     message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
      //   });
      //   router.push('/login');
      //   return;
      // }
      
      console.log('Deleting record from table:', TABLE_NAME, 'with codigo:', codigo);
      await apiClient.delete(`/generic-capture/${TABLE_NAME}/${codigo}`);
      
      $q.notify({
        type: 'positive',
        message: 'Registro eliminado exitosamente'
      });
      
      fetchRecords();
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    console.error('Error details:', error.response?.data || error.message);
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
    console.log('Saving record:', formData.value);
    
    // Comentado temporalmente para pruebas
    // if (!authStore.isAuthenticated) {
    //   $q.notify({
    //     type: 'negative',
    //     message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
    //   });
    //   router.push('/login');
    //   return;
    // }
    
    if (editMode.value) {
      console.log('Updating record with data:', formData.value);
      await apiClient.put('/generic-capture', formData.value);
      $q.notify({
        type: 'positive',
        message: 'Registro actualizado exitosamente'
      });
    } else {
      console.log('Creating new record with data:', formData.value);
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
    console.error('Error details:', error.response?.data || error.message);
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
  console.log('TiposEstratoPage montado - Iniciando carga de registros');
  console.log('Tabla a consultar:', TABLE_NAME);
  console.log('API URL:', import.meta.env.VITE_API_URL);
  console.log('Intentando conectar con el backend...');
  fetchRecords();
});
</script>

<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <h5 class="q-mt-none q-mb-none">{{ TITLE }}</h5>
        <div>
          <q-btn-toggle
            v-model="viewMode"
            flat
            toggle-color="primary"
            :options="[
              {label: 'Tabla', value: 'table', icon: 'table_view'},
              {label: 'Tarjetas', value: 'cards', icon: 'grid_view'}
            ]"
          />
        </div>
      </div>
      
      <!-- Form Section -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">{{ editMode ? 'Editar Tipo de Estrato' : 'Nuevo Tipo de Estrato' }}</div>
        </q-card-section>
        
        <q-card-section>
          <q-form @submit.prevent="saveRecord" class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.nombre"
                label="Nombre"
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
      
      <!-- Table View -->
      <q-table
        v-if="viewMode === 'table'"
        :rows="records"
        :columns="[
          { name: 'codigo', label: 'Código', field: 'codigo', sortable: true, align: 'left' },
          { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, align: 'left' },
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
      
      <!-- Cards View -->
      <div v-else class="row q-col-gutter-md">
        <div v-if="loading" class="col-12 flex justify-center q-pa-lg">
          <q-spinner size="50px" color="primary" />
        </div>
        
        <div v-else-if="records.length === 0" class="col-12 flex justify-center q-pa-lg text-grey-8">
          No hay registros disponibles
        </div>
        
        <div 
          v-for="record in records" 
          :key="record.codigo"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card class="record-card">
            <q-card-section>
              <div class="text-h6">{{ record.nombre }}</div>
              <div class="text-subtitle2">Código: {{ record.codigo }}</div>
            </q-card-section>
            
            <q-card-actions align="right">
              <q-btn
                flat
                round
                color="primary"
                icon="edit"
                @click="editRecord(record)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                @click="deleteRecord(record.codigo)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.record-card {
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}
</style>