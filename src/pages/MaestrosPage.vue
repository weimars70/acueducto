<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const maestrosItems = [
  {
    title: 'Sectores',
    icon: 'location_city',
    description: 'Administración de sectores geográficos',
    route: '/sectores',
    color: 'primary'
  },
  {
    title: 'Tarifas',
    icon: 'payments',
    description: 'Configuración de tarifas del servicio',
    route: '/tarifas',
    color: 'secondary'
  },
  {
    title: 'Estratos',
    icon: 'group_work',
    description: 'Gestión de estratos socioeconómicos',
    route: '/estratos',
    color: 'accent'
  },
  {
    title: 'Tipos de Estrato',
    icon: 'category',
    description: 'Administración de tipos de estrato',
    route: '/tipos-estrato',
    color: 'teal'
  },
  {
    title: 'Factura Tipo',
    icon: 'receipt',
    description: 'Administración de tipos de factura',
    route: '/factura-tipo',
    color: 'purple'
  }
];

const navigateTo = (route: string) => {
  router.push(route);
};
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Maestros</div>
    <div class="text-subtitle1 q-mb-lg">Administración de datos maestros del sistema</div>
    
    <div class="row q-col-gutter-md">
      <div 
        v-for="item in maestrosItems"
        :key="item.route"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card 
          class="maestro-card cursor-pointer" 
          :class="`bg-${item.color}-1`"
          @click="navigateTo(item.route)"
          v-ripple
        >
          <q-card-section class="flex items-center">
            <q-avatar :color="item.color" text-color="white" size="56px" class="q-mr-md">
              <q-icon :name="item.icon" size="32px" />
            </q-avatar>
            
            <div>
              <div class="text-h6">{{ item.title }}</div>
              <div class="text-subtitle2">{{ item.description }}</div>
            </div>
          </q-card-section>
          
          <q-card-actions>
            <q-space />
            <q-btn 
              :color="item.color" 
              icon="arrow_forward" 
              label="Acceder" 
              flat 
              :to="item.route"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.maestro-card {
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}
</style>