export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    try {
        const response = await $fetch(`http://localhost:4000/perfiles/${id}`, {
            method: 'DELETE'
        })
        return response
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error eliminando perfil'
        })
    }
})
