// server/api/perfiles/login.post.ts
// POST /api/perfiles/login - Endpoint de autenticación

export default defineEventHandler(async (event) => {
    // Leemos el cuerpo de la petición
    const body = await readBody(event)
    const { username, password } = body

    if (!username || !password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Usuario y contraseña son requeridos'
        })
    }

    try {
        // Consultamos todos los perfiles al json-server (suponiendo que está en el puerto 4000)
        // Lo filtramos manualmente porque algunas versiones beta de json-server ignoran los query params
        const response = await $fetch<any[]>(`http://localhost:4000/perfiles`)

        const matchedUser = response.find(user => user.username === username && user.password === password)

        // Si se encuentra un usuario con esas credenciales exactas
        if (matchedUser) {
            return matchedUser
        }

        // Si no se encuentra
        throw createError({
            statusCode: 401,
            statusMessage: 'Credenciales inválidas'
        })
    } catch (error: any) {
        // Si el error ya es un NuxtError (como el 401 que lanzamos arriba), lo re-lanzamos
        if (error.statusCode === 401) throw error;
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Error conectando con el servidor de base de datos JSON'
        })
    }
})
