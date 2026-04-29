// composables/useTextStripper.ts
export const useTextStripper = () => {
  const stripHtml = (html: string): string => {
    if (!html) return '';
    return html
        // 1. Tangani List agar tidak menyambung (AyamBebek -> Ayam, Bebek)
        .replace(/<\/li>/gi, '\n') 
        
        // 2. Tangani Line Breaks & Paragraf
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/h[1-6]>/gi, '\n') // Heading juga kasih newline
        
        // 3. Hapus semua tag HTML sisanya (span color, bold, dll)
        .replace(/<[^>]+>/g, '')
        
        // 4. Bersihkan Entities HTML
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        
        // 5. Perapian Whitespace
        .replace(/\n\s*\n/g, '\n') // Hapus double newline yang berlebihan
        .trim();
  };

  /**
   * Mengotomatiskan sinkronisasi antara field HTML dan Plain Text dalam sebuah objek ref (form)
   */
  const syncPlainText = (
    formRef: Ref<any>, 
    mappings: { htmlField: string; baseField: string }[]
  ) => {
    mappings.forEach(({ htmlField, baseField }) => {
      watch(
        () => formRef.value[htmlField],
        (newVal) => {
          formRef.value[baseField] = stripHtml(newVal);
        }
      );
    });
  };

  return {
    stripHtml,
    syncPlainText
  };
};