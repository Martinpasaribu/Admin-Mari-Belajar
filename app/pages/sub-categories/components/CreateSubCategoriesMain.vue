<script setup lang="ts">
import type { ICategory, MediaObject } from '~/types/categories'
import ImageUpload from '~/components/shared/ImageUpload.vue'
import type { ISubCategory } from '~/types/sub-categories'
import RichEditor from '~/components/shared/RichEditor.vue';



type CreateSubCategoryForm = {
  name: string
  description: string
  category_key: string | null
  sub_description: string
  isFree?: boolean
  price?: number
  discountPrice?: number
  accessDurationDays?: number
  order: number
  isActive: boolean
  icon: any | null 
  image_bg: any | null
  images: any[]
}

const props = defineProps<{ 
  show: boolean,
}>()

const emit = defineEmits(['close', 'success'])

const isLoading = ref(false)
const isSubmitting = ref(false)
const categories = ref<ICategory[]>([]) // State untuk menampung data kategori utama

const form = ref<CreateSubCategoryForm>({
  name: '', 
  description: '', 
  sub_description: '',
  order: 0, 
  isActive: true,
  icon: null, 
  image_bg: null, 
  images: [],
  category_key: null, // Sekarang defaultnya null, dipilih via dropdown
  isFree: true,
  price: 0,
  discountPrice: 0,
  accessDurationDays: 360
})

// Fungsi Helper Upload (Tetap sama)
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
    const res = await $fetch<any>(`/api/media/${endpoint}`, { method: 'POST', body: formData })
    if (res.success === false) throw new Error(Array.isArray(res.message) ? res.message.join(', ') : res.message)
    return res.data || res 
  } catch (err: any) {
    throw err
  }
}

// Tarik Data Kategori Utama untuk Dropdown
const fetchCategories = async () => {
  isLoading.value = true
  try {
    // Sesuaikan endpoint ini dengan API kategori utama kamu
    const res = await $fetch<{ success: boolean; data: any }>('/api/categories')
    if (res.success) {
      categories.value = res.data?.data || res.data
    }
  } catch (error) {
    console.error('Gagal fetch kategori:', error)
  } finally {
    isLoading.value = false
  }
}

// Panggil fetch setiap kali modal dibuka
watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchCategories()
  }
})

const handleAdd = async () => {
  if (!form.value.name) return alert('Nama wajib diisi')
  if (!form.value.category_key) return alert('Silahkan pilih kategori utama')
  
  isSubmitting.value = true
  try {
    const [uploadedIcon, uploadedBg] = await Promise.all([
      performUpload(form.value.icon, 'upload-single'),
      performUpload(form.value.image_bg, 'upload-single')
    ])

    let uploadedGallery: MediaObject[] = []
    if (form.value.images?.length > 0) {
      uploadedGallery = await performUpload(form.value.images, 'upload-multiple')
    }

    // --- PROSES SANITASI DATA ANGKA ---
    const finalPayload = {
      ...form.value,
      // Jika kosong (""), paksa jadi 0 agar tetap tipe Number
      price: form.value.price || 0,
      discountPrice: form.value.discountPrice || 0,
      order: form.value.order || 0,
      
      icon: uploadedIcon,
      image_bg: uploadedBg,
      images: uploadedGallery
    }

    const res = await $fetch<any>('/api/sub-categories', {
      method: 'POST',
      body: finalPayload
    })

    if (res.success) {
      emit('success')
      resetForm()
      emit('close')
    } else {
      alert('Gagal simpan: ' + (Array.isArray(res.message) ? res.message.join(', ') : res.message))
    }
  } catch (err: any) {
    alert('Error: ' + (err.data?.message || err.message))
  } finally {
    isSubmitting.value = false
  }
}
const resetForm = () => {
  form.value = {
    name: '', description: '', sub_description: '',
    order: 0, isActive: true, category_key: null,
    icon: null, image_bg: null, images: [],
    isFree: true, price: 0, discountPrice: 0, accessDurationDays: 360
  }
}

const labelClass = "block text-[13px] font-semibold text-slate-700 mb-1.5 ml-0.5 tracking-tight"
const inputClass = "w-full bg-white px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm transition-all duration-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
</script>

<template>
  <GenericModal 
    :show="show" 
    title="Tambah Sub Kategori" 
    id="Sub Category Management"
    @close="emit('close')" 
    @confirm="handleAdd" 
    :loading="isSubmitting"
    size="2xl"
  >
    <div class="max-h-[75vh] overflow-y-auto custom-scrollbar px-1 -mx-1">
      <div class="mb-8">
        <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">Visual Assets</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload v-model="form.icon" label="Category Icon" aspect-ratio="square" />
          <ImageUpload v-model="form.image_bg" label="Cover Background" aspect-ratio="video" />
        </div>
      </div>

      <div class="mb-8">
        <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">General Information</h3>
        <div class="space-y-5">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label :class="labelClass">Select Parent Category</label>
              <select 
                v-model="form.category_key" 
                :class="inputClass"
                :disabled="isLoading"
              >
                <option :value="null" disabled>{{ isLoading ? 'Loading...' : 'Choose a Category' }}</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div>
              <label :class="labelClass">Category Name</label>
              <input v-model="form.name" type="text" :class="inputClass" placeholder="e.g. UTUL UGM" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label :class="labelClass">Price</label>
              <input v-model.number="form.price" type="number" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Discount Price</label>
              <input v-model.number="form.discountPrice" type="number" :class="inputClass" />
            </div>
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

        </div>
      </div>

      <div class="mb-4">
        <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">Configuration</h3>
        <div class="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-6">
          <div class="flex-1 min-w-[150px]">
            <label :class="labelClass">Display Order</label>
            <input v-model.number="form.order" type="number" class="w-32 bg-white px-4 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div class="flex items-center gap-6">
             <div class="flex flex-col items-end">
               <span class="text-[13px] font-semibold text-slate-700">Active</span>
               <input v-model="form.isActive" type="checkbox" />
             </div>
             <div class="flex flex-col items-end">
               <span class="text-[13px] font-semibold text-slate-700">Free</span>
               <input v-model="form.isFree" type="checkbox" />
             </div>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">Gallery Images</h3>
        <ImageUpload v-model="form.images" multiple label="" />
      </div>
    </div>
  </GenericModal>
</template>