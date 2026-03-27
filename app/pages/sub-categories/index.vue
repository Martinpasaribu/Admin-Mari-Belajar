<script setup lang="ts">
import UpdateCategories from './components/UpdateSubCategories.vue'
import CreateCategories from './components/CreateSubCategories.vue'
import type { ISubCategory } from '~/types/sub-categories'
import type { ICategory } from '~/types/categories'
import CreateSubCategoriesMain from './components/CreateSubCategoriesMain.vue'
import CreateBab from '../bab/components/CreateBab.vue'
import type { IBab } from '~/types/bab'

// Import komponen yang sudah dipisah
const categories = ref<ISubCategory[]>([])
const subcategory = ref<ISubCategory | null>( null)
const isLoading = ref(false)

// State untuk mengatur modal dan data yang aktif
const activeItem = ref<ISubCategory | null>(null)
const showAdd = ref(false)
const route = useRoute();
const showEdit = ref(false)
const showDelete = ref(false)
const showAddSub = ref(false)
const showAddBab = ref(false)

const CategoryFromQuery = computed(() => route.query.category as string);

const fetchSubCategories = async () => {
  isLoading.value = true
  try {
    const CatId = CategoryFromQuery.value;
    let res: any;

    if (CatId) {
      // Endpoint: Get by Category ID
      res = await $fetch<any>(`http://localhost:5002/api/v1/sub-categories/category/${CatId}`, {
        method: 'GET'
      });
    } else {
      // Endpoint: Get All
      res = await $fetch<any>('/api/sub-categories');
    }

    if (res) {

      const finalData = res.data?.sub_categories || res.data?.data || res.data || [];
      
      // Pastikan hasil akhirnya adalah array
      categories.value = Array.isArray(finalData) ? finalData : [finalData];
    }
  } catch (error) {
    console.error('Gagal fetch sub-categories:', error)
    categories.value = []; // Reset jika error
  } finally {
    isLoading.value = false
  }
}
onMounted(fetchSubCategories)

// Trigger Modal
const openEdit = (item: ISubCategory) => {
  activeItem.value = item
  showEdit.value = true
}

const openDelete = (item: ISubCategory) => {
  activeItem.value = item
  showDelete.value = true
}

const addSubCategory = () => {
  showAddSub.value = true
}

const addBab = (item: ISubCategory) => {
  subcategory.value = item
  showAddBab.value = true
}

</script>

<template>
  <div class="max-w-6xl mx-auto p-4">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Sub Category Materi</h1>
        <p class="text-slate-500 text-sm">Kelola Sub Category untuk semua materi simulasi.</p>
      </div>
      <button 
        @click="addSubCategory()" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
      >
        + Kategori Baru
      </button>
    </div>

    <BaseTable 
      :headers="[
        { key: 'name', label: 'Nama Kategori' }, 
        { key: 'slug', label: 'Slug / URL' },
        { key: 'sub_description', label: 'Description' },
        { key: 'category_key.name', label: 'Category' }
      ]"
      :items="categories"
      :child="`Bab Materi`"
      :view="`BC`"
      :loading="isLoading"
      @edit="openEdit"
      @delete="openDelete"
      @add-child="addBab"
    />

    <CreateBab
      :show="showAddBab" 
      :subcategory="subcategory"
      @close="showAddBab = false" 
      @success="fetchSubCategories" 
    />

    <UpdateCategories 
      :show="showEdit" 
      :item="activeItem"
      @close="showEdit = false" 
      @success="fetchSubCategories" 
    />

    <CreateSubCategoriesMain
      :show="showAddSub"
      @close="showAddSub = false" 
      @success="fetchSubCategories" 
    />

    <DeletedModal
      :show="showDelete" 
      :endpoint="`/api/sub-categories/sub-categories?id=${activeItem?._id}`"
      :message="`Apakah anda yakin ingin menghapus Sub kategori '${activeItem?.name}'?`"
      @close="showDelete = false" 
      @success="fetchSubCategories" 
    />
  </div>
</template>