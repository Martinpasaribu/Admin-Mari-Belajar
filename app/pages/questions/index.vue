<script setup lang="ts">
import CreateQuestions from './components/CreateQuestions.vue';
import type { IQuestion } from '~/types/questions';

const { goToQuestionDetail } = useAppNavigation()

const route = useRoute();
const questions = ref<IQuestion[]>([]);
const isLoading = ref(false);

const activeItem = ref<IQuestion | null>(null);
const showAdd = ref(false);
const showDelete = ref(false);

// Mengambil bab_id dari URL (akan kosong/null jika di halaman index biasa)
const babIdFromQuery = computed(() => route.query.bab_id as string);

const fetchQuestions = async () => {
  isLoading.value = true;
  try {
    // Siapkan objek query
    const queryParams: any = {};
    
    let res : any;

    // HANYA masukkan bab_id jika memang ada isinya di URL
    if (babIdFromQuery.value) {
      // Gunakan ID langsung dari computed babIdFromQuery
      const bab_id = babIdFromQuery.value;

      res = await $fetch<IQuestion[]>(`http://localhost:5002/api/v1/bab/questions/admin/${bab_id}`, {
        method: 'GET'
      });

    
    } else {
      // Fetch semua pertanyaan
      res = await $fetch<IQuestion[]>('http://localhost:5002/api/v1/questions/all', {
        method: 'GET'
      });
    }

    questions.value = Array.isArray(res.data.questions) ? res.data.questions : [];
  } catch (error) {
    console.error('Gagal fetch:', error);
    questions.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Pantau perubahan URL (misal: user klik dari "Semua" ke "Bab A")
watch(() => route.query.bab_id, fetchQuestions);

onMounted(fetchQuestions);

// Action handlers
const openDelete = (item: IQuestion) => {
  activeItem.value = item;
  showDelete.value = true;
};

const viewAll = () => {
  navigateTo('/questions');
};
</script>


<template>
  <div class="w-full max-w-9xl mx-auto p-4">
    
    <div class="flex justify-between items-start mb-8">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
            {{ babIdFromQuery ? 'Daftar Soal Bab' : 'Semua Pertanyaan' }}
          </h1>
          <span v-if="babIdFromQuery" class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider">
            Filter Terpasang
          </span>
        </div>
        <p class="text-slate-500 text-sm">
          {{ babIdFromQuery ? 'Menampilkan pertanyaan khusus untuk bab yang Anda pilih.' : 'Kelola seluruh database pertanyaan dari semua materi.' }}
        </p>
      </div>

      <div class="flex gap-3">
        <button 
          v-if="babIdFromQuery"
          @click="viewAll"
          class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-sm"
        >
          <span>← Lihat Semua Soal</span>
        </button>

        <button 
          @click="showAdd = true" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          + Soal Baru
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

      <BaseTable 
        :headers="[
          { key: 'order', label: 'No' },
          { key: 'question_text', label: 'Isi Pertanyaan' }, 
          { key: 'type', label: 'Tipe' },
          { key: 'isActive', label: 'Status' }
        ]"
        :items="questions"
        :child="'aa'"
        :view="`S`"
        @detail="(item: { _id: string; }) => goToQuestionDetail(item._id)"
        :loading="isLoading"
        @edit="(item) => openEdit(item)" 
        @delete="openDelete"
      />
      
      <div v-if="!isLoading && questions.length === 0" class="p-10 text-center text-slate-400">
        Tidak ada pertanyaan ditemukan.
      </div>
    </div>

    <CreateQuestions 
      v-if="showAdd"
      :show="showAdd" 
      :initial-bab-id="babIdFromQuery"
      @close="showAdd = false" 
      @success="fetchQuestions" 
    />

    <DeletedModal
      v-if="showDelete"
      :show="showDelete" 
      :endpoint="`http://localhost:5002/api/v1/questions/${activeItem?._id}`"
      :message="`Hapus soal nomor ${activeItem?.order}? Tindakan ini tidak dapat dibatalkan.`"
      @close="showDelete = false" 
      @success="fetchQuestions" 
    />
  </div>
</template>

