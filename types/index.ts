// ============================================
// ADD TO END OF: types/index.ts
// ============================================

// Cast Manager
export type CastStatus = 'confirmed' | 'in-talks' | 'auditioned' | 'wishlist' | 'wrapped';

export interface CastMember {
  id: string;
  projectId: string;
  actorName: string;
  characterName: string;
  characterDescription: string;
  status: CastStatus;
  headshot?: string;
  email?: string;
  phone?: string;
  agentName?: string;
  agentContact?: string;
  scenes: number[]; // scene numbers this character appears in
  shootDays: string[]; // dates (YYYY-MM-DD)
  availability: string;
  performanceNotes: string;
  preferredTakes?: string; // notes on best takes for editor
  costumeNotes?: string;
  createdAt: string;
}
