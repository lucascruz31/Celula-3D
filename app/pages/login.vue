<template>
  <div class="page-wrapper">
    
    <div class="content login-box">
      <h1 class="text-h4 font-weight-bold mb-6">Acceso</h1>
      
      <v-form @submit.prevent="handleLogin" class="w-100">
        <v-text-field
          v-model="form.username"
          label="Usuario"
          required
          variant="outlined"
          base-color="white"
          color="#00e5ff"
          bg-color="rgba(255, 255, 255, 0.05)"
          class="custom-input mb-4"
        ></v-text-field>
        
        <v-text-field
          v-model="form.password"
          label="Contraseña"
          type="password"
          required
          variant="outlined"
          base-color="white"
          color="#00e5ff"
          bg-color="rgba(255, 255, 255, 0.05)"
          class="custom-input mb-6"
        ></v-text-field>
        
        <v-btn type="submit" block class="login-btn" size="large">
          Entrar
        </v-btn>
      </v-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePerfilesStore } from '~/store/perfiles';

definePageMeta({
  layout: false
});

const form = ref({
  username: '',
  password: '',
});

const store = usePerfilesStore();

const handleLogin = async () => {
  if (form.value.username && form.value.password) {
    const success = await store.login(form.value.username, form.value.password);
    if (success) {
      navigateTo('/');
    } else {
      alert('Credenciales incorrectas o error en el servidor.');
    }
  } else {
    alert('Por favor, ingresa un usuario y contraseña.');
  }
};
</script>

<style scoped>
.page-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #0a0a0a;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: 'Roboto', sans-serif;
}

.main-title {
  position: absolute;
  top: 40px;
  left: 40px;
  color: white;
  border-bottom: 2px solid white;
}

.content {
  text-align: center;
  width: 100%;
  max-width: 450px;
  padding: 40px;
  background: rgba(0, 0, 0, 0.6);
  border-left: 3px solid #00e5ff;
  border-radius: 4px;
}

.content h1 {
  color: #00e5ff;
}

.login-btn {
  background-color: #00e5ff !important;
  color: #0a0a0a !important;
  font-weight: bold;
  letter-spacing: 1px;
}

/* Forzar el color blanco en el texto de los inputs de Vuetify */
:deep(.v-field__input) {
  color: white !important;
}

:deep(.v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
}
</style>