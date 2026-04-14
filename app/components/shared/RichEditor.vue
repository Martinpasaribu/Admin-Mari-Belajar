<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  AlignCenter, AlignLeft, AlignRight, Heading2, Heading1, Heading3, Undo, Redo, Eraser 
} from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])
const editor = shallowRef<Editor | null>(null)

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    editorProps: {
      attributes: {
        // Gabungkan class langsung di sini untuk menghindari error CSS
        class: 'prose prose-sm focus:outline-none min-h-[250px] p-6 max-w-none bg-white  text-slate-900 dark:text-slate-100 transition-colors',
      },
    },
    onUpdate: () => {
      emit('update:modelValue', editor.value?.getHTML())
    },
  })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

watch(() => props.modelValue, (value) => {
  if (!editor.value) return
  if (editor.value.getHTML() === value) return
  editor.value.commands.setContent(value, false)
})

const colors = ['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
const activeClass = 'bg-blue-100 text-blue-600 dark:text-blue-400'
const inactiveClass = 'text-slate-600 dark:text-slate-400'
</script>

<template>
  <div class="w-full border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl bg-white d">
    
    <div v-if="editor" class="bg-slate-50  border-b border-slate-200 dark:border-white/10 p-2 flex flex-wrap gap-1 items-center">
      
        <div class="flex items-center gap-0.5">
        <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" 
          :class="editor.isActive('heading', { level: 1 }) ? activeClass : inactiveClass" 
          class="p-2 rounded-lg transition-colors" title="Heading 1">
          <Heading1 :size="18" />
        </button>
        <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" 
          :class="editor.isActive('heading', { level: 2 }) ? activeClass : inactiveClass" 
          class="p-2 rounded-lg transition-colors" title="Heading 2">
          <Heading2 :size="18" />
        </button>
        <button type="button" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" 
          :class="editor.isActive('heading', { level: 3 }) ? activeClass : inactiveClass" 
          class="p-2 rounded-lg transition-colors" title="Heading 3">
          <Heading3 :size="18" />
        </button>
        </div>

        <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <div class="flex items-center gap-0.5">
            <button type="button" @click="editor.chain().focus().toggleBold().run()" 
            :class="editor.isActive('bold') ? activeClass : inactiveClass" 
            class="p-2 rounded-lg transition-colors">
            <Bold :size="16" />
            </button>
            <button type="button" @click="editor.chain().focus().toggleItalic().run()" 
            :class="editor.isActive('italic') ? activeClass : inactiveClass" 
            class="p-2 rounded-lg transition-colors">
            <Italic :size="16" />
            </button>
        </div>

        <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <div class="flex items-center gap-0.5">
            <button type="button" @click="editor.chain().focus().toggleBulletList().run()" 
            :class="editor.isActive('bulletList') ? activeClass : inactiveClass" 
            class="p-2 rounded-lg transition-colors">
            <List :size="16" />
            </button>
            <button type="button" @click="editor.chain().focus().toggleOrderedList().run()" 
            :class="editor.isActive('orderedList') ? activeClass : inactiveClass" 
            class="p-2 rounded-lg transition-colors">
            <ListOrdered :size="16" />
            </button>
        </div>

        <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <div class="flex items-center gap-0.5">
            <button type="button" @click="editor.chain().focus().setTextAlign('left').run()" 
            :class="editor.isActive({ textAlign: 'left' }) ? activeClass : inactiveClass" class="p-2 rounded-lg">
            <AlignLeft :size="16" />
            </button>
            <button type="button" @click="editor.chain().focus().setTextAlign('center').run()" 
            :class="editor.isActive({ textAlign: 'center' }) ? activeClass : inactiveClass" class="p-2 rounded-lg">
            <AlignCenter :size="16" />
            </button>
            <button type="button" @click="editor.chain().focus().setTextAlign('right').run()" 
            :class="editor.isActive({ textAlign: 'right' }) ? activeClass : inactiveClass" class="p-2 rounded-lg">
            <AlignRight :size="16" />
            </button>
        </div>

        <div class="flex gap-1.5 px-3 border-l border-slate-200 dark:border-slate-700 ml-1">
            <button v-for="c in colors" :key="c" type="button" @click="editor.chain().focus().setColor(c).run()" 
            class="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm hover:scale-125 transition-transform" 
            :style="{ backgroundColor: c }"></button>
        </div>

        <div class="flex-1"></div>
        
        <div class="flex items-center gap-1">
            <button type="button" @click="editor.chain().focus().unsetAllMarks().run()" 
            class="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Hapus Semua Format">
            <Eraser :size="16" />
            </button>
            <button type="button" @click="editor.chain().focus().undo().run()" class="p-2 text-slate-400"><Undo :size="16" /></button>
            <button type="button" @click="editor.chain().focus().redo().run()" class="p-2 text-slate-400"><Redo :size="16" /></button>
        </div>
    
    </div>

    <EditorContent v-if="editor" :editor="editor" class="editor-container" />
    
    <div v-else class="h-[250px] flex flex-col items-center justify-center bg-slate-50 ">
       <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
       <span class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Menyiapkan Editor...</span>
    </div>
  </div>
</template>

<style>
/* CSS Reset & Tiptap Specific */
.tiptap {
  min-height: 250px;
  outline: none !important;
}

/* Memastikan List muncul di Tailwind */
.tiptap ul {
  list-style-type: disc !important;
  padding-left: 1.5rem !important;
  margin: 1rem 0 !important;
}

.tiptap ol {
  list-style-type: decimal !important;
  padding-left: 1.5rem !important;
  margin: 1rem 0 !important;
}

/* Alignment Classes */
.tiptap p.has-text-align-center { text-align: center; }
.tiptap p.has-text-align-right { text-align: right; }
.tiptap p.has-text-align-justify { text-align: justify; }

/* Heading Style */
/* Header Styling di Editor */
.prose h1 { font-size: 2rem; font-weight: 800; margin-bottom: 1rem; }
.prose h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; }
.prose h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }


/* Dark mode content fix */
.dark .tiptap {
  color: #000000;
}
</style>