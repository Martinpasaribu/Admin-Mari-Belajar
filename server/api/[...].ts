// server/api/[...].ts
export default defineEventHandler(async (event) => {
  // Ambil URL NestJS dari runtimeConfig atau tulis langsung
  const BASE_URL_NEST = 'http://localhost:5002' 

  // 1. Ambil path asli (misal: /api/categories -> /categories)
  const path = event.path.replace(/^\/api/, '')

  // 2. Ambil method (GET, POST, dll)
  const method = event.method

  // 3. Ambil data body jika bukan request GET
  const body = method !== 'GET' ? await readBody(event).catch(() => undefined) : undefined

  // 4. Ambil query params (misal: ?page=1)
  const query = getQuery(event)

  try {
    // Teruskan request ke NestJS menggunakan $fetch (bawaan Nuxt/Nitro)
    return await $fetch(`${BASE_URL_NEST}${path}`, {
      method,
      body,
      query,
      headers: {
        // Teruskan header Authorization (Token) dari browser ke NestJS
        Authorization: getHeader(event, 'Authorization') || '',
      }
    })
  } catch (error: any) {
    // Jika NestJS error, lempar errornya ke frontend
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.response?._data?.message || 'NestJS Server Error',
      data: error.response?._data
    })
  }
})