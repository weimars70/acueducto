<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { hashPassword } from '../utils/crypto';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const loading = ref(false);
const isPwd = ref(true);

async function handleLogin() {
  if (!username.value || !password.value) {
    $q.notify({
      color: 'negative',
      message: 'Please fill in all fields',
      icon: 'warning'
    });
    return;
  }

  try {
    loading.value = true;
    const success = await authStore.login({
      username: username.value,
      password: hashPassword(password.value)
    });

    if (success) {
      $q.notify({
        color: 'positive',
        message: 'Login successful',
        icon: 'check'
      });
      await router.push('/dashboard');
    } else {
      $q.notify({
        color: 'negative',
        message: 'Invalid credentials',
        icon: 'error'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    $q.notify({
      color: 'negative',
      message: 'An error occurred during login',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <q-page padding class="flex flex-center">
    <q-card class="login-card">
      <q-card-section class="text-center">
        <h4 class="text-h4 q-mb-md">Login</h4>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleLogin" class="q-gutter-md">
          <q-input
            v-model="username"
            label="Username"
            outlined
            :rules="[val => !!val || 'Username is required']"
            autocomplete="username"
            inputmode="text"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            label="Password"
            outlined
            :type="isPwd ? 'password' : 'text'"
            :rules="[val => !!val || 'Password is required']"
            autocomplete="current-password"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <q-btn
            type="submit"
            color="primary"
            label="Login"
            :loading="loading"
            class="full-width q-mt-md"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style lang="scss" scoped>
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  margin: 10px;
}

.q-page {
  min-height: 100vh !important;
}
</style>