// ============================================
// ADD TO END OF: types/index.ts
// ============================================

// Director's Lookbook
export type LookbookSectionType = 'tone' | 'visual-style' | 'color-palette' | 'shot-style' | 'reference-film' | 'character-look' | 'world-building' | 'sound-music' | 'custom';

export interface LookbookItem {
  id: string;
  projectId: string;
  section: LookbookSectionType;
  title: string;
  description: string;
  imageUrl?: string;
  referenceFilm?: string;
  colorHex?: string; // for palette entries
  sortOrder: number;
  createdAt: string;
}

export interface DirectorStatement {
  id: string;
  projectId: string;
  text: string;
  updatedAt: string;
}
