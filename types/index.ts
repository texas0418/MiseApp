// ============================================
// ADD TO: types/index.ts (at the end of the file)
// ============================================

// Script Sides
export type SidesStatus = 'upcoming' | 'shooting-today' | 'completed' | 'revised';

export interface SideAnnotation {
  id: string;
  text: string;
  type: 'blocking' | 'performance' | 'camera' | 'general';
  timestamp: string;
}

export interface ScriptSide {
  id: string;
  projectId: string;
  sceneNumber: number;
  sceneHeader: string; // e.g. "INT. APARTMENT - NIGHT"
  pageStart: string; // e.g. "12"
  pageEnd: string; // e.g. "14A"
  pageCount: number; // e.g. 2.5 (eighths)
  shootDate: string;
  status: SidesStatus;
  synopsis: string;
  castIds: string[]; // character names or cast IDs
  linkedShotIds: string[]; // links to shot list
  annotations: SideAnnotation[];
  revisionColor?: string; // industry standard: white, blue, pink, yellow, green, goldenrod
  revisionDate?: string;
  notes: string;
  createdAt: string;
}
