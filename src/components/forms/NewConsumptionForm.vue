```vue
<template>
  <div class="q-pa-sm">
    <div class="row q-col-gutter-xs">
      <!-- Fecha, Mes y Año -->
      <div class="col-12 q-mb-xs">
        <DateFields v-model="formData" />
      </div>

      <!-- Código de Instalación -->
      <div class="col-12 col-sm-6 col-md-3 q-mb-xs">
        <InstallationCodeField 
          ref="codigoRef"
          @installation-found="onInstallationFound" 
          v-if="mode !== 'edit'"
        />
        <ReadonlyField
          v-else
          v-model="formData.codigo"
          label="Instalación"
        />
      </div>

      <!-- Cliente -->
      <div class="col-12 col-sm-6 col-md-4 q-mb-xs">
        <ReadonlyField
          v-model="formData.cliente"
          label="Cliente"
        />
      </div>

      <!-- Sector -->
      <div class="col-12 col-sm-6 col-md-3 q-mb-xs">
        <ReadonlyField
          v-model="formData.sector"
          label="Sector"
        />
      </div>

      <!-- Medidor -->
      <div class="col-12 col-sm-6 col-md-2 q-mb-xs">
        <ReadonlyField
          v-model="formData.medidor"
          label="Medidor"
        />
      </div>

      <!-- Dirección -->
      <div class="col-12 q-mb-xs">
        <ReadonlyField
          v-model="formData.direccion"
          label="Dirección"
        />
      </div>

      <!-- Lecturas y Consumo -->
      <div class="col-12 col-sm-6 col-md-3 q-mb-xs">
        <ReadonlyField
          v-model="formData.lectura_anterior"
          label="Lectura Anterior"
          type="number"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3 q-mb-xs">
        <q-input
          ref="lecturaActualRef"
          v-model="formData.lectura_actual"
          label="Lectura Actual"
          type="number"
          outlined
          dense
          @keyup="handleLecturaActualKeyup"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3 q-mb-xs">
        <ReadonlyField
          v-model="formData.consumo"
          label="Consumo"
          type="number"
          class="text-center"
          :class="{
            'bg-negative': isConsumptionOutOfRange,
            'bg-positive': !isConsumptionOutOfRange && formData.consumo !== '0'
          }"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3 q-mb-xs">
        <ReadonlyField
          v-model="formData.promedio"
          label="Promedio"
          type="number"
          class="text-center"
        />
      </div>

      <!-- Cobros Adicionales - Hidden on mobile/tablet -->
      <div class="col-12 col-md-6 q-mb-xs hide-on-mobile">
        <q-input
          ref="otrosCobrosRef"
          v-model="formData.otros_cobros"
          label="Otros Cobros"
          type="number"
          outlined
          dense
          @keyup="handleOtrosCobrosKeyup"
        />
      </div>

      <div class="col-12 col-md-6 q-mb-xs hide-on-mobile">
        <q-input
          ref="reconexionRef"
          v-model="formData.reconexion"
          label="Reconexión"
          type="number"
          outlined
          dense
        />
      </div>

      <!-- Cobros Adicionales - Shown only on mobile/tablet -->
      <div class="col-12 show-on-mobile q-mb-xs">
        <q-btn
          label="Mostrar cobros adicionales"
          color="primary"
          flat
          @click="showAdditionalCharges = !showAdditionalCharges"
          class="full-width"
          :icon-right="showAdditionalCharges ? 'expand_less' : 'expand_more'"
        />
        
        <q-slide-transition>
          <div v-show="showAdditionalCharges">
            <div class="row q-col-gutter-xs q-mt-xs">
              <div class="col-12 col-sm-6 q-mb-xs">
                <q-input
                  ref="otrosCobrosRef"
                  v-model="formData.otros_cobros"
                  label="Otros Cobros"
                  type="number"
                  outlined
                  dense
                  @keyup="handleOtrosCobrosKeyup"
                />
              </div>

              <div class="col-12 col-sm-6 q-mb-xs">
                <q-input
                  ref="reconexionRef"
                  v-model="formData.reconexion"
                  label="Reconexión"
                  type="number"
                  outlined
                  dense
                />
              </div>
            </div>
          </div>
        </q-slide-transition>
      </div>

      <!-- Botones -->
      <div class="col-12 row justify-end q-gutter-sm q-mt-sm">
        <q-btn
          label="Cancelar"
          color="negative"
          flat
          @click="onCancel"
        />
        <q-btn
          :label="mode === 'edit' ? 'Actualizar' : 'Guardar'"
          color="primary"
          @click="handleSave"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import InstallationCodeField from './fields/InstallationCodeField.vue';
import ReadonlyField from './fields/ReadonlyField.vue';
import DateFields from './fields/DateFields.vue';
import { getCurrentDate, getCurrentMonth, getCurrentYear, months } from '../../utils/dates';
import { useConsumptionForm } from '../../composables/useConsumptionForm';

const emit = defineEmits<{
  (e: 'mounted'): void
}>();

const props = defineProps<{
  mode?: 'create' | 'edit'
}>();

const $q = useQuasar();
const router = useRouter();
const codigoRef = ref(null);
const lecturaActualRef = ref(null);
const otrosCobrosRef = ref(null);
const reconexionRef = ref(null);
const showAdditionalCharges = ref(false);

const { formData, updateConsumo, saveConsumption } = useConsumptionForm(props.mode);

// Inicializar valores por defecto solo en modo create
if (props.mode !== 'edit') {
  formData.value.mes = months[getCurrentMonth() - 1].text;
  formData.value.year = getCurrentYear();
  formData.value.fecha = getCurrentDate();
}

const isConsumptionOutOfRange = computed(() => {
  const consumo = parseFloat(formData.value.consumo);
  const promedio = parseFloat(formData.value.promedio);
  
  if (isNaN(consumo) || isNaN(promedio) || promedio === 0) {
    return false;
  }

  const difference = Math.abs(consumo - promedio);
  return difference > 10;
});

// Watch para actualizar el consumo cuando cambia la lectura actual
watch(() => formData.value.lectura_actual, (newValue) => {
  if (newValue && formData.value.lectura_anterior) {
    updateConsumo(newValue);
  }
});

const handleLecturaActualKeyup = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    const consumo = parseFloat(formData.value.consumo);
    if (consumo > -1) {
      otrosCobrosRef.value?.focus();
    } else {
      lecturaActualRef.value?.focus();
      $q.notify({
        type: 'negative',
        message: 'El consumo debe ser mayor a -1'
      });
    }
  }
};

const handleOtrosCobrosKeyup = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && formData.value.otros_cobros !== null) {
    reconexionRef.value?.focus();
  }
};

const onInstallationFound = async (installation: any) => {
  console.log('installation:::', installation);
  formData.value = {
    ...formData.value,
    codigo: installation.codigo.toString(),
    medidor: installation.codigo_medidor,
    cliente: installation.nombre,
    sector: installation.sector_nombre,
    direccion: installation.direccion,
    lectura_anterior: installation.lectura_anterior.toString(),
    promedio: installation.promedio.toString()
  };
  
  await nextTick();
  if (props.mode !== 'edit') {
    lecturaActualRef.value?.focus();
  }
};

const onCancel = () => {
  router.push('/consumptions');
};

const handleSave = async () => {
  const success = await saveConsumption();
  if (success) {
    if (props.mode !== 'edit') {
      codigoRef.value?.clear();
      await nextTick();
      codigoRef.value?.focus();
    } else {
      router.push('/consumptions');
    }
  }
};

onMounted(() => {
  emit('mounted');
});

// Métodos expuestos para el componente padre
defineExpose({
  setFormData: (data: any) => {
    formData.value = { ...formData.value, ...data };
  },
  onInstallationFound,
  focusLecturaActual: () => {
    nextTick(() => {
      if (lecturaActualRef.value) {
        lecturaActualRef.value.focus();
      }
    });
  }
});
</script>

<style lang="scss" scoped>
.q-form {
  max-width: 1200px;
  margin: 0 auto;
}

.text-center {
  :deep() {
    .q-field__native {
      text-align: center !important;
    }
  }
}

.bg-negative {
  :deep() {
    .q-field__native {
      background-color: #ffebee !important; // Color rojo claro
      color: #d32f2f !important; // Color rojo oscuro para el texto
    }
  }
}

.bg-positive {
  :deep() {
    .q-field__native {
      background-color: #d4edda !important;
    }
  }
}

// Reduce spacing between fields
.q-mb-xs {
  margin-bottom: 4px !important;
}

.row.q-col-gutter-xs {
  margin: -2px;
  > div {
    padding: 2px;
  }
}

// Responsive visibility classes
@media (max-width: 1023px) {
  .hide-on-mobile {
    display: none;
  }
  .show-on-mobile {
    display: block;
  }
}

@media (min-width: 1024px) {
  .hide-on-mobile {
    display: block;
  }
  .show-on-mobile {
    display: none;
  }
}
</style>
```