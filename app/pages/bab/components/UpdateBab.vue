
<script setup lang="ts">

import { Layout, FileText, Video, FileArchive, Plus, Trash2} from 'lucide-vue-next';
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
  section: [],
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

// Fungsi untuk menambah section baru
const addSection = () => {
  const nextLabel = String.fromCharCode(65 + (form.value.section?.length || 0)); // A, B, C...
  if (!form.value.section) form.value.section = [];
  
  form.value.section.push({
    label: nextLabel,
    name: '',
    // Properti 'code' akan di-generate otomatis oleh backend/generator Anda
  });
};

// Fungsi untuk menghapus section
const removeSection = (index: number) => {
  form.value.section.splice(index, 1);
  // Re-order label A, B, C jika diperlukan
  form.value.section.forEach((sec: any, i: number) => {
    sec.label = String.fromCharCode(65 + i);
  });
};

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
     
        <div class="pt-6 border-t border-slate-100 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Layout class="w-4 h-4 text-blue-500" />
              <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Daftar Section (Bagian)
              </h3>
            </div>
            <button 
              type="button"
              @click="addSection" 
              class="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
            >
              <Plus :size="12" /> Tambah Section
            </button>
          </div>

          <div v-if="form.section && form.section.length > 0" class="space-y-3">
            <div 
              v-for="(sec, index) in form.section" 
              :key="index"
              class="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 group"
            >
              <div class="w-8 h-8 shrink-0 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-xs font-black text-blue-600 shadow-sm">
                {{ sec.label }}
              </div>

              <div class="flex-1">
                <input 
                  v-model="sec.name" 
                  type="text" 
                  placeholder="Contoh: Reading, Listening, atau Grammar"
                  class="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-300"
                />
              </div>

              <div v-if="sec.code" class="px-2 py-1 bg-slate-200 rounded-md text-[9px] font-bold text-slate-500 uppercase">
                Code: {{ sec.code }}
              </div>

              <button 
                type="button"
                @click="removeSection(index)"
                class="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 :size="16" />
              </button>
            </div>
          </div>

          <div v-else class="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
            <p class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Belum ada section ditambahkan</p>
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