// server/api/media/upload-multiple.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const formData = await readFormData(event)

  try {
    // Teruskan ke NestJS Backend (Endpoint: media/upload-multiple)
    const response = await $fetch(`${config.public.apiBase}/media/upload-multiple`, {
      method: 'POST',
      body: formData,
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.data?.message || 'Failed to upload multiple files to backend server',
    })
  }
})