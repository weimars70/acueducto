<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import MainDrawer from '../components/MainDrawer.vue';
import TabsBar from '../components/TabsBar.vue';
import { ref } from 'vue';

const authStore = useAuthStore();
const router = useRouter();
const leftDrawerOpen = ref(true);

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        
        <q-toolbar-title class="row items-center">
          <span class="text-h6 q-ml-sm">Sistema ERP</span>
        </q-toolbar-title>

        <q-btn
          flat
          round
          dense
          icon="logout"
          @click="handleLogout"
        />
      </q-toolbar>
      <TabsBar />
    </q-header>

    <MainDrawer v-model="leftDrawerOpen" />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.q-toolbar {
  height: 64px;
}

.text-h6 {
  font-weight: 500;
}
</style>