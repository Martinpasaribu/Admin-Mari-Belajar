<script setup lang="ts">
import { Layout, FileText, ListTree } from 'lucide-vue-next';
import ImageUpload from '~/components/shared/ImageUpload.vue';
import type { ICategory } from '~/types/categories';
import type { ISubCategory } from '~/types/sub-categories';
import RichEditor from '~/components/shared/RichEditor.vue';



const props = defineProps<{
  show: boolean
  item: ISubCategory | null
}>()

const emit = defineEmits(['close', 'success'])

const isSubmitting = ref(false)
const isLoadingCat = ref(false)
const categories = ref<ICategory[]>([])

const form = ref<any>({
  name: '',
  description: '',
  sub_description: '',
  category_key: null, // Penting untuk relasi ke kategori utama
  order: 0,
  isActive: true,
  icon: null,
  image_bg: null,
  images: []
})

// Fungsi ambil data kategori untuk dropdown
const fetchCategories = async () => {
  isLoadingCat.value = true
  try {
    const res = await $fetch<{ success: boolean; data: any }>('/api/categories')
    if (res.success) {
      categories.value = res.data?.data || res.data || []
    }
  } catch (error) {
    console.error('Gagal fetch categories:', error)
  } finally {
    isLoadingCat.value = false
  }
}

// Sync data saat modal dibuka
watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchCategories() // Refresh list kategori setiap buka modal
    if (props.item) {
      const itemCopy = JSON.parse(JSON.stringify(props.item));
      form.value = {
        ...itemCopy,
        // Pastikan category_key terisi ID-nya saja jika data aslinya berupa object populated
        category_key: typeof itemCopy.category_key === 'object' 
          ? itemCopy.category_key?._id 
          : itemCopy.category_key
      };
    }
  }
})

const performUpload = async (file: any, endpoint: 'upload-single' | 'upload-multiple') => {
  if (!file) return null;
  const isNewFile = (f: any) => f instanceof File;

  if (Array.isArray(file)) {
    if (file.every(f => !isNewFile(f))) return file;
  } else {
    if (!isNewFile(file)) return file;
  }

  const formData = new FormData();
  if (Array.isArray(file)) {
    file.forEach(f => { if (isNewFile(f)) formData.append('files', f) });
  } else {
    formData.append('file', file);
  }

  try {
    const res = await $fetch<any>(`/api/media/${endpoint}`, { method: 'POST', body: formData });
    if (!res || res.success === false) throw new Error(res?.message || 'Gagal upload');
    return res.data || res; 
  } catch (err: any) {
    throw err;
  }
}

const handleUpdate = async () => {
  if (!props.item?._id) return
  if (!form.value.category_key) return alert('Silahkan pilih kategori utama')
  
  isSubmitting.value = true
  try {
    const [uploadedIcon, uploadedBg] = await Promise.all([
      performUpload(form.value.icon, 'upload-single'),
      performUpload(form.value.image_bg, 'upload-single')
    ])

    let uploadedGallery = []
    if (form.value.images?.length) {
      uploadedGallery = await performUpload(form.value.images, 'upload-multiple')
    }

    const rawData = { ...form.value }
    // Hapus field yang tidak boleh di-update langsung atau field metadata
    const forbidden = ['_id', 'id', 'createdAt', 'updatedAt', '__v', 'slug']
    forbidden.forEach(f => delete rawData[f])

    const finalPayload = {
      ...rawData,
      icon: uploadedIcon,
      image_bg: uploadedBg,
      images: uploadedGallery
    }

    const res = await $fetch<any>(`/api/sub-categories/sub-categories`, {
      method: 'PATCH',
      query: { id: props.item._id },
      body: finalPayload
    })

    if (res && res.success !== false) {
      emit('success')
      emit('close')
    } else {
      alert(res?.message || 'Gagal memperbarui')
    }
  } catch (err: any) {
    const msg = err.data?.message || err.statusMessage || 'Terjadi kesalahan'
    alert('Update Error: ' + (Array.isArray(msg) ? msg.join(', ') : msg))
  } finally {
    isSubmitting.value = false
  }
}

const labelClass = "block text-[11px] font-bold text-slate-500 mb-1.5 ml-0.5 uppercase tracking-widest"
const inputClass = "w-full bg-white px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none disabled:bg-slate-50"
</script>

<template>
  <GenericModal 
    :show="show" 
    title="Update Sub Kategori" 
    :id="`ID: ${props.item?._id || '-'}`"
    @close="emit('close')" 
    @confirm="handleUpdate" 
    :loading="isSubmitting"
    size="3xl"
  >
    <div class="max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">
      <div class="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
        <div class="flex items-center gap-2 mb-4">
          <Layout class="w-4 h-4 text-blue-500" />
          <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Visual Assets</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload v-model="form.icon" label="Icon Sub-Kategori" aspect-ratio="square" />
          <ImageUpload v-model="form.image_bg" label="Cover Background" aspect-ratio="video" />
        </div>
      </div>

      <div class="space-y-6">
        <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
          <ListTree class="w-4 h-4 text-blue-500" />
          <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Struktur & Informasi</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label :class="labelClass">Pilih Kategori Utama</label>
            <select v-model="form.category_key" :class="inputClass" :disabled="isLoadingCat">
              <option :value="null" disabled>{{ isLoadingCat ? 'Memuat...' : '-- Pilih Kategori --' }}</option>
              <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div>
            <label :class="labelClass">Nama Sub Kategori</label>
            <input v-model="form.name" type="text" :class="inputClass" placeholder="Contoh: UTUL UGM" />
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

        <div class="flex items-center justify-between p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
          <div class="flex items-center gap-6">
            <div>
              <label :class="labelClass">Urutan Tampil</label>
              <input v-model.number="form.order" type="number" class="w-24 px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />
            </div>
            <div class="h-10 w-px bg-blue-200"></div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-slate-700">Status Aktif</span>
              <span class="text-[10px] text-slate-500 italic">Muncul di halaman aplikasi</span>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="form.isActive" type="checkbox" class="sr-only peer" />
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div class="pt-4">
          <label :class="labelClass">Galeri Gambar (Opsional)</label>
          <ImageUpload v-model="form.images" multiple label="" />
        </div>
      </div>
    </div>
  </GenericModal>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>