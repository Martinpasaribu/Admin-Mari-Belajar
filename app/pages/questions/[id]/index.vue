<template>
  <div class="w-full max-w-5xl mx-auto p-6">
    
    <div class="flex justify-between items-center mb-6">
      <button @click="$router.back()" class="text-slate-500 hover:text-slate-700 flex items-center gap-2">
        ← Kembali ke Daftar
      </button>
      <div class="flex gap-2">
        <span :class="question?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="px-3 py-1 rounded-full text-xs font-bold">
          {{ question?.isActive ? 'Aktif' : 'Non-Aktif' }}
        </span>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center p-20">
      <span class="animate-spin text-blue-600 text-4xl">Loading...</span>
    </div>

    <div v-else-if="question" class="grid grid-cols-1 lg:grid-cols-3 gap-8">     
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div class="flex items-center justify-between gap-3 mb-4">
            <div>
              <span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-mono font-bold">#{{ question.order }}</span>
              <span class="text-slate-400 capitalize">{{ question.type.replace('_', ' ') }}</span>

            </div>

            <span class="text-slate-400 capitalize">{{ question.code }}</span>
          </div>

          <article 
            class="prose prose-slate dark:prose-invert max-w-none 
                  prose-headings:text-slate-800 dark:prose-headings:text-white
                  prose-p:text-slate-900 dark:prose-p:text-slate-800
                  prose-p:leading-relaxed"
            v-html="question.question_text"
          ></article>

          <div v-if="question.question_audio?.url" class="mb-6 p-4 bg-slate-50 rounded-xl">
            <p class="text-xs font-bold text-slate-500 mb-2 uppercase">Audio Pendukung:</p>
            <audio controls :src="question.question_audio.url" class="w-full"></audio>
          </div>

          <div v-if="question.question_images?.length" class="grid grid-cols-2 gap-4 mb-6">
            <img v-for="(img, idx) in question.question_images" :key="idx" :src="img.url" class="rounded-xl border shadow-sm max-h-60 object-contain w-full bg-slate-50" />
          </div>

          <div v-if="question.type !== 'essay'" class="space-y-3">
            <div 
              v-for="opt in question.options" :key="opt.label"
              :class="opt.label === question.correct_answer ? 'border-green-500 bg-green-50' : 'border-slate-100'"
              class="flex items-center gap-4 p-4 border-2 rounded-xl transition-all"
            >
              <span :class="opt.label === question.correct_answer ? 'bg-green-500 text-white' : 'bg-slate-200'" class="w-8 h-8 flex items-center justify-center rounded-full font-bold">
                {{ opt.label }}
              </span>
              <div class="flex-1">
                <p v-if="opt.text" class="text-slate-700">{{ opt.text }}</p>
                <img v-if="opt.image?.url" :src="opt.image.url" class="mt-2 rounded-lg max-h-32 shadow-sm" />
              </div>
              <span v-if="opt.label === question.correct_answer" class="text-green-600 font-bold text-sm">Jawaban Benar</span>
            </div>
          </div>

          <div v-else class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p class="text-xs font-bold text-yellow-700 mb-1 italic">KUNCI JAWABAN ESSAY:</p>
            <p class="text-slate-800">{{ question.correct_answer }}</p>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-blue-50 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
          <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
            <span>💡</span> Pembahasan
          </h3>
                    
          <article 
            class="prose prose-slate dark:prose-invert max-w-none 
                  prose-headings:text-slate-800 dark:prose-headings:text-white
                  prose-p:text-slate-900 dark:prose-p:text-slate-800
                  prose-p:leading-relaxed"
            v-html="question.discussion_text"
          ></article>

          <div v-if="question.discussion_video?.url">
            <p class="text-xs font-bold text-blue-200 mb-2 uppercase tracking-widest">Video Pembahasan:</p>
            <a :href="question.discussion_video?.url" target="_blank" class="block p-3 bg-white/10 hover:bg-white/20 rounded-xl text-center border border-white/20 transition-all">
              ▶️ Tonton Video
            </a>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <p class="text-xs text-slate-400 uppercase">Terakhir Update</p>
            <p class="text-sm font-medium text-slate-700">{{ new Date(question.updatedAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) }}</p>
          </div>
          <hr />
          <button @click="goToEdit" class="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
            Edit Soal Ini
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { IQuestion } from '~/types/questions';

definePageMeta({
  layout: 'admin'
});

const route = useRoute();
const questionId = route.params.id;

// Fetch detail question menggunakan ID dari URL
const { data: question, pending } = await useFetch<any>(`${Base_url}/questions/${questionId}`);

const goToEdit = () => {
  // Arahkan ke halaman edit jika ada
  navigateTo(`/questions/components/edit/${questionId}`);
};

</script>