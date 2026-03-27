// server/api/categories/index.ts

export default defineEventHandler(async (event) => {
  const method = event.method
  const cookie = getHeader(event, 'cookie')

  try {
    if (method === 'GET') {
      // Kita kirim cookie secara manual lewat header Axios di sini
      const res = await http.get('/categories', {
        headers: { 
          cookie: cookie || '' 
        }
      })
      
      // Biasanya NestJS mengembalikan data di dalam res.data
      return { 
        success: true, 
        data: res.data 
      }
    }

    if (method === 'POST') {
      const body = await readBody(event)
      const res = await http.post('/categories', body, {
        headers: { 
          cookie: cookie || '' 
        }
      })
      return { success: true, data: res.data }
    }
  } catch (err: any) {
    // Log ini akan muncul di terminal console kamu
    console.error(`❌ Error ${method} /categories:`, err.response?.data || err.message)
    
    return {
      success: false,
      message: err?.response?.data?.message || 'Gagal menyambung ke Backend NestJS'
    }
  }
})