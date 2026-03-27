<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
// Import icons yang dibutuhkan
import { 
  LayoutDashboard, 
  Layers, 
  FolderTree, 
  BookOpen, 
  FileQuestion, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  User
} from 'lucide-vue-next';

const route = useRoute();
const isSidebarOpen = ref(true);
const toggleSidebar = () => (isSidebarOpen.value = !isSidebarOpen.value);

// Data menu dengan komponen Lucide
const menus = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Categories', icon: Layers, path: '/categories' },
  { name: 'Sub Categories', icon: FolderTree, path: '/sub-categories' },
  { name: 'Bab Materi', icon: BookOpen, path: '/bab' },
  { name: 'Bank Soal', icon: FileQuestion, path: '/questions' },
];

const currentPathName = computed(() => {
  const path = route.path.split('/').filter(Boolean).pop();
  return path ? path.replace(/-/g, ' ') : 'Dashboard';
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex font-sans text-slate-900">
    
    <aside 
      :class="[
        isSidebarOpen ? 'w-64' : 'w-20',
        'fixed inset-y-0 left-0 z-40 bg-slate-900 text-white transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col shadow-2xl'
      ]"
    >
      <div class="h-16 flex items-center px-6 border-b border-slate-800 shrink-0 overflow-hidden">
        <div class="flex items-center gap-3">
          <div class="min-w-[32px] h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-lg shadow-lg shadow-blue-900/20">
            M
          </div>
          <span 
            v-if="isSidebarOpen" 
            class="font-bold text-base tracking-tight whitespace-nowrap transition-opacity duration-300"
          >
            MARI BELAJAR
          </span>
        </div>
      </div>

      <nav class="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <NuxtLink 
          v-for="menu in menus" 
          :key="menu.path"
          :to="menu.path"
          class="flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative hover:bg-white/5 text-slate-400 hover:text-white"
          active-class="bg-blue-600 !text-white shadow-lg shadow-blue-600/30"
        >
          <component :is="menu.icon" :size="20" class="shrink-0 transition-transform group-hover:scale-110" />
          
          <span 
            v-if="isSidebarOpen" 
            class="ml-3 font-medium text-sm whitespace-nowrap transition-opacity duration-300"
          >
            {{ menu.name }}
          </span>

          <div v-if="!isSidebarOpen" class="absolute left-16 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            {{ menu.name }}
          </div>
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-slate-800">
        <button class="flex items-center w-full px-3 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group">
          <LogOut :size="20" class="shrink-0 group-hover:-translate-x-1 transition-transform" />
          <span v-if="isSidebarOpen" class="ml-3 font-bold text-[11px] uppercase tracking-widest">Logout</span>
        </button>
      </div>
    </aside>

    <div 
      :class="[
        isSidebarOpen ? 'ml-64' : 'ml-20',
        'flex-1 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-w-0'
      ]"
    >
      
      <header class="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-8 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <button 
            @click="toggleSidebar" 
            class="text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft v-if="isSidebarOpen" :size="24" />
            <ChevronRight v-else :size="24" />
          </button>
          
          <nav class="hidden md:flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span>Admin</span>
            <div class="w-1 h-1 rounded-full bg-slate-300 mx-3"></div>
            <span class="text-slate-900">{{ currentPathName }}</span>
          </nav>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-bold text-slate-800 leading-tight">Admin</p>
            <p class="text-[10px] font-bold text-blue-600 uppercase">Super Admin</p>
          </div>
          <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm overflow-hidden">
            <User :size="20" />
          </div>
        </div>
      </header>

      <main class="p-8 max-w-7xl w-full mx-auto">
        <slot />
      </main>

    </div>
  </div>
</template>

<style scoped>
/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}

/* Nuxt Link Active Transition */
.router-link-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>