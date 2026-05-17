export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    try {
        const response = await $fetch("http://localhost:4000/perfiles", {
            method: 'POST',
            body
        })
        return response
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error creando perfil'
        })
    }
})
