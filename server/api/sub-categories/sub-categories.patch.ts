// server/api/categories.patch.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const body = await readBody(event)

  const id = query.id

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing ID parameter'
    })
  }

  try {
    const response = await $fetch(`${config.public.apiBase}/sub-categories/${id}`, {
      method: 'PATCH',
      body: body
    })
    return response 
  } catch (error: any) {
    // AMANKAN STATUS MESSAGE DI SINI
    const errorMessage = Array.isArray(error.data?.message) 
      ? error.data.message.join(', ') // Jika array, gabungkan jadi string
      : error.data?.message || error.message || 'Internal Server Error';

    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: String(errorMessage), // Paksa jadi string murni
      data: error.data 
    })
  }
})