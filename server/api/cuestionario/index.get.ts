// server/api/cuestionario/index.get.ts
// GET /api/cuestionario - obtiene las preguntas del cuestionario
export default defineEventHandler(async () => {
    return $fetch("http://localhost:4000/cuestionario")
})
