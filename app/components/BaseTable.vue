<script setup lang="ts">
import { 
  Pencil, Trash2, PlusCircle, Eye, X, Image as ImageIcon, 
  ChevronDown, ChevronRight, Hash, Layers, FileText, Layout
} from 'lucide-vue-next';

interface Header {
  key: string;
  label: string;
}

const props = defineProps<{
  headers: Header[];
  items: any[];
  child: string
  loading?: boolean;
  view?: string;

}>();

const { goToQuestionsByBab, goToQuestionDetail, goToBabBySubCategory, goToSubCategoryByCategory } = useAppNavigation()

const emit = defineEmits(['edit', 'delete', 'addChild']);

// --- FUNGSI BARU: Get Nested Value ---
const getNestedValue = (obj: any, path: string) => {
  if (!path) return '';
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '-';
};

// State untuk Row Expansion
const expandedRows = ref<string[]>([]);
const toggleRow = (id: string) => {
  const index = expandedRows.value.indexOf(id);
  if (index > -1) expandedRows.value.splice(index, 1);
  else expandedRows.value.push(id);
};

// Lightbox Logic
const isPreviewOpen = ref(false);
const selectedImage = ref('');
const openPreview = (url: string | any) => {
  selectedImage.value = typeof url === 'string' ? url : url?.url;
  isPreviewOpen.value = true;
};
</script>

