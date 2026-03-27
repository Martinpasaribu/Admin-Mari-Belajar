<script setup lang="ts">
import CreateCategories from './components/CreateBab.vue'
import type { ISubCategory } from '~/types/sub-categories'
import type { ICategory } from '~/types/categories'
import CreateBabMain from './components/CreateBabMain.vue'
import UpdateBab from './components/UpdateBab.vue'
import CreateQuestions from '../questions/components/CreateQuestions.vue'
import type { IBab } from '~/types/bab'

// Import komponen yang sudah dipisah
const categories = ref<ISubCategory[]>([])
const isLoading = ref(false)

// State untuk mengatur modal dan data yang aktif
const activeItem = ref<ISubCategory | null>(null)
const showAdd = ref(false)
const route = useRoute();
const showEdit = ref(false)
const showDelete = ref(false)
const showAddBab = ref(false)
const showAddQuestion = ref(false)
const bab = ref<IBab | null>(null)

const subCategoryFromQuery = computed(() => route.query.sub_category as string);


const fetchBab = async () => {
  isLoading.value = true
  try {
    const subCatId = subCategoryFromQuery.value;
    let res: any;

    if (subCatId) {
      // Endpoint: Get Bab by SubCategory ID
      res = await $fetch<any>(`http://localhost:5002/api/v1/bab/${subCatId}/sub_category`, {
        method: 'GET'
      });
    } else {
      // Endpoint: Get All Bab (Internal API Nuxt)
      res = await $fetch<any>('/api/bab');
    }

    if (res) {
      /**
       * NORMALISASI DATA BAB:
       * 1. Cek res.data.bab (Struktur umum NestJS)
       * 2. Cek res.bab (Jika response langsung mengembalikan objek bab)
       * 3. Cek res.data (Jika response all bab langsung di dalam data)
       * 4. Gunakan array kosong [] sebagai pelindung terakhir.
       */
      const rawData = res.data?.bab || res.bab || res.data || [];

      // Pastikan hasil akhirnya selalu Array agar v-for tidak error
      categories.value = Array.isArray(rawData) ? rawData : [rawData];
    }
  } catch (error) {
    console.error('Gagal fetch Bab:', error);
    categories.value = []; // Reset ke array kosong jika error
  } finally {
    isLoading.value = false;
  }
}
onMounted(fetchBab)

// Trigger Modal
const openEdit = (item: ISubCategory) => {
  activeItem.value = item
  showEdit.value = true
}

const openDelete = (item: ISubCategory) => {
  activeItem.value = item
  showDelete.value = true
}

const addBab = () => {
  showAddBab.value = true
}

const addQuestion = (item: IBab) => {
  bab.value = item
  showAddQuestion.value = true
}


</script>

<template>
  <div class="max-w-6xl mx-auto p-4">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Bab Materi</h1>
        <p class="text-slate-500 text-sm">Kelola Bab induk untuk semua materi simulasi.</p>
      </div>
      <button 
        @click="addBab()" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
      >
        + Bab Baru
      </button>
    </div>

    <BaseTable 
      :headers="[
        { key: 'name', label: 'Nama Bab' }, 
        { key: 'slug', label: 'Slug / URL' },
        { key: 'sub_description', label: 'Description' },
        { key: 'sub_category_key.name', label: 'SubCategory' }
      ]"
      :items="categories"
      :child="`Soal`"
      :view="`SB`"
      :loading="isLoading"
      @edit="openEdit"
      @delete="openDelete"
      @addChild="addQuestion"
    />



    <UpdateBab 
      :show="showEdit" 
      :item="activeItem"
      @close="showEdit = false" 
      @success="fetchBab" 
    />

    <CreateBabMain
      :show="showAddBab"
      @close="showAddBab = false" 
      @success="fetchBab" 
    />

    <CreateQuestions
      :show="showAddQuestion"
      :bab="bab"
      @close="showAddQuestion = false" 
      @success="fetchBab" 
    />

    <DeletedModal
      :show="showDelete" 
      :endpoint="`/api/bab/bab?id=${activeItem?._id}`"
      :message="`Apakah anda yakin ingin menghapus Bab '${activeItem?.name}'?`"
      @close="showDelete = false" 
      @success="fetchBab" 
    />
  </div>
</template>