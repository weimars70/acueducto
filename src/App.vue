<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { db } from './services/database/db.service';

const authStore = useAuthStore();

onMounted(async () => {
  authStore.initializeAuth();
  
  try {
    // Solo inicializar la base de datos
    await db.open();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
});
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>