<script setup lang="ts">
import type { IBab } from '~/types/bab';
import CreateQuestions from './components/CreateQuestions.vue';
import type { IQuestion } from '~/types/questions';

const { goToQuestionDetail } = useAppNavigation()

const route = useRoute();
const questions = ref<IQuestion[]>([]);
const bab = ref<any>();
const isLoading = ref(false);

const activeItem = ref<IQuestion | null>(null);
const showAdd = ref(false);
const showDelete = ref(false);

// Mengambil bab_id dari URL (akan kosong/null jika di halaman index biasa)
const babIdFromQuery = computed(() => route.query.bab_id as string);

const goToEdit = (id: string) => {
  // Arahkan ke halaman edit jika ada
  navigateTo(`/questions/components/edit/${id}`);
};

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

      res = await $fetch<IQuestion[]>(`${Base_url}/bab/questions/admin/${bab_id}`, {
        method: 'GET'
      });

      questions.value = Array.isArray(res.data.question_keys) ? res.data.question_keys : [];
      
    } else {
      // Fetch semua pertanyaan
      res = await $fetch<IQuestion[]>(`${Base_url}/questions/all`, {
        method: 'GET'
      });
      questions.value = Array.isArray(res.data.questions) ? res.data.questions : [];

    }
     bab.value = res.data.name
     
    // bab.value = Array.isArray(res.data.bab) ? res.data.bab : [];
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
  <div class="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
    
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
      <div class="flex-1">
        <div class="flex flex-wrap items-center gap-2 mb-2">
          <h1 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase italic">
            {{ babIdFromQuery ? 'Daftar Soal Bab' : 'Semua Pertanyaan' }}
          </h1>
          <span v-if="babIdFromQuery" class="bg-blue-100 text-blue-700 text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border border-blue-200">
            {{ bab }}
          </span>
        </div>
        <p class="text-slate-500 text-xs md:text-sm font-medium leading-relaxed max-w-2xl">
          {{ babIdFromQuery ? 'Menampilkan pertanyaan khusus untuk bab yang Anda pilih.' : 'Kelola seluruh database pertanyaan dari semua materi.' }}
        </p>
      </div>

      <div class="flex flex-col xs:flex-row gap-3">
        <button 
          v-if="babIdFromQuery"
          @click="viewAll"
          class="w-full xs:w-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
        >
          <span>← Lihat Semua</span>
        </button>

        <button 
          @click="showAdd = true" 
          class="w-full xs:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size="18" />
          Soal Baru
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-dark-bg2 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden">
      
      <div class="overflow-x-auto overflow-y-hidden">
        <BaseTable 
          :headers="[
            { key: 'order', label: 'No' },
            { key: 'question_text', label: 'Isi Pertanyaan' }, 
            { key: 'code', label: 'Code' }, 
            { key: 'bab_key.name', label: 'Bab' }, 
            { key: 'type', label: 'Tipe' },
            { key: 'isActive', label: 'Status' }
          ]"
          :items="questions"
          :child="'aa'"
          :view="`S`"
          @detail="(item: { _id: string; }) => goToQuestionDetail(item._id)"
          :loading="isLoading"
          @edit="(item) => goToEdit(item._id)" 
          @delete="openDelete"
          class="min-w-[800px] w-full"
        />
      </div>
      
      <div v-if="!isLoading && questions.length === 0" class="p-20 text-center">
        <div class="flex flex-col items-center gap-3">
          <HelpCircle class="text-slate-200" size="48" />
          <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Tidak ada pertanyaan ditemukan
          </p>
        </div>
      </div>
    </div>

    <CreateQuestions 
      v-if="showAdd"
      :bab="{_id: babIdFromQuery}"
      :show="showAdd" 
      :initial-bab-id="babIdFromQuery"
      @close="showAdd = false" 
      @success="fetchQuestions" 
    />

    <DeletedModal
      v-if="showDelete"
      :show="showDelete" 
      :endpoint="`${Base_url}/questions/${activeItem?._id}`"
      :message="`Hapus soal nomor ${activeItem?.order}? Tindakan ini tidak dapat dibatalkan.`"
      @close="showDelete = false" 
      @success="fetchQuestions" 
    />
  </div>
</template>

