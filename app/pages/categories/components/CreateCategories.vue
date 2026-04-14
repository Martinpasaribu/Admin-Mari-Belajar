<script setup lang="ts">
import type { MediaObject } from '~/types/categories'
import ImageUpload from '~/components/shared/ImageUpload.vue'
import RichEditor from '~/components/shared/RichEditor.vue';


type CreateCategoryForm = {
  name: string
  description: string
  sub_description: string
  order: number
  isActive: boolean
  icon: any | null 
  image_bg: any | null
  images: any[]
}

const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['close', 'success'])

const isSubmitting = ref(false)
const form = ref<CreateCategoryForm>({
  name: '', description: '', sub_description: '',
  order: 0, isActive: true,
  icon: null, image_bg: null, images: []
})

// PERBAIKAN: Fungsi Helper Upload
const performUpload = async (file: File | File[] | null, endpoint: 'upload-single' | 'upload-multiple') => {
  if (!file) return null
  if (!Array.isArray(file) && (file as any).url && !(file instanceof File)) return file

  const formData = new FormData()
  if (Array.isArray(file)) {
    file.forEach(f => formData.append('files', f))
  } else {
    formData.append('file', file)
  }

  try {
    const res = await $fetch<any>(`/api/media/${endpoint}`, {
      method: 'POST',
      body: formData
    })

    // JANGAN ADA EMIT DI SINI
    // Cukup cek validasi data saja
    if (res.success === false) {
      const msg = Array.isArray(res.message) ? res.message.join(', ') : res.message
      throw new Error(msg) // Lempar error agar ditangkap catch di handleAdd
    }

    return res.data || res 
  } catch (err: any) {
    console.error(`Upload error pada ${endpoint}:`, err)
    throw err // Lempar error agar handleAdd berhenti
  }
}

const handleAdd = async () => {
  if (!form.value.name) return alert('Nama wajib diisi')
  
  isSubmitting.value = true
  try {
    // 1. Jalankan Upload
    // Jika performUpload gagal, dia akan 'throw error' dan langsung loncat ke blok CATCH
    const [uploadedIcon, uploadedBg] = await Promise.all([
      performUpload(form.value.icon, 'upload-single'),
      performUpload(form.value.image_bg, 'upload-single')
    ])

    let uploadedGallery: MediaObject[] = []
    if (form.value.images && form.value.images.length > 0) {
      uploadedGallery = await performUpload(form.value.images, 'upload-multiple')
    }

    // 2. Susun Payload
    const finalPayload = {
      ...form.value,
      icon: uploadedIcon,
      image_bg: uploadedBg,
      images: uploadedGallery
    }

    // 3. Kirim ke API Categories
    const res = await $fetch<any>('/api/categories', {
      method: 'POST',
      body: finalPayload
    })

    // CEK HASIL AKHIR
    if (res.success) {
      // HANYA DI SINI MODAL BOLEH DITUTUP
      emit('success')
      resetForm()
      emit('close')
    } else {
      // Jika res.success false dari backend kategori
      const msg = Array.isArray(res.message) ? res.message.join(', ') : res.message
      alert('Gagal simpan kategori: ' + msg)
    }

  } catch (err: any) {
    // Jika ada error di upload atau jaringan, modal TIDAK akan tertutup
    const msg = err.data?.message || err.message || 'Terjadi kesalahan'
    alert('Error: ' + msg)
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    name: '', description: '', sub_description: '',
    order: 0, isActive: true,
    icon: null, image_bg: null, images: []
  }
}

const labelClass = "block text-[13px] font-semibold text-slate-700 mb-1.5 ml-0.5 tracking-tight"
const inputClass = "w-full bg-white px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm transition-all duration-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none placeholder:text-slate-400"
</script>

<template>
  <GenericModal 
    :show="show" 
    title="Create New Category" 
    @close="emit('close')" 
    @confirm="handleAdd" 
    :loading="isSubmitting"
    size="2xl"
  >
    <div class="max-h-[75vh] overflow-y-auto custom-scrollbar px-1 -mx-1">
      <div class="mb-8">
        <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">Visual Assets</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload 
            v-model="form.icon" 
            label="Category Icon" 
            aspect-ratio="square"
            description="Recommended: SVG or PNG 1:1"
          />
          <ImageUpload 
            v-model="form.image_bg" 
            label="Cover Background" 
            aspect-ratio="video"
            description="Will be used as card background"
          />
        </div>
      </div>

      <div class="mb-8">
        <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">General Information</h3>
        <div class="space-y-5">
          <div>
            <label :class="labelClass">Category Name</label>
            <input 
              v-model="form.name" 
              type="text" 
              :class="inputClass" 
              placeholder="e.g. Pegawai Negeri Sipil (CPNS)" 
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label :class="labelClass">Main Description</label>
              <!-- <textarea 
                v-model="form.description" 
                rows="3" 
                :class="inputClass" 
                placeholder="Brief summary about this category..."
              ></textarea> -->
            <ClientOnly>
              <RichEditor v-model="form.description" />
              <template #fallback>
                <div class="h-[250px] w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
                  <span class="text-xs text-slate-400 font-medium">Memuat Editor...</span>
                </div>
              </template>
            </ClientOnly>
            </div>
            <div>
              <label :class="labelClass">Sub Description</label>
              <!-- <textarea 
                v-model="form.sub_description" 
                rows="3" 
                :class="inputClass" 
                placeholder="Additional details for display..."
              ></textarea> -->
                          
              <ClientOnly>
                <RichEditor v-model="form.description" />
                <template #fallback>
                  <div class="h-[250px] w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
                    <span class="text-xs text-slate-400 font-medium">Memuat Editor...</span>
                  </div>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">Configuration</h3>
        <div class="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-6">
          <div class="flex-1 min-w-[150px]">
            <label :class="labelClass">Display Order</label>
            <input 
              v-model="form.order" 
              type="number" 
              class="w-32 bg-white px-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none" 
            />
          </div>

          <div class="flex items-center gap-10">
            <div class="flex flex-col">
              <span class="text-[13px] font-semibold text-slate-700">Visibility Status</span>
              <span class="text-[11px] text-slate-400">Make this category visible to users</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="form.isActive" type="checkbox" class="sr-only peer" />
              <div class="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
            </label>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">Gallery Images</h3>
        <ImageUpload 
          v-model="form.images" 
          multiple 
          label=""
        />
      </div>
    </div>
  </GenericModal>
</template>

<style scoped>
/* Custom Scrollbar untuk Webkit (Chrome, Safari, Edge) */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  /* Menggunakan hex code slate-200 agar aman di v4 */
  background-color: #e2e8f0; 
  border-radius: 100px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #cbd5e1; /* slate-300 */
}

/* Dukungan untuk Firefox */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}
</style>