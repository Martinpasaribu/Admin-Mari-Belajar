// server/api/media/upload-single.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const formData = await readFormData(event)
  
  // Ambil file dari request body
  const file = formData.get('file')

  if (!file) {
    throw createError({
      statusCode: 400,
      message: 'No file uploaded',
    })
  }

  try {
    // Teruskan ke NestJS Backend
    // config.public.apiBase biasanya berisi "http://localhost:3000"
    const response = await $fetch(`${config.public.apiBase}/media/upload-single`, {
      method: 'POST',
      body: formData, // Kirim ulang formData yang berisi file ke NestJS
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.data?.message || 'Failed to upload to backend server',
    })
  }
})