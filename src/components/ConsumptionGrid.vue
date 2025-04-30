<script setup lang="ts">
import type { Consumption } from '../types/consumption';
import { useRouter } from 'vue-router';

const router = useRouter();

defineProps<{
  items: Consumption[]
}>();

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ'
  }).format(value);
};

const handleEdit = (consumption: Consumption) => {
  router.push({
    name: 'edit-consumption',
    params: {
      id: consumption.codigo.toString(),
      consumption: JSON.stringify(consumption)
    }
  });
};
</script>

<template>
  <div class="row q-col-gutter-sm">
    <div v-for="item in items" :key="item.codigo" class="col-12 col-sm-6 col-md-4">
      <q-card class="consumption-card">
        <!-- Encabezado -->
        <q-card-section class="bg-primary text-white q-pa-sm">
          <div class="row items-center justify-between">
            <div class="col">
              <div class="text-subtitle1">{{ item.nombre }}</div>
              <div class="text-caption row items-center q-gutter-x-sm">
                <span class="flex items-center">
                  <q-icon name="tag" size="xs" class="q-mr-xs text-green" />
                  <span class="field-label">Código:</span>
                  {{ item.codigo }}
                </span>
                <span class="flex items-center">
                  <q-icon name="home" size="xs" class="q-mr-xs text-green" />
                  <span class="field-label">Instalación:</span>
                  {{ item.instalacion }}
                </span>
                <span class="flex items-center">
                  <q-icon name="speed" size="xs" class="q-mr-xs text-green" />
                  <span class="field-label">Medidor:</span>
                  {{ item.medidor }}
                </span>
              </div>
            </div>
            <div class="col-auto">
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="white"
                @click="handleEdit(item)"
              />
            </div>
          </div>
        </q-card-section>

        <!-- Información principal -->
        <q-card-section class="q-pa-sm">
          <div class="row q-col-gutter-sm">
            <!-- Dirección -->
            <div class="col-12">
              <div class="flex items-center">
                <q-icon name="location_on" color="green" size="sm" class="q-mr-xs" />
                <span class="field-label">Dirección:</span>
                <span class="text-body2">{{ item.direccion }}</span>
              </div>
            </div>

            <!-- Período -->
            <div class="col-12">
              <div class="flex items-center">
                <q-icon name="event" color="green" size="sm" class="q-mr-xs" />
                <span class="field-label">Período:</span>
                <span class="text-body2">{{ item.mes }} {{ item.year }}</span>
              </div>
            </div>

            <!-- Estado -->
            <div class="col-12">
              <div class="flex items-center">
                <q-icon 
                  :name="item.facturado ? 'check_circle' : 'pending'" 
                  :color="item.facturado ? 'positive' : 'warning'" 
                  size="sm" 
                  class="q-mr-xs" 
                />
                <span class="field-label">Estado:</span>
                <span class="text-body2">{{ item.facturado ? 'Facturado' : 'Pendiente' }}</span>
              </div>
            </div>

            <!-- Lecturas -->
            <div class="col-12 q-mt-sm">
              <div class="text-subtitle2 text-grey-8">Lecturas</div>
              <div class="row q-col-gutter-sm q-mt-xs">
                <div class="col-6">
                  <q-card flat bordered class="text-center bg-blue-1">
                    <q-card-section class="q-pa-xs">
                      <div class="text-caption">Lectura</div>
                      <div class="text-h6 text-primary">{{ item.lectura }}</div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-6">
                  <q-card flat bordered class="text-center bg-green-1">
                    <q-card-section class="q-pa-xs">
                      <div class="text-caption">Consumo</div>
                      <div class="text-h6 text-positive">{{ item.consumo }}</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>

            <!-- Cobros Adicionales -->
            <template v-if="item.otros_cobros || item.reconexion">
              <div class="col-12 q-mt-sm">
                <div class="text-subtitle2 text-grey-8">Cobros Adicionales</div>
                <div class="row q-col-gutter-x-md q-mt-xs">
                  <div v-if="item.otros_cobros" class="col-6">
                    <div class="text-body2">
                      <div class="flex items-center">
                        <q-icon name="attach_money" color="green" size="sm" class="q-mr-xs" />
                        Otros Cobros
                      </div>
                      <div class="text-caption">{{ formatCurrency(item.otros_cobros) }}</div>
                    </div>
                  </div>
                  <div v-if="item.reconexion" class="col-6">
                    <div class="text-body2">
                      <div class="flex items-center">
                        <q-icon name="power" color="green" size="sm" class="q-mr-xs" />
                        Reconexión
                      </div>
                      <div class="text-caption">{{ formatCurrency(item.reconexion) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.consumption-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px 0 rgba(0,0,0,.1);
  }
}

.field-label {
  font-weight: 500;
  margin-right: 4px;
  opacity: 0.9;
}
</style>