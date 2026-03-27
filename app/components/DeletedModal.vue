<script setup lang="ts">
const props = defineProps<{
  show: boolean
  title?: string
  message?: string
  endpoint: string // URL API untuk delete
}>()

const emit = defineEmits(['close', 'success'])
const isSubmitting = ref(false)

const confirmDelete = async () => {
  isSubmitting.value = true
  try {
    const res = await $fetch<{ success: boolean }>(props.endpoint, {
      method: 'DELETE'
    })
    if (res.success) {
      emit('success')
      emit('close')
    }
  } catch (err: any) {
    alert(err.data?.message || 'Gagal menghapus data')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <GenericModal 
    :show="show" 
    :title="title || 'Konfirmasi Hapus'" 
    confirmLabel="Ya, Hapus"
    variant="danger"
    :loading="isSubmitting"
    @close="emit('close')" 
    @confirm="confirmDelete"
  >
    <div class="flex flex-col items-center p-2 text-center">
      <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 text-xl">
        🗑️
      </div>
      <p class="text-slate-600">{{ message || 'Apakah anda yakin ingin menghapus data ini secara permanen?' }}</p>
    </div>
  </GenericModal>
</template>