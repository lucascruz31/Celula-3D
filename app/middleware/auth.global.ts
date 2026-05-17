import { usePerfilesStore } from '~/store/perfiles'

export default defineNuxtRouteMiddleware((to, from) => {
  const store = usePerfilesStore()
  
  // Si el usuario no está autenticado y no está en la página de login, redirigir al login
  if (!store.currentPerfil && to.path !== '/login') {
    return navigateTo('/login')
  }
  
  // Si el usuario ya está autenticado e intenta ir al login, redirigir al inicio
  if (store.currentPerfil && to.path === '/login') {
    return navigateTo('/')
  }
})
