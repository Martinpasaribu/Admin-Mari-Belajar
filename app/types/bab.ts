// app/types/category.ts

import type { ICategory } from "./categories";

export interface MediaObject {
  _id?: string;
  url: string;
  fileId: string;
  fileName: string;
  fileType: string;
  size: number;
}

export interface IBab {
  _id: string | '';          // ID dari MongoDB
  id: string;           // Virtual ID (biasanya hasil toJSON)
  sub_category_key: ICategory; // Referensi ke Category (ObjectId sebagai string)
  name: string;
  slug: string;
  description?: string;
  sub_description?: string;
  content?: string;
  section: any;

  isFree : boolean;
  price : number;
  accessDurationDays : number;

  // Media fields sesuai schema NestJS kamu
  icon?: MediaObject;
  image_bg?: MediaObject;
  images: MediaObject[];
  document: MediaObject;
  video_url: MediaObject;

  // Settings & Metadata
  isActive: boolean;
  order: number;
  isDeleted: boolean;
  
  // Virtual Fields dari Mongoose (Statistik)
  questionCount?: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Untuk keperluan Form (Tambah/Edit)
export type BabForm = Pick<IBab, 'name' | 'description' | 'sub_description'> & {
  id?: string | null;
};