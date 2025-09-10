<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar, Loading } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { useTabsStore } from '../stores/tabs';
import { useMainContentStore } from '../stores/mainContent';
import { syncService } from '../services/sync/sync.service';

const props = defineProps<{
  modelValue: boolean
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>();

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const tabsStore = useTabsStore();
const mainContentStore = useMainContentStore();
const miniState = ref(false);
const syncing = ref(false);

const menuItems = [
  {
    icon: 'show_chart',
    label: 'Consumos',
    route: '/consumptions',
    closable: true,
  },
  {
    icon: 'list_alt',
    label: 'Lecturas Mes',
    route: '/monthly-readings',
    closable: true,
  },
  {
    icon: 'storage',
    label: 'Datos Sincronizados',
    route: '/sync-data',
    closable: true,
  },
  {
    icon: 'settings',
    label: 'Maestros',
    route: '/maestros',
    closable: true,
    children: [
      {
        icon: 'location_city',
        label: 'Sectores',
        route: '/sectores',
        closable: true,
      },
      {
        icon: 'payments',
        label: 'Tarifas',
        route: '/tarifas',
        closable: true,
      },
      {
        icon: 'group_work',
        label: 'Estratos',
        route: '/estratos',
        closable: true,
      },
      {
        icon: 'category',
        label: 'Tipos de Estrato',
        route: '/tipos-estrato',
        closable: true,
      },
      {
        icon: 'receipt',
        label: 'Factura Tipo',
        route: '/factura-tipo',
        closable: true,
      },
      {
        icon: 'people',
        label: 'Usuarios',
        route: '/usuarios',
        closable: true,
      },
      {
        icon: 'business',
        label: 'Empresas',
        route: '/empresas',
        closable: true,
      },
      {
        icon: 'account_balance',
        label: 'Bancos',
        route: '/bancos',
        closable: true,
      }
    ]
  }
];

const expandedMenus = ref<string[]>(['/maestros']); // Expandir el menú de Maestros por defecto

const toggleExpand = (route: string) => {
  const index = expandedMenus.value.indexOf(route);
  if (index === -1) {
    expandedMenus.value.push(route);
  } else {
    expandedMenus.value.splice(index, 1);
  }
};

const navigateTo = (item: typeof menuItems[0]) => {
  // Si es una opción de Maestros, cambiar vista sin navegar
  if (['sectores', 'tarifas', 'estratos', 'tipos-estrato', 'factura-tipo', 'usuarios', 'empresas', 'bancos'].includes(item.route.replace('/', ''))) {
    mainContentStore.setCurrentView(item.route.replace('/', ''));
    emit('update:modelValue', false);
    return;
  }
  
  // Para otras opciones, navegar normalmente
  tabsStore.addTab({
    name: item.label,
    route: item.route,
    icon: item.icon,
    closable: item.closable,
  });
  router.push(item.route);
  emit('update:modelValue', false);
};

const toggleMiniState = () => {
  miniState.value = !miniState.value;
};

const handleSync = async () => {
  if (syncing.value) return;

  try {
    syncing.value = true;
    Loading.show({
      message: 'Sincronizando datos...',
      spinnerColor: 'primary'
    });

    await syncService.syncViews();
    
    $q.notify({
      type: 'positive',
      message: 'Datos sincronizados correctamente'
    });
  } catch (error) {
    console.error('Error syncing:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al sincronizar los datos'
    });
  } finally {
    syncing.value = false;
    Loading.hide();
  }
};
</script>

<template>
  <q-drawer
    :model-value="modelValue"
    :mini="miniState"
    :width="240"
    :breakpoint="500"
    bordered
    class="bg-white"
    show-if-above
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Header -->
    <q-toolbar class="bg-primary text-white">
      <q-avatar>
        <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
      </q-avatar>
      <q-toolbar-title class="text-weight-bold">
        Menu
      </q-toolbar-title>
      <q-btn
        flat
        round
        dense
        icon="chevron_left"
        @click="toggleMiniState"
        :rotate="miniState ? 180 : 0"
      />
    </q-toolbar>

    <!-- User Info -->
    <q-list padding>
      <q-item v-if="authStore.user">
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            {{ authStore.user.name.charAt(0).toUpperCase() }}
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ authStore.user.name }}</q-item-label>
          <q-item-label caption>{{ authStore.user.email }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-separator spaced />

      <!-- Menu Items -->
      <template v-for="item in menuItems" :key="item.route">
        <!-- Item with children (expandable) -->
        <q-expansion-item
          v-if="item.children"
          :icon="item.icon"
          :label="item.label"
          :default-opened="expandedMenus.includes(item.route)"
          expand-separator
        >
          <q-item
            v-for="child in item.children"
            :key="child.route"
            clickable
            v-ripple
            :active="mainContentStore.currentView === child.route.replace('/', '')"
            active-class="text-primary"
            @click="navigateTo(child)"
            class="q-pl-lg"
          >
            <q-item-section avatar>
              <q-icon :name="child.icon" />
            </q-item-section>
            <q-item-section>
              {{ child.label }}
            </q-item-section>
          </q-item>
        </q-expansion-item>
        
        <!-- Regular item (no children) -->
        <q-item
          v-else
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          v-show="item.visible !== false"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </template>

      <!-- Sync Button -->
      <q-separator spaced />
      
      <q-item 
        clickable 
        v-ripple 
        @click="handleSync"
        :disable="syncing"
      >
        <q-item-section avatar>
          <q-icon :name="syncing ? 'sync_disabled' : 'sync'" />
        </q-item-section>
        <q-item-section>
          {{ syncing ? 'Sincronizando...' : 'Sincronizar Datos' }}
        </q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<style lang="scss" scoped>
.q-drawer {
  .q-toolbar {
    height: 64px;
  }
  
  .q-item {
    border-radius: 8px;
    margin: 0 8px;
    
    &.q-item--active {
      background: rgba(25, 118, 210, 0.1);
    }
  }
}
</style>