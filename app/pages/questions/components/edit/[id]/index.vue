<template>
  <div class="w-full max-w-5xl mx-auto p-6">
    <div class="flex items-center justify-between mb-8">
      <div>
        <button @click="$router.back()" class="text-slate-500 text-sm hover:underline mb-2 flex items-center gap-1">
          ← Kembali
        </button>
        <h1 class="text-2xl font-bold text-slate-900">Edit Pertanyaan</h1>
      </div>
      <div class="flex gap-3">
        <button 
          @click="handleUpdate" 
          :disabled="isUpdating"
          class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all"
        >
          {{ isUpdating ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center p-20 text-slate-400">Memuat data soal...</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">Isi Pertanyaan</label>
            <textarea 
              v-model="form.question_text"
              rows="4"
              class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Tuliskan soal di sini..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Tipe Soal</label>
              <select v-model="form.type" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option value="multiple_choice">Pilihan Ganda (Teks)</option>
                <option value="image_options">Pilihan Ganda (Gambar)</option>
                <option value="essay">Essay / Isian</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Nomor Urut</label>
              <input v-model="form.order" type="number" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
          </div>

          <div v-if="form.type !== 'essay'" class="space-y-4">
            <label class="block text-sm font-bold text-slate-700">Pilihan Jawaban & Kunci</label>
            <div v-for="(opt, index) in form.options" :key="index" class="flex items-start gap-3 p-4 border border-slate-100 rounded-xl bg-slate-50">
              <input 
                type="radio" 
                :value="opt.label" 
                v-model="form.correct_answer"
                class="mt-1.5 w-4 h-4 text-blue-600"
              />
              <div class="flex-1 space-y-2">
                <span class="font-bold text-slate-500 text-xs uppercase">Opsi {{ opt.label }}</span>
                <input 
                  v-if="form.type === 'multiple_choice'"
                  v-model="opt.text" 
                  type="text" 
                  class="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                  placeholder="Isi jawaban..."
                />
                <div v-if="form.type === 'image_options'" class="flex items-center gap-3">
                   <img v-if="opt.image?.url" :src="opt.image.url" class="w-16 h-16 object-cover rounded-lg border" />
                   <input type="text" v-model="opt.image.url" placeholder="URL Gambar Opsi" class="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs" />
                </div>
              </div>
            </div>
          </div>

          <div v-else>
            <label class="block text-sm font-bold text-slate-700 mb-2">Kunci Jawaban (Essay)</label>
            <input v-model="form.correct_answer" type="text" class="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h3 class="font-bold text-slate-800 border-b pb-2">Pembahasan</h3>
          
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-2 uppercase">Teks Pembahasan</label>
            <textarea v-model="form.discussion_text" rows="5" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"></textarea>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 mb-2 uppercase">URL Video Pembahasan</label>
            <input v-model="form.discussion_video.url" type="text" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
          </div>

          <hr />

          <div class="flex items-center justify-between">
            <span class="text-sm font-bold text-slate-700">Status Aktif</span>
            <button 
              @click="form.isActive = !form.isActive"
              :class="form.isActive ? 'bg-green-500' : 'bg-slate-300'"
              class="w-12 h-6 rounded-full transition-all relative"
            >
              <div :class="form.isActive ? 'translate-x-6' : 'translate-x-1'" class="absolute top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IQuestion } from '~/types/questions';

definePageMeta({ layout: 'admin' });

const route = useRoute();
const questionId = route.params.id;
const isUpdating = ref(false);

// State Form (Default structure)
const form = ref<any>({
  question_text: '',
  type: 'multiple_choice',
  order: 0,
  options: [
    { label: 'A', text: '', image: { url: '' } },
    { label: 'B', text: '', image: { url: '' } },
    { label: 'C', text: '', image: { url: '' } },
    { label: 'D', text: '', image: { url: '' } },
    { label: 'E', text: '', image: { url: '' } },
  ],
  correct_answer: '',
  discussion_text: '',
  discussion_video: { url: '' },
  isActive: true
});

// 1. Fetch Data Awal
const { data, pending } = await useFetch<IQuestion>(`http://localhost:5002/api/v1/questions/${questionId}`);

// 2. Masukkan data ke form saat data berhasil diload
watchEffect(() => {
  if (data.value) {
    form.value = { 
      ...data.value,
      // Pastikan nested objects tidak undefined
      discussion_video: data.value.discussion_video || { url: '' }
    };
  }
});

// 3. Fungsi Update ke Backend
const handleUpdate = async () => {
  isUpdating.value = true;
  try {
    await $fetch(`http://localhost:5002/api/v1/questions/${questionId}`, {
      method: 'PUT',
      body: form.value
    });
    
    // Tampilkan notifikasi atau redirect
    alert('Data berhasil diperbarui!');
    navigateTo(`/questions/${questionId}`);
  } catch (error) {
    console.error('Update failed:', error);
    alert('Gagal memperbarui data.');
  } finally {
    isUpdating.value = false;
  }
};
</script>