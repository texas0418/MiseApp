// ============================================
// ADD TO END OF: types/index.ts
// ============================================

// Scene Rating / Selects
export type SelectRating = 1 | 2 | 3 | 4 | 5;

export interface SceneSelect {
  id: string;
  projectId: string;
  sceneNumber: number;
  shotNumber: string;
  takeNumber: number;
  rating: SelectRating;
  isCircled: boolean;
  isAlt: boolean; // alternate select
  editorNote: string; // note for the editor
  performanceNote: string; // director's note on performance
  technicalNote: string; // focus, framing, exposure issues
  timecode?: string; // in-point timecode
  createdAt: string;
}
