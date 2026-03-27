// server/api/questions/questions.patch.ts

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const id = query.id // Mengambil ID dari ?id=... yang dikirim frontend

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID is required',
    })
  }

  try {
    // PERBAIKAN DI SINI: Masukkan ID ke dalam URL path
    return await $fetch(`${config.public.apiBase}/questions/${id}`, { 
      method: 'PATCH',
      body: body
    })
  } catch (err: any) {
    throw createError({
      statusCode: err.response?.status || 500,
      statusMessage: err.message,
      data: err.data
    })
  }
})