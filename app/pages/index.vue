<script setup lang="ts">
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Plus, 
  Settings, 
  ArrowUpRight,
  MoreVertical,
  Clock
} from 'lucide-vue-next';

definePageMeta({
  layout: 'default'
})

// Data Statistik yang lebih detail
const stats = [
  { 
    name: 'Total Soal', 
    value: '1.240', 
    trend: '+12%', 
    icon: FileText, 
    color: 'bg-blue-500', 
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  { 
    name: 'Siswa Terdaftar', 
    value: '850', 
    trend: '+5.4%', 
    icon: Users, 
    color: 'bg-emerald-500', 
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-600'
  },
  { 
    name: 'Total Revenue', 
    value: 'Rp 12,5jt', 
    trend: '+8%', 
    icon: TrendingUp, 
    color: 'bg-purple-500', 
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  }
]

// Data Aktivitas Terbaru
const recentActivities = [
  { id: 1, user: 'Ahmad Faisal', action: 'Menyelesaikan Kuis Matematika', time: '2 menit yang lalu', status: 'Lulus' },
  { id: 2, user: 'Siti Aminah', action: 'Mendaftar Bab Baru: Biologi Sel', time: '15 menit yang lalu', status: 'Pending' },
  { id: 3, user: 'Budi Doremi', action: 'Menambahkan 10 Bank Soal Baru', time: '1 jam yang lalu', status: 'Success' },
]
</script>

<template>
  <div class="space-y-10 pb-10">
    
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h2>
        <p class="text-slate-500 font-medium mt-1">Selamat datang kembali, <span class="text-blue-600 font-bold">Admin Developer!</span></p>
      </div>
      
      <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          <Clock :size="16" /> History Log
        </button>
        <NuxtLink to="/questions/create" class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95">
          <Plus :size="18" /> Tambah Soal
        </NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div 
        v-for="item in stats" 
        :key="item.name" 
        class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
      >
        <div class="flex justify-between items-start">
          <div :class="[item.lightColor, 'p-4 rounded-2xl transition-colors duration-300']">
            <component :is="item.icon" :class="item.textColor" :size="24" />
          </div>
          <span class="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full">
            {{ item.trend }} <ArrowUpRight :size="10" />
          </span>
        </div>
        
        <div class="mt-6">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ item.name }}</p>
          <p class="text-4xl font-black text-slate-900 mt-1 tracking-tighter">{{ item.value }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div class="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 class="text-xl font-black text-slate-900 tracking-tight">Aktivitas Terkini</h3>
          <button class="text-slate-400 hover:text-slate-600"><MoreVertical :size="20" /></button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th class="px-8 py-4">User</th>
                <th class="px-8 py-4">Aksi</th>
                <th class="px-8 py-4">Waktu</th>
                <th class="px-8 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="act in recentActivities" :key="act.id" class="group hover:bg-slate-50/50 transition-colors">
                <td class="px-8 py-5">
                  <p class="text-sm font-bold text-slate-800">{{ act.user }}</p>
                </td>
                <td class="px-8 py-5 text-sm text-slate-500 font-medium">{{ act.action }}</td>
                <td class="px-8 py-5 text-xs text-slate-400 font-bold italic">{{ act.time }}</td>
                <td class="px-8 py-5 text-right">
                  <span class="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                    {{ act.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="p-6 bg-slate-50/30 text-center border-t border-slate-50">
          <button class="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Lihat Semua Aktivitas</button>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-200">
          <div class="relative z-10">
            <h3 class="text-xl font-black leading-tight">Kelola Enrollment Siswa</h3>
            <p class="text-slate-400 text-sm mt-2 font-medium">Berikan akses bab materi kepada siswa terpilih secara manual.</p>
            <button class="mt-8 w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-lg">
              Buka Panel Akses
            </button>
          </div>
          <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>

        <div class="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
            <Settings :size="18" class="text-slate-400" /> System Health
          </h3>
          <div class="mt-6 space-y-4">
            <div v-for="i in 2" :key="i" class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Server {{ i }}</span>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-xs font-black text-slate-800">Stable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
/* Transisi halus saat komponen dimuat */
.animate-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>