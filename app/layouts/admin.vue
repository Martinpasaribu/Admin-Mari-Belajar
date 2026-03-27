<template>
  <div class="min-h-screen bg-gray-100 flex">
    <aside class="w-64 bg-slate-900 text-white p-6 space-y-4">
      <h2 class="text-xl font-bold border-b border-slate-700 pb-2">Mari Belajar</h2>
      <nav class="flex flex-col space-y-2">
        <NuxtLink to="/categories" class="hover:bg-slate-800 p-2 rounded">Categories</NuxtLink>
        <NuxtLink to="/bab" class="hover:bg-slate-800 p-2 rounded">Bab Materi</NuxtLink>
        <NuxtLink to="/questions" class="hover:bg-slate-800 p-2 rounded">Bank Soal</NuxtLink>
        <NuxtLink to="/enrollment" class="hover:bg-slate-800 p-2 rounded">Enrollment</NuxtLink>
      </nav>
    </aside>

    <main class="flex-1 p-8">
      <slot />
    </main>
  </div>
</template>