import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Project, Shot, ScheduleDay, CrewMember, Take, SceneBreakdown, LocationScout, BudgetItem, ContinuityNote, VFXShot, FestivalSubmission, ProductionNote, MoodBoardItem, DirectorCredit } from '@/types';
import { SAMPLE_PROJECTS, SAMPLE_SHOTS, SAMPLE_SCHEDULE, SAMPLE_CREW, SAMPLE_TAKES, SAMPLE_SCENE_BREAKDOWNS, SAMPLE_LOCATIONS, SAMPLE_BUDGET, SAMPLE_CONTINUITY, SAMPLE_VFX, SAMPLE_FESTIVALS, SAMPLE_NOTES, SAMPLE_MOOD_BOARD, SAMPLE_CREDITS } from '@/mocks/data';

const STORAGE_KEYS = {
  projects: 'mise_projects',
  shots: 'mise_shots',
  schedule: 'mise_schedule',
  crew: 'mise_crew',
  takes: 'mise_takes',
  activeProject: 'mise_active_project',
  sceneBreakdowns: 'mise_scene_breakdowns',
  locations: 'mise_locations',
  budget: 'mise_budget',
  continuity: 'mise_continuity',
  vfx: 'mise_vfx',
  festivals: 'mise_festivals',
  notes: 'mise_notes',
  moodBoard: 'mise_mood_board',
  credits: 'mise_credits',
};

async function loadFromStorage<T>(key: string, fallback: T[]): Promise<T[]> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    await AsyncStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  } catch (e) {
    console.log('Storage load error:', e);
    return fallback;
  }
}

async function saveToStorage<T>(key: string, data: T[]): Promise<T[]> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return data;
  } catch (e) {
    console.log('Storage save error:', e);
    return data;
  }
}

function useEntityStore<T extends { id: string }>(queryKey: string, storageKey: string, fallback: T[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [queryKey],
    queryFn: () => loadFromStorage<T>(storageKey, fallback),
  });

  const saveMutation = useMutation({
    mutationFn: (data: T[]) => saveToStorage(storageKey, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
  });

  const items = query.data ?? [];

  const add = useCallback((item: T) => {
    saveMutation.mutate([...items, item]);
  }, [items]);

  const update = useCallback((item: T) => {
    saveMutation.mutate(items.map(i => i.id === item.id ? item : i));
  }, [items]);

  const remove = useCallback((id: string) => {
    saveMutation.mutate(items.filter(i => i.id !== id));
  }, [items]);

  return { items, add, update, remove, isLoading: query.isLoading };
}

