<script setup lang="ts">
import type { ICategory } from '~/types/categories'
import UpdateCategories from './components/UpdateCategories.vue'
import CreateCategories from './components/CreateCategories.vue'
import CreateSubCategories from '../sub-categories/components/CreateSubCategories.vue'

// Import komponen yang sudah dipisah
const categories = ref<ICategory[]>([])
const isLoading = ref(false)

// State untuk mengatur modal dan data yang aktif
const activeItem = ref<ICategory | null>(null)
const category = ref<ICategory | null>(null)
const showAdd = ref(false)
const showAddSub = ref(false)
const showEdit = ref(false)
const showDelete = ref(false)

const fetchCategories = async () => {
  isLoading.value = true
  try {
    const res = await $fetch<{ success: boolean; data: any }>('/api/categories')
    if (res.success) {
      // Pastikan mengambil data sesuai struktur response NestJS kamu
      categories.value = res.data?.data || res.data
    }
  } catch (error) {
    console.error('Gagal fetch:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchCategories)

// Trigger Modal
const openEdit = (item: ICategory) => {
  activeItem.value = item
  showEdit.value = true
}

const addSubCategory = (item: ICategory) => {
  category.value = item
  showAddSub.value = true
}

const openDelete = (item: ICategory) => {
  activeItem.value = item
  showDelete.value = true
}
</script>

<template>
  <div class="w-full max-w-9xl mx-auto p-4">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Kategori Utama</h1>
        <p class="text-slate-500 text-sm">Kelola kategori induk untuk semua materi simulasi.</p>
      </div>
      <button 
        @click="showAdd = true" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
      >
        + Kategori Baru
      </button>
    </div>

    <BaseTable 
      :headers="[
        { key: 'name', label: 'Nama Kategori' }, 
        { key: 'slug', label: 'Slug / URL' },
        { key: 'sub_description', label: 'Description' }
      ]"
      :items="categories"
      :child="`Sub Kategor`"
      :view="`SC`"
      :loading="isLoading"
      @edit="openEdit"
      @delete="openDelete"
      @addChild="addSubCategory"
    />

    <CreateCategories 
      :show="showAdd" 
      @close="showAdd = false" 
      @success="fetchCategories" 
    />

    <CreateSubCategories
      :show="showAddSub"
      :category="category" 
      @close="showAddSub = false" 
      @success="fetchCategories" 
    />

    <UpdateCategories 
      :show="showEdit" 
      :item="activeItem"
      @close="showEdit = false" 
      @success="fetchCategories" 
    />

    <DeletedModal
      :show="showDelete" 
      :endpoint="`/api/categories/categories?id=${activeItem?._id}`"
      :message="`Apakah anda yakin ingin menghapus kategori '${activeItem?.name}'?`"
      @close="showDelete = false" 
      @success="fetchCategories" 
    />
  </div>
</template>