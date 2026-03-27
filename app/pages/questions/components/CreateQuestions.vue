<script setup lang="ts">
import { 
  Plus, Trash2, HelpCircle, Video, Music, 
  Image as ImageIcon, Type, FileText 
} from 'lucide-vue-next';
import ImageUpload from '~/components/shared/ImageUpload.vue';
import VideoPicker from '~/components/shared/VideoPicker.vue';
import DocumentPicker from '~/components/shared/DocumentPicker.vue'
import type { IBab } from '~/types/bab';
import AudioPicker from '~/components/shared/AudioPicker.vue';

const props = defineProps<{
   show: boolean
   bab: IBab | null,
}>()

const emit = defineEmits(['close', 'success'])
const isSubmitting = ref(false)

// Struktur Form sesuai Schema NestJS
const form = ref<any>({
  bab_key: '',
  type: 'multiple_choice',
  question_text: '',
  question_audio: null,
  question_images: [],
  options: [
    { label: 'A', text: '', image: null },
    { label: 'B', text: '', image: null },
    { label: 'C', text: '', image: null },
    { label: 'D', text: '', image: null }
  ],
  correct_answer: '',
  discussion_text: '',
  discussion_video: null,
  order: 0,
  isActive: true
})

// Reset form saat modal dibuka
watch(() => props.show, (newVal) => {
  if (newVal) {
    form.value.bab_key = props.bab?._id
    // Reset options jika perlu
  }
})

const addOption = () => {
  const nextLabel = String.fromCharCode(65 + form.value.options.length) // A, B, C...
  form.value.options.push({ label: nextLabel, text: '', image: null })
}

const removeOption = (index: number) => {
  form.value.options.splice(index, 1)
  // Re-label options
  form.value.options.forEach((opt: { label: string; }, i: number) => {
    opt.label = String.fromCharCode(65 + i)
  })
}

const performUpload = async (file: any, endpoint: 'upload-single' | 'upload-multiple') => {
  if (!file) return null
  const formData = new FormData()
  if (Array.isArray(file)) {
    file.forEach(f => formData.append('files', f))
  } else {
    formData.append('file', file)
  }
  
  const res = await $fetch<any>(`/api/media/${endpoint}`, { method: 'POST', body: formData })
  return res.data || res
}

const handleSave = async () => {
  isSubmitting.value = true
  try {
    // 1. Upload Multimedia Soal
    const [audio, video] = await Promise.all([
      performUpload(form.value.question_audio, 'upload-single'),
      performUpload(form.value.discussion_video, 'upload-single')
    ])

    const images = form.value.question_images.length 
      ? await performUpload(form.value.question_images, 'upload-multiple') 
      : []

    // 2. Upload Gambar Pilihan Jawaban (Jika tipe image_options)
    const processedOptions = await Promise.all(form.value.options.map(async (opt: any) => {
      if (form.value.type === 'image_options' && opt.image) {
        const uploadedImg = await performUpload(opt.image, 'upload-single')
        return { ...opt, image: uploadedImg }
      }
      return opt
    }))

    // 3. Gabungkan Payload
    const payload = {
      ...form.value,
      question_audio: audio,
      question_images: images,
      discussion_video: video,
      options: form.value.type === 'essay' ? [] : processedOptions
    }

    const res = await $fetch('/api/questions', {
      method: 'POST',
      body: payload
    })

    if (res?.success) {
      emit('success')
      emit('close')
    }
  } catch (err: any) {
    alert('Gagal simpan soal: ' + (err.data?.message || err.message))
  } finally {
    isSubmitting.value = false
  }
}

const labelClass = "block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest"
const inputClass = "w-full bg-white px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
</script>

