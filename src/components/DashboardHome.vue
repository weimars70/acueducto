<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMainContentStore } from '../stores/mainContent';
import TiposEstratoPage from '../pages/generic-capture/TiposEstratoPage.vue';
import SectorsPage from '../pages/generic-capture/SectorsPage.vue';
import TarifasPage from '../pages/generic-capture/TarifasPage.vue';
import EstratosPage from '../pages/generic-capture/EstratosPage.vue';
import FacturaTipoPage from '../pages/generic-capture/FacturaTipoPage.vue';

const mainContentStore = useMainContentStore();

onMounted(() => {
  // Resetear a vista home cuando se monta el dashboard
  mainContentStore.setCurrentView('home');
});
</script>

<template>
  <q-page class="q-pa-md">
    <!-- Vista Home por defecto -->
    <div v-if="mainContentStore.currentView === 'home'">
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6">Bienvenido al Dashboard</div>
          <div class="text-subtitle2">Sistema de Gestión de Acueducto</div>
        </q-card-section>
        <q-card-section>
          <p>Utiliza el menú lateral para navegar por las diferentes secciones del sistema.</p>
        </q-card-section>
      </q-card>
    </div>
    
    <!-- Vistas de Maestros con CRUD completo -->
    <TiposEstratoPage v-else-if="mainContentStore.currentView === 'tipos-estrato'" />
    <SectorsPage v-else-if="mainContentStore.currentView === 'sectores'" />
    <TarifasPage v-else-if="mainContentStore.currentView === 'tarifas'" />
    <EstratosPage v-else-if="mainContentStore.currentView === 'estratos'" />
    <FacturaTipoPage v-else-if="mainContentStore.currentView === 'factura-tipo'" />
    
    <!-- Vistas adicionales de Maestros -->
    <div v-else-if="mainContentStore.currentView === 'usuarios'" class="q-pa-md">
      <h4>Gestión de Usuarios</h4>
      <p>Módulo CRUD para usuarios - En desarrollo</p>
    </div>
    <div v-else-if="mainContentStore.currentView === 'empresas'" class="q-pa-md">
      <h4>Gestión de Empresas</h4>
      <p>Módulo CRUD para empresas - En desarrollo</p>
    </div>
    <div v-else-if="mainContentStore.currentView === 'bancos'" class="q-pa-md">
      <h4>Gestión de Bancos</h4>
      <p>Módulo CRUD para bancos - En desarrollo</p>
    </div>
    
    <!-- Otras vistas -->
    <div v-else-if="mainContentStore.currentView === 'consumos'" class="q-pa-lg">
      <q-card>
        <q-card-section>
          <div class="text-h5">Módulo de Consumos</div>
          <p>Aquí irá el módulo de consumos...</p>
        </q-card-section>
      </q-card>
    </div>
    
    <div v-else-if="mainContentStore.currentView === 'lecturas'" class="q-pa-lg">
      <q-card>
        <q-card-section>
          <div class="text-h5">Lecturas del Mes</div>
          <p>Aquí irá el módulo de lecturas...</p>
        </q-card-section>
      </q-card>
    </div>
    
    <div v-else-if="mainContentStore.currentView === 'datos'" class="q-pa-lg">
      <q-card>
        <q-card-section>
          <div class="text-h5">Datos Sincronizados</div>
          <p>Aquí irá el módulo de datos sincronizados...</p>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>