export const [ProjectProvider, useProjects] = createContextHook(() => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>('1');

  const projectStore = useEntityStore<Project>('projects', STORAGE_KEYS.projects, SAMPLE_PROJECTS);
  const shotStore = useEntityStore<Shot>('shots', STORAGE_KEYS.shots, SAMPLE_SHOTS);
  const scheduleStore = useEntityStore<ScheduleDay>('schedule', STORAGE_KEYS.schedule, SAMPLE_SCHEDULE);
  const crewStore = useEntityStore<CrewMember>('crew', STORAGE_KEYS.crew, SAMPLE_CREW);
  const takeStore = useEntityStore<Take>('takes', STORAGE_KEYS.takes, SAMPLE_TAKES);
  const breakdownStore = useEntityStore<SceneBreakdown>('sceneBreakdowns', STORAGE_KEYS.sceneBreakdowns, SAMPLE_SCENE_BREAKDOWNS);
  const locationStore = useEntityStore<LocationScout>('locations', STORAGE_KEYS.locations, SAMPLE_LOCATIONS);
  const budgetStore = useEntityStore<BudgetItem>('budget', STORAGE_KEYS.budget, SAMPLE_BUDGET);
  const continuityStore = useEntityStore<ContinuityNote>('continuity', STORAGE_KEYS.continuity, SAMPLE_CONTINUITY);
  const vfxStore = useEntityStore<VFXShot>('vfx', STORAGE_KEYS.vfx, SAMPLE_VFX);
  const festivalStore = useEntityStore<FestivalSubmission>('festivals', STORAGE_KEYS.festivals, SAMPLE_FESTIVALS);
  const noteStore = useEntityStore<ProductionNote>('notes', STORAGE_KEYS.notes, SAMPLE_NOTES);
  const moodBoardStore = useEntityStore<MoodBoardItem>('moodBoard', STORAGE_KEYS.moodBoard, SAMPLE_MOOD_BOARD);
  const creditStore = useEntityStore<DirectorCredit>('credits', STORAGE_KEYS.credits, SAMPLE_CREDITS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.activeProject).then((id) => {
      if (id) setActiveProjectId(id);
    });
  }, []);

  const selectProject = useCallback((id: string) => {
    setActiveProjectId(id);
    AsyncStorage.setItem(STORAGE_KEYS.activeProject, id);
  }, []);

  const projects = projectStore.items;
  const shots = shotStore.items;
  const schedule = scheduleStore.items;
  const crew = crewStore.items;
  const takes = takeStore.items;
  const sceneBreakdowns = breakdownStore.items;
  const locations = locationStore.items;
  const budgetItems = budgetStore.items;
  const continuityNotes = continuityStore.items;
  const vfxShots = vfxStore.items;
  const festivals = festivalStore.items;
  const productionNotes = noteStore.items;
  const moodBoardItems = moodBoardStore.items;
  const directorCredits = creditStore.items;

  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;
  const isLoading = projectStore.isLoading || shotStore.isLoading || scheduleStore.isLoading || crewStore.isLoading || takeStore.isLoading;

  return {
    projects, shots, schedule, crew, takes,
    sceneBreakdowns, locations, budgetItems, continuityNotes,
    vfxShots, festivals, productionNotes, moodBoardItems, directorCredits,
    activeProject, activeProjectId, isLoading,
    selectProject,
    addProject: projectStore.add, updateProject: projectStore.update, deleteProject: projectStore.remove,
    addShot: shotStore.add, updateShot: shotStore.update, deleteShot: shotStore.remove,
    addScheduleDay: scheduleStore.add, updateScheduleDay: scheduleStore.update, deleteScheduleDay: scheduleStore.remove,
    addCrewMember: crewStore.add, updateCrewMember: crewStore.update, deleteCrewMember: crewStore.remove,
    addTake: takeStore.add, updateTake: takeStore.update,
    addBreakdown: breakdownStore.add, updateBreakdown: breakdownStore.update, deleteBreakdown: breakdownStore.remove,
    addLocation: locationStore.add, updateLocation: locationStore.update, deleteLocation: locationStore.remove,
    addBudgetItem: budgetStore.add, updateBudgetItem: budgetStore.update, deleteBudgetItem: budgetStore.remove,
    addContinuityNote: continuityStore.add, updateContinuityNote: continuityStore.update, deleteContinuityNote: continuityStore.remove,
    addVFXShot: vfxStore.add, updateVFXShot: vfxStore.update, deleteVFXShot: vfxStore.remove,
    addFestival: festivalStore.add, updateFestival: festivalStore.update, deleteFestival: festivalStore.remove,
    addNote: noteStore.add, updateNote: noteStore.update, deleteNote: noteStore.remove,
    addMoodBoardItem: moodBoardStore.add, updateMoodBoardItem: moodBoardStore.update, deleteMoodBoardItem: moodBoardStore.remove,
    addCredit: creditStore.add, updateCredit: creditStore.update, deleteCredit: creditStore.remove,
  };
});

export function useProjectShots(projectId: string | null) {
  const { shots } = useProjects();
  return shots.filter(s => s.projectId === projectId);
}

export function useProjectSchedule(projectId: string | null) {
  const { schedule } = useProjects();
  return schedule.filter(d => d.projectId === projectId).sort((a, b) => a.dayNumber - b.dayNumber);
}

export function useProjectTakes(projectId: string | null) {
  const { takes } = useProjects();
  return takes.filter(t => t.projectId === projectId);
}

export function useProjectBreakdowns(projectId: string | null) {
  const { sceneBreakdowns } = useProjects();
  return sceneBreakdowns.filter(b => b.projectId === projectId).sort((a, b) => a.sceneNumber - b.sceneNumber);
}

export function useProjectLocations(projectId: string | null) {
  const { locations } = useProjects();
  return locations.filter(l => l.projectId === projectId);
}

export function useProjectBudget(projectId: string | null) {
  const { budgetItems } = useProjects();
  return budgetItems.filter(b => b.projectId === projectId);
}

export function useProjectContinuity(projectId: string | null) {
  const { continuityNotes } = useProjects();
  return continuityNotes.filter(c => c.projectId === projectId);
}

export function useProjectVFX(projectId: string | null) {
  const { vfxShots } = useProjects();
  return vfxShots.filter(v => v.projectId === projectId);
}

export function useProjectFestivals(projectId: string | null) {
  const { festivals } = useProjects();
  return festivals.filter(f => f.projectId === projectId);
}

export function useProjectNotes(projectId: string | null) {
  const { productionNotes } = useProjects();
  return productionNotes.filter(n => n.projectId === projectId);
}

export function useProjectMoodBoard(projectId: string | null) {
  const { moodBoardItems } = useProjects();
  return moodBoardItems.filter(m => m.projectId === projectId);
}
