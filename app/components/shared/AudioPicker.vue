<script setup lang="ts">
import { Music, Trash2, Volume2, FileAudio } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: any;
  label?: string;
}>();

const emit = defineEmits(['update:modelValue']);
const fileInput = ref<HTMLInputElement | null>(null);
const audioUrl = ref<string | null>(null);
const fileName = ref<string | null>(null);

// Handle Perubahan File
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    if (!file.type.startsWith('audio/')) {
      alert('Tolong pilih file audio yang valid (MP3/WAV)');
      return;
    }
    
    fileName.value = file.name;
    emit('update:modelValue', file);
    
    // Create preview URL
    if (audioUrl.value) URL.revokeObjectURL(audioUrl.value);
    audioUrl.value = URL.createObjectURL(file);
  }
};

const removeAudio = () => {
  fileName.value = null;
  audioUrl.value = null;
  emit('update:modelValue', null);
  if (fileInput.value) fileInput.value.value = '';
};

const triggerInput = () => {
  fileInput.value?.click();
};

// Cleanup memory
onUnmounted(() => {
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value);
});
</script>

<template>
  <div class="w-full">
    <input 
      type="file" 
      ref="fileInput" 
      class="hidden" 
      accept="audio/*" 
      @change="handleFileChange" 
    />

    <div 
      v-if="!modelValue"
      @click="triggerInput"
      class="group cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all"
    >
      <div class="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
        <Music :size="24" />
      </div>
      <p class="mt-3 text-xs font-bold text-slate-500 uppercase tracking-widest">{{ label || 'Pilih Audio' }}</p>
      <p class="text-[10px] text-slate-400 mt-1 italic">Klik untuk upload (MP3 max 5MB)</p>
    </div>

    <div 
      v-else 
      class="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
          <FileAudio :size="20" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-slate-800 truncate">{{ fileName || 'Audio Terpilih' }}</p>
          <p class="text-[10px] text-slate-400 font-medium uppercase tracking-tighter flex items-center gap-1">
            <Volume2 :size="10" /> Ready to Upload
          </p>
        </div>
        <button 
          @click="removeAudio" 
          class="p-2 text-slate-300 hover:text-red-500 transition-colors"
        >
          <Trash2 :size="18" />
        </button>
      </div>

      <div v-if="audioUrl" class="pt-2">
        <audio :src="audioUrl" controls class="w-full h-8 custom-audio-player"></audio>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styling minimalis untuk native audio player */
.custom-audio-player::-webkit-media-controls-enclosure {
  background-color: #f8fafc;
  border-radius: 8px;
}
.custom-audio-player {
  filter: sepia(20%) saturate(70%) grayscale(1) contrast(99%) invert(12%);
}
</style>