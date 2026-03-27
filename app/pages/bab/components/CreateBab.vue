<script setup lang="ts">
import type { MediaObject } from '~/types/categories'
import type { ISubCategory } from '~/types/sub-categories'
import ImageUpload from '~/components/shared/ImageUpload.vue'
// Pastikan path import sesuai dengan folder komponen Anda
import VideoPicker from '~/components/shared/VideoPicker.vue'
import DocumentPicker from '~/components/shared/DocumentPicker.vue'

type CreateBabForm = {
  name: string
  description: string
  sub_category_key: string | null
  sub_description: string
  content: string
  isFree?: boolean
  order: number
  duration: number
  isActive: boolean
  icon: any | null 
  image_bg: any | null
  images: any[]
  video_url: any
  document: any
}

const props = defineProps<{ 
  show: boolean,
  subcategory: ISubCategory | null,
 }>()

const emit = defineEmits(['close', 'success'])
const isSubmitting = ref(false)

const form = ref<CreateBabForm>({
  name: '', description: '', sub_description: '', content: '',
  order: 0, isActive: true, duration: 0,
  icon: null, image_bg: null, images: [], document: null, video_url: null,
  sub_category_key: props.subcategory?._id || null,
  isFree: true,
})

// Sinkronisasi sub_category_key jika props berubah
watch(() => props.subcategory, (newVal) => {
  if (newVal) form.value.sub_category_key = newVal._id
})

// Logika upload yang sudah dipisah dan dioptimasi
const performUpload = async (file: File | File[] | null, endpoint: 'upload-single' | 'upload-multiple') => {
  if (!file) return null
  // Jika file sudah berupa object media dari database (punya URL), kembalikan langsung
  if (!Array.isArray(file) && (file as any).url && !(file instanceof File)) return file

  const formData = new FormData()
  if (Array.isArray(file)) {
    file.forEach(f => formData.append('files', f))
  } else {
    formData.append('file', file)
  }

  try {
    const res = await $fetch<any>(`/api/media/${endpoint}`, { method: 'POST', body: formData })
    if (res.success === false) {
       const msg = Array.isArray(res.message) ? res.message.join(', ') : res.message
       throw new Error(msg)
    }
    return res.data || res 
  } catch (err: any) {
    console.error(`Upload error pada ${endpoint}:`, err)
    throw err 
  }
}

const handleAdd = async () => {
  if (!form.value.name) return alert('Nama Bab wajib diisi')
  
  isSubmitting.value = true
  try {
    // 1. Upload semua asset secara paralel (Menggunakan picker masing-masing)
    const [uploadedIcon, uploadedBg, uploadedDoc, uploadedVid] = await Promise.all([
      performUpload(form.value.icon, 'upload-single'),
      performUpload(form.value.image_bg, 'upload-single'),
      performUpload(form.value.document, 'upload-single'),
      performUpload(form.value.video_url, 'upload-single')
    ])

    let uploadedGallery: MediaObject[] = []
    if (form.value.images?.length > 0) {
      uploadedGallery = await performUpload(form.value.images, 'upload-multiple')
    }

    // 2. Susun Payload dengan sanitasi angka agar tidak menjadi string kosong
    const finalPayload = {
      ...form.value,
      order: Number(form.value.order) || 0,
      duration: Number(form.value.duration) || 0,
      sub_category_key: props.subcategory?._id || null,
      icon: uploadedIcon,
      image_bg: uploadedBg,
      document: uploadedDoc,
      video_url: uploadedVid,
      images: uploadedGallery
    }

    // 3. Kirim ke API Babs
    const res = await $fetch<any>('/api/bab', {
      method: 'POST',
      body: finalPayload
    })

    if (res.success) {
      emit('success')
      resetForm()
      emit('close')
    } else {
      alert('Gagal simpan Bab: ' + (Array.isArray(res.message) ? res.message.join(', ') : res.message))
    }

  } catch (err: any) {
    const msg = err.data?.message || err.message || 'Terjadi kesalahan'
    alert('Error: ' + msg)
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    name: '', description: '', sub_description: '', content:'',
    order: 0, isActive: true, sub_category_key: props.subcategory?._id || null,
    icon: null, image_bg: null, images: [], video_url: null, document: null,
    isFree: true, duration: 0
  }
}

const labelClass = "block text-[13px] font-semibold text-slate-700 mb-1.5 ml-0.5 tracking-tight"
const inputClass = "w-full bg-white px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm transition-all duration-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none placeholder:text-slate-400"
</script>

