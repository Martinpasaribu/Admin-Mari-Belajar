<script setup lang="ts">
import { Layout, FileText, Save, X } from 'lucide-vue-next';
import type { ICategory } from '~/types/categories';
import ImageUpload from '~/components/shared/ImageUpload.vue';

const props = defineProps<{
  show: boolean
  item: ICategory | null
}>()

const emit = defineEmits(['close', 'success'])
const isSubmitting = ref(false)

// Inisialisasi form dengan struktur lengkap
const form = ref<any>({
  name: '',
  description: '',
  sub_description: '',
  order: 0,
  isActive: true,
  icon: null,
  image_bg: null,
  images: []
})

// Sync data saat modal dibuka
watch(() => props.item, (newVal) => {
  if (newVal) {
    form.value = JSON.parse(JSON.stringify(newVal)); // Deep copy agar tidak merubah data di table langsung
  }
}, { immediate: true })

// Helper performUpload yang kita buat sebelumnya (Pastikan tersedia di scope ini)
const performUpload = async (file: any, endpoint: 'upload-single' | 'upload-multiple') => {
  // 1. Jika data kosong, kembalikan null
  if (!file) return null;

  // 2. Jika data adalah object lama (punya url) dan BUKAN File biner, 
  // kembalikan langsung (jangan diupload lagi)
  const isNewFile = (f: any) => f instanceof File;

  if (Array.isArray(file)) {
    // Jika semua item gallery sudah berupa object lama (bukan file baru)
    if (file.every(f => !isNewFile(f))) return file;
  } else {
    // Jika icon/bg bukan file baru
    if (!isNewFile(file)) return file;
  }

  // 3. Jika ada file baru, lakukan upload
  const formData = new FormData();
  if (Array.isArray(file)) {
    file.forEach(f => { if (isNewFile(f)) formData.append('files', f) });
  } else {
    formData.append('file', file);
  }

  try {
    const res = await $fetch<any>(`/api/media/${endpoint}`, { 
      method: 'POST', 
      body: formData 
    });

    // Pastikan res tidak null dan ambil datanya
    if (!res || res.success === false) {
      throw new Error(res?.message || 'Gagal upload ke server');
    }

    // Kembalikan data dari server (biasanya res.data berisi {url, fileId})
    return res.data || res; 
  } catch (err: any) {
    console.error("Upload failed:", err);
    throw err; // Lempar agar handleUpdate masuk ke blok catch
  }
}

const handleUpdate = async () => {
  if (!props.item?._id) return
  isSubmitting.value = true
  
  try {
    // 1. Proses Upload Aset Baru
    const [uploadedIcon, uploadedBg] = await Promise.all([
      performUpload(form.value.icon, 'upload-single'),
      performUpload(form.value.image_bg, 'upload-single')
    ])

    let uploadedGallery = []
    if (form.value.images?.length) {
      uploadedGallery = await performUpload(form.value.images, 'upload-multiple')
    }

    // 2. Susun Payload - BUANG field yang tidak boleh diubah/id ganda
    // Kita buat copy dan hapus field yang bisa bikin Mongoose error
    const rawData = { ...form.value }
    delete rawData._id
    delete rawData.id
    delete rawData.createdAt
    delete rawData.updatedAt
    delete rawData.__v

    const finalPayload = {
      ...rawData,
      icon: uploadedIcon,
      image_bg: uploadedBg,
      images: uploadedGallery
    }

    // 3. Kirim ke API Proxy Nuxt
    const res = await $fetch<any>(`/api/categories/categories`, {
      method: 'PATCH',
      query: { id: props.item._id }, // Gunakan query parameter sesuai handler server
      body: finalPayload
    })

    // Pastikan 'res' ada sebelum akses .success
    if (res && res.success !== false) {
      emit('success')
      emit('close')
    } else {
      alert(res?.message || 'Gagal memperbarui: Response tidak valid')
    }
  } catch (err: any) {
    // Menangkap error dari 'throw createError' di server/api
    const errorMessage = err.data?.message || err.statusMessage || 'Terjadi kesalahan saat update'
    alert('Update Error: ' + errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

const labelClass = "block text-[12px] font-bold text-slate-600 mb-1.5 ml-0.5 uppercase tracking-wide"
const inputClass = "w-full bg-white px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
</script>

<template>
  <GenericModal 
    :show="show" 
    title="Update Category" 
    @close="emit('close')" 
    @confirm="handleUpdate" 
    :loading="isSubmitting"
    size="2xl"
  >
    <div class="max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
      <div class="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div class="flex items-center gap-2 mb-4">
          <Layout class="w-4 h-4 text-blue-500" />
          <h3 class="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Visual Assets</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload v-model="form.icon" label="Category Icon" aspect-ratio="square" />
          <ImageUpload v-model="form.image_bg" label="Cover Background" aspect-ratio="video" />
        </div>
      </div>

      <div class="space-y-5">
        <div class="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
          <FileText class="w-4 h-4 text-blue-500" />
          <h3 class="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Information</h3>
        </div>
        
        <div>
          <label :class="labelClass">Category Name</label>
          <input v-model="form.name" type="text" :class="inputClass" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label :class="labelClass">Main Description</label>
            <textarea v-model="form.description" rows="3" :class="inputClass"></textarea>
          </div>
          <div>
            <label :class="labelClass">Sub Description</label>
            <textarea v-model="form.sub_description" rows="3" :class="inputClass"></textarea>
          </div>
        </div>

        <div class="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
          <div class="flex items-center gap-4">
            <div>
              <label :class="labelClass">Order</label>
              <input v-model="form.order" type="number" class="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div class="h-10 w-px bg-blue-200 mx-2"></div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-slate-700">Status Aktif</span>
              <span class="text-[10px] text-slate-500">Kategori dapat dilihat publik</span>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="form.isActive" type="checkbox" class="sr-only peer" />
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div class="pt-4">
          <label :class="labelClass">Gallery Images</label>
          <ImageUpload v-model="form.images" multiple label="" />
        </div>
      </div>
    </div>
  </GenericModal>
</template>