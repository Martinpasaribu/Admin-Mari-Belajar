// app/types/media.ts (Asumsi struktur MediaObject)
export interface MediaObject {
  url: string;
  public_id?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
}

export interface Option {
  label: string; // A, B, C, D, atau E
  text?: string;
  image?: MediaObject;
}

// Definisi Union Type untuk Tipe Soal agar lebih aman (Type Safety)
export type QuestionType = 'multiple_choice' | 'essay' | 'image_options';

export interface IQuestion {
  id?: string; // Virtual ID dari Mongoose
  _id: string; // ID asli dari MongoDB
  bab_key: string; // Di FE biasanya dipassing sebagai ID string
  
  type: QuestionType;
  question_text: string;
  
  // Multimedia
  question_audio?: MediaObject;
  question_images: MediaObject[];
  
  // Jawaban
  options: Option[];
  correct_answer: string;
  
  // Pembahasan
  discussion_text: string;
  discussion_video?: MediaObject;
  
  // System
  order: number;
  isActive: boolean;
  isDeleted: boolean;
  
  // Timestamps
  createdAt?: string | Date;
  updatedAt?: string | Date;
}