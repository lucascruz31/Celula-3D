// server/api/cuestionario/index.put.ts
// PUT /api/cuestionario - actualiza el cuestionario
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    return $fetch("http://localhost:4000/cuestionario", {
        method: "PUT",
        body
    })
})