<template>
  <div class="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans">
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left border-separate border-spacing-0">
        <thead>
          <tr class="bg-slate-50/80">
            <th class="w-12 border-b border-slate-200 pl-4 py-4"></th>
            <th v-for="header in headers" :key="header.key" class="px-4 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-200">
              {{ header.label }}
            </th>
            <th class="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-200 text-right">Actions</th>
          </tr>
        </thead>
        
        <tbody class="divide-y divide-slate-100">
          <template v-for="(item, index) in items" :key="item._id || index">
            <tr class="group hover:bg-blue-50/20 transition-colors cursor-pointer" @click="toggleRow(item._id)">
              <td class="pl-4 py-4 text-slate-400">
                <div class="w-6 h-6 flex items-center justify-center rounded-md group-hover:bg-white transition-colors">
                  <ChevronRight v-if="!expandedRows.includes(item._id)" class="w-4 h-4 transition-transform" />
                  <ChevronDown v-else class="w-4 h-4 text-blue-500" />
                </div>
              </td>
              
              <td v-for="header in headers" :key="header.key" class="px-4 py-4">
                <slot :name="`cell-${header.key.replace('.', '-')}`" :item="item">
                  
                  <template v-if="header.key === 'isActive'">
                    <span :class="['px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight', item.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200']">
                      {{ item.isActive ? 'Active' : 'Draft' }}
                    </span>
                  </template>

                  <template v-else-if="header.key === 'order'">
                    <div class="flex items-center gap-1.5 text-slate-500 font-mono text-xs">
                      <Layers class="w-3 h-3 text-slate-400" />
                      {{ item.order }}
                    </div>
                  </template>

                  <template v-else-if="['icon', 'image_bg'].includes(header.key)">
                    <div v-if="item[header.key]" class="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                      <img :src="item[header.key].url || item[header.key]" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="w-8 h-8 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center">
                      <ImageIcon class="w-3 h-3 text-slate-300" />
                    </div>
                  </template>

                  <template v-else>
                    <span class="text-slate-700 font-medium">
                      {{ getNestedValue(item, header.key) }}
                    </span>
                  </template>
                </slot>
              </td>

              <td class="px-6 py-4 text-right" @click.stop>
                <div class="flex justify-end items-center gap-1">
                                    
                  <button 
                    v-if="view === 'SB'"
                    @click="goToQuestionsByBab(item._id)"
                    class="flex items-center justify-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 whitespace-nowrap shadow-sm active:scale-95"
                  >
                    <PlusCircle class="w-3.5 h-3.5" />
                    <span class="text-[10px] font-bold uppercase tracking-wider">
                      Lihat {{ props.view || 'Lihat' }}
                    </span>
                  </button>

                  <button 
                    v-else-if="view === 'S'"
                    @click="goToQuestionDetail(item._id)"
                    class="flex items-center justify-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 whitespace-nowrap shadow-sm active:scale-95"
                  >
                    <PlusCircle class="w-3.5 h-3.5" />
                    <span class="text-[10px] font-bold uppercase tracking-wider">
                      Lihat {{ props.view || 'Lihat' }}
                    </span>
                  </button>

                  <button 
                    v-else-if="view === 'BC'"
                    @click="goToBabBySubCategory(item._id)"
                    class="flex items-center justify-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 whitespace-nowrap shadow-sm active:scale-95"
                  >
                    <PlusCircle class="w-3.5 h-3.5" />
                    <span class="text-[10px] font-bold uppercase tracking-wider">
                      Lihat {{ props.view || 'Lihat' }}
                    </span>
                  </button>

                  <button 
                    v-else-if="view === 'SC'"
                    @click="goToSubCategoryByCategory(item._id)"
                    class="flex items-center justify-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 whitespace-nowrap shadow-sm active:scale-95"
                  >
                    <PlusCircle class="w-3.5 h-3.5" />
                    <span class="text-[10px] font-bold uppercase tracking-wider">
                      Lihat {{ props.view || 'Lihat' }}
                    </span>
                  </button>

                  <button 
                    @click="$emit('addChild', item)"
                    class="flex items-center justify-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 whitespace-nowrap shadow-sm active:scale-95"
                  >
                    <PlusCircle class="w-3.5 h-3.5" />
                    <span class="text-[10px] font-bold uppercase tracking-wider">
                      {{ props.child || 'Add Child' }}
                    </span>
                  </button>
                  <div class="w-px h-4 bg-slate-200 mx-1"></div>
                  <button @click="emit('edit', item)" class="p-2 hover:bg-amber-50 text-slate-400 hover:text-amber-500 rounded-lg transition-colors">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button @click="emit('delete', item)" class="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="expandedRows.includes(item._id)" class="bg-slate-50/50">
              <td :colspan="headers.length + 2" class="px-12 py-8 border-b border-slate-200">
                <div class="flex flex-col gap-8">
                  <div class="space-y-4 lg:col-span-1 border-l border-slate-200 pl-8 ">
                    <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText class="w-3 h-3" /> Content Info
                    </h4>
                    <div class="space-y-4">
                      <div>
                        <p class="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                          <Hash class="w-3 h-3 text-blue-500" /> Slug Path
                        </p>
                        <p class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mt-1">/category/{{ item.slug || 'n/a' }}</p>
                      </div>
                      <div>
                        <p class="text-[11px] font-bold text-slate-700">Full Description</p>
                        <p class="text-xs text-slate-500 leading-relaxed mt-1 italic">{{ item.description || 'No description provided.' }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-6">
                    <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Layout class="w-4 h-4 text-blue-500" />
                      <h4 class="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">Media Assets Detail</h4>
                    </div>
                    <div class="flex flex-col lg:flex-row gap-8">
                      <div class="flex-shrink-0 w-full lg:w-72">
                        <div class="grid grid-cols-2 gap-4">
                          <div class="space-y-2">
                            <p class="text-[10px] font-bold text-slate-400 uppercase ml-1">Icon</p>
                            <div @click="openPreview(item.icon)" class="group relative aspect-square bg-slate-50 rounded-2xl border-2 border-slate-100 p-3 cursor-zoom-in hover:border-blue-400 hover:bg-white transition-all duration-300 shadow-sm">
                              <img v-if="item.icon" :src="item.icon.url || item.icon" class="w-full h-full object-contain drop-shadow-sm" />
                              <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                                <ImageIcon class="w-8 h-8 opacity-20" />
                              </div>
                              <div class="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                <Eye class="w-5 h-5 text-blue-600 translate-y-2 group-hover:translate-y-0 transition-transform" />
                              </div>
                            </div>
                          </div>
                          <div class="space-y-2">
                            <p class="text-[10px] font-bold text-slate-400 uppercase ml-1">Cover BG</p>
                            <div @click="openPreview(item.image_bg)" class="group relative aspect-square bg-slate-50 rounded-2xl border-2 border-slate-100 p-1 cursor-zoom-in hover:border-blue-400 hover:bg-white transition-all duration-300 shadow-sm">
                              <img v-if="item.image_bg" :src="item.image_bg.url || item.image_bg" class="w-full h-full object-cover rounded-[14px]" />
                              <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                                <ImageIcon class="w-8 h-8 opacity-20" />
                              </div>
                              <div class="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                <Eye class="w-5 h-5 text-blue-600 translate-y-2 group-hover:translate-y-0 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="flex-1 min-w-0 bg-slate-50/50 rounded-2xl border border-slate-100 p-5">
                        <div class="flex items-center justify-between mb-4">
                          <div class="flex items-center gap-2">
                            <ImageIcon class="w-3.5 h-3.5 text-slate-400" />
                            <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gallery Images ({{ item.images?.length || 0 }})</h4>
                          </div>
                        </div>
                        <div v-if="item.images?.length" class="flex flex-wrap gap-4">
                          <div v-for="(img, i) in item.images" :key="i" @click="openPreview(img)" class="group relative w-20 h-20 bg-white rounded-xl border-2 border-white shadow-sm overflow-hidden cursor-zoom-in hover:ring-2 hover:ring-blue-400 hover:scale-105 transition-all duration-300">
                            <img :src="img.url || img" class="w-full h-full object-cover" />
                            <div class="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Eye class="w-4 h-4 text-white" /></div>
                          </div>
                        </div>
                        <div v-else class="h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                          <ImageIcon class="w-5 h-5 text-slate-300 mb-1" />
                          <p class="text-[11px] text-slate-400 font-medium">No images uploaded</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isPreviewOpen" class="fixed inset-0 z-[999] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-10" @click="isPreviewOpen = false">
          <button class="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
            <X class="w-6 h-6" />
          </button>
          <img :src="selectedImage" class="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain animate-in zoom-in duration-300" />
          <div class="mt-4 px-4 py-2 bg-white/10 rounded-full">
            <p class="text-xs text-white/70 font-mono truncate max-w-xs">{{ selectedImage }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>