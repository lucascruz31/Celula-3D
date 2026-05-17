// server/api/answers/index.get.ts
// GET /api/answers - obtiene todas las respuestas
export default defineEventHandler(async () => {
    // const { apiBase } = useRuntimeConfig()
    // return $fetch(`${apiBase}/answers`)
    return $fetch("http://localhost:4000/answers")
})
