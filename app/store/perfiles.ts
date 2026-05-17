// app/stores/playlists.ts
// Setup Store de Pinia 3 — playlists con Read y Create
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Perfiles } from '~/shared/types'

export const usePerfilesStore = defineStore('perfiles', () => {
    // ── STATE ──────────────────────────────────────────────────────────────────
    // Se almacenan todas las playlist
    const perfiles = ref<Perfiles[]>([])
    // Se almacena la playlist actualmente seleccionada (si hay alguna)
    const currentPerfil = ref<Perfiles | null>(null)
    // Indicador de carga para operaciones asíncronas relacionadas con playlists
    const isLoading = ref(false)

    // ── GETTERS ────────────────────────────────────────────────────────────────
    // Devuelve el número total de playlists almacenadas
    const totalPerfiles = computed(() => perfiles.value.length)

    // ── ACTIONS ────────────────────────────────────────────────────────────────
    // Obtiene todas las playlists desde el backend y las almacena en el estado
    async function fetchPerfiles() {
        isLoading.value = true
        try {
            perfiles.value = await $fetch<Perfiles[]>('/api/perfiles')
        } catch (e) {
            console.error('[PerfilesStore] fetchPerfiles:', e)
        } finally {
            isLoading.value = false
        }
    }

    /*
    async function fetchPlaylistById(id: string): Promise<Playlist | null> {
      try {
        const playlist = await $fetch<Playlist>(`/api/playlists/${id}`)
        currentPlaylist.value = playlist
        return playlist
      } catch (e) {
        console.error('[PlaylistsStore] fetchPlaylistById:', e)
        return null
      }
    }*/

    /** Dado un playlist, obtiene los tracks correspondientes del store de tracks */
    /*function getTracksForPlaylist(playlist: Playlist, allTracks: Track[]): Track[] {
      return playlist.trackIds
        .map((id) => allTracks.find((t) => t.id === id))
        .filter((t): t is Track => !!t)
    }
  
    function setCurrentPlaylist(playlist: Playlist) {
      currentPlaylist.value = playlist
    }*/

    // Autentica un usuario enviando sus credenciales al servidor
    async function login(username: string, password: string): Promise<boolean> {
        isLoading.value = true
        try {
            const result = await $fetch<Perfiles>('/api/perfiles/login', {
                method: 'POST',
                body: { username, password }
            })
            if (result) {
                currentPerfil.value = result
                return true
            }
            return false
        } catch (e) {
            console.error('[PerfilesStore] login failed:', e)
            return false
        } finally {
            isLoading.value = false
        }
    }

    function logout() {
        currentPerfil.value = null
    }

    // Crea un nuevo perfil en la base de datos
    async function addPerfil(perfil: Omit<Perfiles, 'id'>) {
        isLoading.value = true
        try {
            // Generar un id simple (usamos la fecha para asegurarnos de que sea único)
            const newPerfil = {
                ...perfil,
                id: Date.now().toString()
            }
            await $fetch('/api/perfiles', {
                method: 'POST',
                body: newPerfil
            })
            // Refrescar la lista de perfiles
            await fetchPerfiles()
            return true
        } catch (e) {
            console.error('[PerfilesStore] addPerfil failed:', e)
            return false
        } finally {
            isLoading.value = false
        }
    }

    // Elimina un perfil de la base de datos por ID
    async function deletePerfil(id: string) {
        isLoading.value = true
        try {
            await $fetch(`/api/perfiles/${id}`, {
                method: 'DELETE'
            })
            // Refrescar la lista de perfiles
            await fetchPerfiles()
            return true
        } catch (e) {
            console.error('[PerfilesStore] deletePerfil failed:', e)
            return false
        } finally {
            isLoading.value = false
        }
    }

    // retorna el estado, getters y acciones para ser usados en los componentes y paginas
    return {
        perfiles,
        currentPerfil,
        isLoading,
        totalPerfiles,
        fetchPerfiles,
        login,
        logout,
        addPerfil,
        deletePerfil,
        // fetchPlaylistById,
        // getTracksForPlaylist,
        // setCurrentPlaylist,
    }
})