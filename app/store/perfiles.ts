// app/stores/playlists.ts
// Setup Store de Pinia 3 — playlists con Read y Create
import { defineStore } from 'pinia'
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

    // retorna el estado, getters y acciones para ser usados en los componentes y paginas
    return {
        perfiles,
        currentPerfil,
        isLoading,
        totalPerfiles,
        fetchPerfiles,
        login,
        logout,
        // fetchPlaylistById,
        // getTracksForPlaylist,
        // setCurrentPlaylist,
    }
})