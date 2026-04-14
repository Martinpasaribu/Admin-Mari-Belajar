<script setup lang="ts">
import { Layout, FileText, Video, FileArchive } from 'lucide-vue-next';
import ImageUpload from '~/components/shared/ImageUpload.vue';
import VideoPicker from '~/components/shared/VideoPicker.vue';
import DocumentPicker from '~/components/shared/DocumentPicker.vue';
import type { ISubCategory } from '~/types/sub-categories';
import RichEditor from '~/components/shared/RichEditor.vue';


const props = defineProps<{
  show: boolean
  item: any | null 
}>()

const emit = defineEmits(['close', 'success'])

const isSubmitting = ref(false)
const isLoadingSub = ref(false)
const subcategories = ref<ISubCategory[]>([])

const form = ref<any>({
  name: '',
  description: '',
  sub_description: '',
  content: '',
  sub_category_key: null, // Field ini harus sinkron
  order: 0,
  duration: 0,
  isActive: true,
  isFree: true,
  icon: null,
  image_bg: null,
  images: [],
  video_url: null,
  document: null
})

// SYNC DATA SAAT MODAL DIBUKA
watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchSubCategories()
    if (props.item) {
      // Lakukan Deep Copy
      const itemCopy = JSON.parse(JSON.stringify(props.item));
      
      // Pastikan sub_category_key terisi meskipun di database 
      // mungkin tersimpan dalam bentuk object (populated) atau string ID
      form.value = {
        ...itemCopy,
        sub_category_key: typeof itemCopy.sub_category_key === 'object' 
          ? itemCopy.sub_category_key?._id 
          : itemCopy.sub_category_key
      }
    }
  }
})

const fetchSubCategories = async () => {
  isLoadingSub.value = true
  try {
    const res = await $fetch<{ success: boolean; data: any }>('/api/sub-categories')
    if (res.success) {
      subcategories.value = res.data?.data || res.data || []
    }
  } catch (error) {
    console.error('Gagal fetch sub-categories:', error)
  } finally {
    isLoadingSub.value = false
  }
}

const performUpload = async (file: any, endpoint: 'upload-single' | 'upload-multiple') => {
  if (!file) return null
  const isNewFile = (f: any) => f instanceof File;

  if (Array.isArray(file)) {
    if (file.every(f => !isNewFile(f))) return file
  } else {
    if (!isNewFile(file)) return file
  }

  const formData = new FormData()
  if (Array.isArray(file)) {
    file.forEach(f => { if (isNewFile(f)) formData.append('files', f) });
  } else {
    formData.append('file', file)
  }

  try {
    const res = await $fetch<any>(`/api/media/${endpoint}`, { method: 'POST', body: formData })
    if (!res || res.success === false) throw new Error(res?.message || 'Upload gagal')
    return res.data || res 
  } catch (err: any) { throw err }
}

const handleUpdate = async () => {
  if (!props.item?._id) return
  isSubmitting.value = true
  
  try {
    // 1. Proses Upload
    const [icon, bg, doc, video] = await Promise.all([
      performUpload(form.value.icon, 'upload-single'),
      performUpload(form.value.image_bg, 'upload-single'),
      performUpload(form.value.document, 'upload-single'),
      performUpload(form.value.video_url, 'upload-single')
    ])

    let gallery = []
    if (form.value.images?.length) {
      gallery = await performUpload(form.value.images, 'upload-multiple')
    }

    // 2. Bersihkan Payload
    const rawData = { ...form.value }
    const forbiddenFields = ['_id', 'id', 'createdAt', 'updatedAt', '__v', 'slug']
    forbiddenFields.forEach(field => delete rawData[field])

    const finalPayload = {
      ...rawData,
      order: Number(rawData.order) || 0,
      sub_category_key: form.value.sub_category_key, // Memastikan key ini terkirim
      icon,
      image_bg: bg,
      document: doc,
      video_url: video,
      images: gallery
    }

    // 3. Eksekusi ke API (Sesuai diagnosa sebelumnya, kirim ID via query untuk diproses proxy)
    const res = await $fetch<any>(`/api/bab/bab`, {
      method: 'PATCH',
      query: { id: props.item._id },
      body: finalPayload
    })

    if (res && res.success !== false) {
      emit('success')
      emit('close')
    } else {
      alert(res?.message || 'Gagal update')
    }
  } catch (err: any) {
    alert('Update Error: ' + (err.data?.message || err.message))
  } finally {
    isSubmitting.value = false
  }
}

