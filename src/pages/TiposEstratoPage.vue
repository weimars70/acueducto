<template>
  <q-page class="q-pa-md">
    <!-- Header con título y botones -->
    <div class="row items-center justify-between q-mb-md">
      <div class="col">
        <h4 class="q-ma-none text-weight-bold">Tipos de Estrato</h4>
        <p class="text-grey-6 q-ma-none">Gestión de tipos de estratos del sistema</p>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo Tipo"
          @click="openCreateDialog"
          class="q-mr-sm"
        />
        <q-btn
          :color="viewMode === 'grid' ? 'primary' : 'grey-5'"
          :icon="viewMode === 'grid' ? 'grid_view' : 'grid_on'"
          @click="toggleViewMode"
          flat
          round
        />
      </div>
    </div>

    <!-- Barra de búsqueda y filtros -->
    <q-card class="q-mb-md">
      <q-card-section class="q-py-sm">
        <div class="row q-gutter-md items-center">
          <div class="col-md-4 col-sm-6 col-xs-12">
            <q-input
              v-model="searchText"
              placeholder="Buscar por código o nombre..."
              outlined
              dense
              clearable
              @input="filterData"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-auto">
            <q-btn
              color="primary"
              icon="refresh"
              label="Actualizar"
              @click="fetchData"
              :loading="loading"
              outline
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Vista Grid (Tabla) -->
    <q-card v-if="viewMode === 'grid'">
      <q-table
        :rows="filteredData"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        @request="onRequest"
        binary-state-sort
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              color="primary"
              icon="edit"
              size="sm"
              flat
              round
              @click="editItem(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              color="negative"
              icon="delete"
              size="sm"
              flat
              round
              @click="deleteItem(props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Vista Tarjetas -->
    <div v-else class="row q-gutter-md">
      <div
        v-for="item in filteredData"
        :key="item.id"
        class="col-xl-3 col-lg-4 col-md-6 col-sm-12"
      >
        <q-card class="cursor-pointer hover-card" @click="editItem(item)">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-h6 text-primary">{{ item.codigo }}</div>
              <q-btn-dropdown
                color="grey-7"
                dropdown-icon="more_vert"
                flat
                round
                dense
                @click.stop
              >
                <q-list>
                  <q-item clickable v-close-popup @click="editItem(item)">
                    <q-item-section avatar>
                      <q-icon name="edit" color="primary" />
                    </q-item-section>
                    <q-item-section>Editar</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="deleteItem(item)">
                    <q-item-section avatar>
                      <q-icon name="delete" color="negative" />
                    </q-item-section>
                    <q-item-section>Eliminar</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
            <div class="text-subtitle2 q-mt-sm">{{ item.nombre }}</div>
            <div class="text-caption text-grey-6 q-mt-xs">
              ID: {{ item.id }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog para crear/editar -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ editingItem ? 'Editar Tipo de Estrato' : 'Nuevo Tipo de Estrato' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveItem" class="q-gutter-md">
            <q-input
              v-model="formData.codigo"
              label="Código *"
              outlined
              :rules="[val => !!val || 'El código es requerido']"
              maxlength="10"
            />
            
            <q-input
              v-model="formData.nombre"
              label="Nombre *"
              outlined
              :rules="[val => !!val || 'El nombre es requerido']"
              maxlength="100"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="closeDialog" />
          <q-btn
            color="primary"
            label="Guardar"
            @click="saveItem"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';

interface TipoEstrato {
  id?: number;
  codigo: string;
  nombre: string;
}

const $q = useQuasar();

// Estados reactivos
const data = ref<TipoEstrato[]>([]);
const loading = ref(false);
const saving = ref(false);
const searchText = ref('');
const viewMode = ref<'grid' | 'cards'>('grid');
const showDialog = ref(false);
const editingItem = ref<TipoEstrato | null>(null);

// Formulario
const formData = ref<TipoEstrato>({
  codigo: '',
  nombre: ''
});

// Configuración de la tabla
const columns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    sortable: true,
    align: 'left' as const
  },
  {
    name: 'codigo',
    label: 'Código',
    field: 'codigo',
    sortable: true,
    align: 'left' as const
  },
  {
    name: 'nombre',
    label: 'Nombre',
    field: 'nombre',
    sortable: true,
    align: 'left' as const
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    sortable: false,
    align: 'center' as const
  }
];

const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10
});

// Datos filtrados
const filteredData = computed(() => {
  if (!searchText.value) return data.value;
  
  const search = searchText.value.toLowerCase();
  return data.value.filter(item => 
    item.codigo.toLowerCase().includes(search) ||
    item.nombre.toLowerCase().includes(search)
  );
});

// Métodos
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/estratos-tipo');
    data.value = response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los datos'
    });
  } finally {
    loading.value = false;
  }
};

const filterData = () => {
  // La filtración se maneja automáticamente con el computed
};

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'cards' : 'grid';
};

const openCreateDialog = () => {
  editingItem.value = null;
  formData.value = {
    codigo: '',
    nombre: ''
  };
  showDialog.value = true;
};

const editItem = (item: TipoEstrato) => {
  editingItem.value = item;
  formData.value = { ...item };
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
  editingItem.value = null;
  formData.value = {
    codigo: '',
    nombre: ''
  };
};

const saveItem = async () => {
  if (!formData.value.codigo || !formData.value.nombre) {
    $q.notify({
      type: 'negative',
      message: 'Por favor complete todos los campos requeridos'
    });
    return;
  }

  saving.value = true;
  try {
    if (editingItem.value) {
      // Actualizar
      await axios.put(`/api/estratos-tipo/${editingItem.value.id}`, formData.value);
      $q.notify({
        type: 'positive',
        message: 'Tipo de estrato actualizado correctamente'
      });
    } else {
      // Crear
      await axios.post('/api/estratos-tipo', formData.value);
      $q.notify({
        type: 'positive',
        message: 'Tipo de estrato creado correctamente'
      });
    }
    
    closeDialog();
    await fetchData();
  } catch (error) {
    console.error('Error saving item:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el tipo de estrato'
    });
  } finally {
    saving.value = false;
  }
};

const deleteItem = (item: TipoEstrato) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Está seguro de eliminar el tipo de estrato "${item.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await axios.delete(`/api/estratos-tipo/${item.id}`);
      $q.notify({
        type: 'positive',
        message: 'Tipo de estrato eliminado correctamente'
      });
      await fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el tipo de estrato'
      });
    }
  });
};

const onRequest = (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
};

// Lifecycle
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.hover-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>