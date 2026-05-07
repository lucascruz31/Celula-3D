// server/api/perfiles/index.get.ts
// GET /api/perfiles - obtiene todos los perfiles
export default defineEventHandler(async () => {
    // const { apiBase } = useRuntimeConfig()
    // return $fetch(`${apiBase}/perfiles`)
    return $fetch("http://localhost:4000/perfiles")
})