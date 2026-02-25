// ============================================
// CHANGES TO: contexts/ProjectContext.tsx
// ============================================

// 1. ADD to the import from '@/types':
//    ScriptSide

// 2. ADD to the import from '@/mocks/data':
//    SAMPLE_SCRIPT_SIDES

// 3. ADD to STORAGE_KEYS object:
//    scriptSides: 'mise_script_sides',

// 4. ADD after the timeEntryStore line (around line 106):
//    const scriptSideStore = useEntityStore<ScriptSide>('scriptSides', STORAGE_KEYS.scriptSides, SAMPLE_SCRIPT_SIDES);

// 5. ADD after "const timeEntries = timeEntryStore.items;":
//    const scriptSides = scriptSideStore.items;

// 6. ADD "scriptSides," to the return object (in the data section)

// 7. ADD to the return object (in the CRUD section):
//    addScriptSide: scriptSideStore.add, updateScriptSide: scriptSideStore.update, deleteScriptSide: scriptSideStore.remove,

// 8. ADD at the bottom of the file (after useLocationWeatherData):
// export function useProjectScriptSides(projectId: string | null) {
//   const { scriptSides } = useProjects();
//   return scriptSides.filter(s => s.projectId === projectId).sort((a, b) => a.sceneNumber - b.sceneNumber);
// }