const labelClass = "block text-[11px] font-bold text-slate-500 mb-1.5 ml-0.5 uppercase tracking-widest"
const inputClass = "w-full bg-white px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
</script>

<template>
  <GenericModal 
    :show="show" 
    title="Update Bab Materi" 
    :id="`ID: ${props.item?._id || '-'}`"
    @close="emit('close')" 
    @confirm="handleUpdate" 
    :loading="isSubmitting"
    size="3xl"
  >
    <div class="max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">
      
      <div class="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
        <div class="flex items-center gap-2 mb-4">
          <Video class="w-4 h-4 text-blue-500" />
          <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Video & Dokumen</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <VideoPicker v-model="form.video_url" label="Update Video Materi" />
          <DocumentPicker v-model="form.document" label="Update Dokumen PDF" />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 pt-6">
          <ImageUpload v-model="form.icon" label="Update Bab Icon" aspect-ratio="square" />
          <ImageUpload v-model="form.image_bg" label="Update Thumbnail" aspect-ratio="video" />
        </div>
      </div>

      <div class="space-y-6">
        <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
          <FileText class="w-4 h-4 text-blue-500" />
          <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Detail Materi</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label :class="labelClass">Sub Kategori</label>
            <select v-model="form.sub_category_key" :class="inputClass" :disabled="isLoadingSub">
              <option :value="null" disabled>-- Pilih Sub Kategori --</option>
              <option v-for="sub in subcategories" :key="sub._id" :value="sub._id">
                {{ sub.name }}
              </option>
            </select>
          </div>
          <div>
            <label :class="labelClass">Judul Bab</label>
            <input v-model="form.name" type="text" :class="inputClass" />
          </div>
        </div>

        <div>
          <label :class="labelClass">Isi Materi (Content)</label>
          <!-- <textarea v-model="form.content" rows="6" :class="inputClass"></textarea> -->
                       
          <ClientOnly>
              <RichEditor v-model="form.content" />
              <template #fallback>
                <div class="h-[250px] w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
                  <span class="text-xs text-slate-400 font-medium">Memuat Editor...</span>
                </div>
              </template>
            </ClientOnly>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label :class="labelClass">Main Description</label>
            <!-- <textarea v-model="form.description" rows="3" :class="inputClass"></textarea> -->
                         
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
            <!-- <textarea v-model="form.sub_description" rows="3" :class="inputClass"></textarea> -->
                           
            <ClientOnly>
                <RichEditor v-model="form.sub_description" />
                <template #fallback>
                  <div class="h-[250px] w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
                    <span class="text-xs text-slate-400 font-medium">Memuat Editor...</span>
                  </div>
                </template>
              </ClientOnly>
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

        <div class="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label :class="labelClass">Urutan</label>
            <input v-model.number="form.order" type="number" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Harga</label>
            <input v-model.number="form.price" type="number" :class="inputClass" />
          </div>
          <div class="flex items-center justify-around bg-white rounded-xl border border-blue-100 p-2 shadow-sm">
            <div class="flex flex-col items-center">
              <span class="text-[9px] font-black text-slate-400 uppercase">Aktif</span>
              <input v-model="form.isActive" type="checkbox" class="w-5 h-5 accent-blue-600" />
            </div>
            <div class="flex flex-col items-center">
              <span class="text-[9px] font-black text-slate-400 uppercase">Gratis</span>
              <input v-model="form.isFree" type="checkbox" class="w-5 h-5 accent-emerald-500" />
            </div>
          </div>
        </div>

        <div class="pt-4">
          <label :class="labelClass">Galeri Pendukung</label>
          <ImageUpload v-model="form.images" multiple label="" />
        </div>
      </div>
    </div>
  </GenericModal>
</template>