
  
const runtime = useRuntimeConfig()

 

export const Base_url = runtime.public.apiBase as string ||'http://localhost:5002/api/v1'