<template>
  <GenericModal 
    :show="show" 
    title="Tambah Bab Materi Baru" 
    :id="`Sub Kategori: ${props.subcategory?.name || 'Materi'}`"
    @close="emit('close')" 
    @confirm="handleAdd" 
    :loading="isSubmitting"
    size="3xl"
  >
    <div class="max-h-[75vh] overflow-y-auto custom-scrollbar px-1 -mx-1">
      
      <div class="mb-8">
        <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">File Materi (Video & PDF)</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <VideoPicker 
            v-model="form.video_url" 
            label="Video Materi" 
          />
          <DocumentPicker 
            v-model="form.document" 
            label="Dokumen Materi (PDF)" 
          />
        </div>

        <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">Visual Thumbnails</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload v-model="form.icon" label="Bab Icon" aspect-ratio="square" />
          <ImageUpload v-model="form.image_bg" label="Thumbnail Bab" aspect-ratio="video" />
        </div>
      </div>

      <div class="mb-8">
        <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">Informasi Bab</h3>
        <div class="space-y-5">
          <div>
            <label :class="labelClass">Judul Bab</label>
            <input v-model="form.name" type="text" :class="inputClass" placeholder="Contoh: Logika Matematika Dasar" />
          </div>

          <div>
            <label :class="labelClass">Isi Materi (Teks)</label>
            <textarea 
              v-model="form.content" 
              rows="6" 
              :class="inputClass" 
              placeholder="Tuliskan isi materi dalam bentuk teks di sini..."
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label :class="labelClass">Ringkasan (Description)</label>
              <textarea v-model="form.description" rows="3" :class="inputClass"></textarea>
            </div>
            <div>
              <label :class="labelClass">Info Tambahan (Sub Description)</label>
              <textarea v-model="form.sub_description" rows="3" :class="inputClass"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Pengaturan & Akses Bab -->

      <div class="mb-4">
        <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">Pengaturan & Akses</h3>
        
        <div class="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div class="group">
              <label :class="labelClass">Urutan Tampil</label>
              <div class="relative flex items-center">
                <input 
                  v-model.number="form.order" 
                  type="number" 
                  :class="[inputClass, 'pr-12 font-bold text-slate-700 focus:bg-white transition-all duration-300']" 
                  placeholder="0"
                />
                <div class="absolute right-4 text-[10px] font-bold text-slate-300 uppercase group-focus-within:text-blue-400 transition-colors">
                  Posisi
                </div>
              </div>
            </div>

            <div class="group">
              <div class="flex justify-between items-center mb-1.5">
                <label :class="labelClass" class="mb-0">Durasi Pengerjaan</label>
                <transition name="fade">
                  <span v-if="form.duration > 0" class="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">
                    {{ (form.duration / 60).toFixed(1) }} Jam
                  </span>
                </transition>
              </div>
              <div class="relative flex items-center">
                <input 
                  v-model.number="form.duration" 
                  type="number" 
                  class="w-full bg-white px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm transition-all duration-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none placeholder:font-normal placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />
                <div class="absolute right-4 flex items-center gap-2 pointer-events-none">
                  <span class="h-3 w-[1px] bg-slate-200 group-focus-within:bg-blue-200 transition-colors"></span>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-blue-500">Menit</span>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <label class="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl cursor-pointer hover:border-blue-200 transition-all group/status">
              <div class="flex flex-col">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status Aktif</span>
                <span class="text-[12px] text-slate-500">{{ form.isActive ? 'Publikasikan' : 'Draft' }}</span>
              </div>
              <input v-model="form.isActive" type="checkbox" class="w-6 h-6 rounded-lg accent-blue-600 cursor-pointer" />
            </label>

            <label class="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl cursor-pointer hover:border-emerald-200 transition-all group/free">
              <div class="flex flex-col">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Akses Gratis</span>
                <span class="text-[12px] text-slate-500">{{ form.isFree ? 'Tanpa Bayar' : 'Berbayar' }}</span>
              </div>
              <input v-model="form.isFree" type="checkbox" class="w-6 h-6 rounded-lg accent-emerald-500 cursor-pointer" />
            </label>
          </div>

        </div>
      </div>


      <div class="mt-8">
        <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">Galeri Gambar Pendukung</h3>
        <ImageUpload label="" v-model="form.images" multiple />
      </div>
    </div>
  </GenericModal>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e2e8f0; 
  border-radius: 100px;
}
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}
</style>