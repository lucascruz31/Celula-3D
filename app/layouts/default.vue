<template>
  <v-card class="mx-auto" elevation="0">
    <v-layout>
      <v-app-bar color= #00e5ff>
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

        <v-toolbar-title>Proyecto Célula</v-toolbar-title>

        <v-spacer></v-spacer>
        
        <v-btn icon="mdi-logout" variant="text" @click="handleLogout"></v-btn>
      </v-app-bar>

      <v-navigation-drawer
        v-model="drawer"
        temporary
      >
        <v-list>
          <v-list-item
            v-for="item in items"
            :key="item.value"
            :to="item.to"
            :title="item.title"
            @click="drawer = false"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <slot />
      </v-main>
    </v-layout>
  </v-card>
</template>
<script setup>
  import { ref, watch, computed } from 'vue'
  import { navigateTo } from '#imports'
  import { usePerfilesStore } from '~/store/perfiles'

  const store = usePerfilesStore()

  const handleLogout = () => {
    store.logout();
    navigateTo('/login');
  }

  const items = computed(() => {
    const baseItems = [
      {
        title: 'Inicio',
        value: 'inicio',
        to: '/',
      },
      {
        title: 'Celula Animal',
        value: 'CellA',
        to: '/CellA',
      },
      {
        title: 'Celula Vegetal',
        value: 'CellV',
        to: '/CellV',
      },
      {
        title: 'Cuestionario',
        value: 'cuestionario',
        to: '/cuestionario',
      }
    ]

    if (store.currentPerfil?.rol === 'Admin') {
      baseItems.push({
        title: 'Configuración',
        value: 'config',
        to: '/config',
      })
    }

    return baseItems
  })


  const drawer = ref(false)
  const group = ref(null)

  watch(group, () => {
    drawer.value = false
  })
</script>