<template>
  <GenericModal 
    :show="show"
    :id="`Bab : ${bab?.name} `" 
    title="Tambah Soal Baru" 
    @close="emit('close')" 
    @confirm="handleSave" 
    :loading="isSubmitting"
    size="4xl"
  >
    <div class="max-h-[75vh] overflow-y-auto px-1 custom-scrollbar space-y-8">
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <div>
          <label :class="labelClass">Tipe Soal</label>
          <select v-model="form.type" :class="inputClass">
            <option value="multiple_choice">Pilihan Ganda</option>
            <option value="image_options">Pilihan Gambar</option>
            <option value="essay">Essay / Isian</option>
          </select>
        </div>
        <div>
          <label :class="labelClass">Urutan (No. Soal)</label>
          <input v-model.number="form.order" type="number" :class="inputClass" />
        </div>
        <div class="flex items-end pb-2">
           <label class="flex items-center gap-3 cursor-pointer">
              <input v-model="form.isActive" type="checkbox" class="w-5 h-5 accent-blue-600" />
              <span class="text-sm font-bold text-slate-600">Aktifkan Soal</span>
           </label>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center gap-2 border-b pb-2">
          <HelpCircle class="w-5 h-5 text-blue-500" />
          <h3 class="font-bold text-slate-700">Pertanyaan</h3>
        </div>
        
        <textarea 
          v-model="form.question_text" 
          rows="4" 
          :class="inputClass" 
          placeholder="Tuliskan pertanyaan di sini..."
        ></textarea>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-4 border border-dashed border-slate-300 rounded-2xl">
          <label :class="labelClass" class="flex items-center gap-2">
            <Music class="w-4 h-4" /> Audio Soal (Optional)
          </label>

          <AudioPicker v-model="form.question_audio" label="Upload Audio MP3" />
        </div>
          <div class="p-4 border border-dashed border-slate-300 rounded-2xl">
            <label :class="labelClass" class="flex items-center gap-2">
              <ImageIcon class="w-4 h-4" /> Gambar Pendukung
            </label>
 
            <div class="mt-8">
                <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">Galeri Gambar</h3>
                <ImageUpload 
                v-model="form.question_images" 
                multiple 
                label="Tambah Gambar" 
                />
            </div>
            
          </div>
        </div>
      </div>

      <div v-if="form.type !== 'essay'" class="space-y-4">
        <div class="flex items-center justify-between border-b pb-2">
          <div class="flex items-center gap-2">
            <FileText class="w-5 h-5 text-emerald-500" />
            <h3 class="font-bold text-slate-700">Pilihan Jawaban</h3>
          </div>
          <button @click="addOption" class="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-100">
            <Plus class="w-3 h-3" /> Tambah Opsi
          </button>
        </div>

        <div class="space-y-3">
          <div v-for="(opt, index) in form.options" :key="index" class="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-start">
            <div class="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0">
              {{ opt.label }}
            </div>
            
            <div class="flex-1 space-y-3">
              <input v-if="form.type === 'multiple_choice'" v-model="opt.text" type="text" :class="inputClass" placeholder="Teks jawaban..." />
              <ImageUpload v-if="form.type === 'image_options'" v-model="opt.image" label="Gambar Jawaban" aspect-ratio="square" />
            </div>

            <button @click="removeOption(index)" class="p-2 text-slate-400 hover:text-red-500">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <label :class="labelClass" class="text-emerald-700">Jawaban Benar</label>
          <select v-model="form.correct_answer" :class="inputClass">
            <option value="" disabled>Pilih Label Jawaban Benar</option>
            <option v-for="opt in form.options" :key="opt.label" :value="opt.label">
              Opsi {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <div v-else class="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
        <label :class="labelClass" class="text-emerald-700">Kunci Jawaban (Essay)</label>
        <textarea v-model="form.correct_answer" rows="3" :class="inputClass" placeholder="Masukkan kata kunci atau jawaban benar..."></textarea>
      </div>

      <div class="space-y-4 pt-6 border-t">
        <div class="flex items-center gap-2 border-b pb-2">
          <Video class="w-5 h-5 text-purple-500" />
          <h3 class="font-bold text-slate-700">Pembahasan (Discussion)</h3>
        </div>
        <textarea v-model="form.discussion_text" rows="4" :class="inputClass" placeholder="Tuliskan penjelasan jawaban di sini..."></textarea>
        <div>
          <label :class="labelClass">Video Pembahasan (Optional)</label>
          <VideoPicker v-model="form.discussion_video" label="Pilih Video Pembahasan" />
        </div>
      </div>

    </div>
  </GenericModal>
</template>