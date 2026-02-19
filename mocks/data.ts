import { Project, Shot, ScheduleDay, CrewMember, Take, SceneBreakdown, LocationScout, BudgetItem, ContinuityNote, VFXShot, FestivalSubmission, ProductionNote, MoodBoardItem, DirectorCredit } from '@/types';

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'The Last Light',
    logline: 'A lighthouse keeper discovers that the light she tends is the only thing keeping an ancient darkness at bay.',
    genre: 'Thriller',
    status: 'production',
    format: 'Short Film',
    createdAt: '2025-12-01',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80',
    budget: 45000,
    director: 'Maya Chen',
    producer: 'Nina Petrov',
  },
  {
    id: '2',
    title: 'Echoes of Tomorrow',
    logline: 'In a city where memories can be traded, a young archivist stumbles upon a memory that changes everything.',
    genre: 'Sci-Fi Drama',
    status: 'pre-production',
    format: 'Feature Film',
    createdAt: '2026-01-15',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
    budget: 250000,
    director: 'Maya Chen',
    producer: 'Alex Roth',
  },
  {
    id: '3',
    title: 'Paper Cranes',
    logline: 'Two strangers connected through origami left in public places find their way to each other.',
    genre: 'Romance',
    status: 'development',
    format: 'Short Film',
    createdAt: '2026-02-10',
    imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80',
    budget: 15000,
  },
];

export const SAMPLE_SHOTS: Shot[] = [
  { id: 's1', projectId: '1', sceneNumber: 1, shotNumber: '1A', type: 'establishing', movement: 'static', lens: '24mm', description: 'Exterior lighthouse at dusk, waves crashing', notes: 'Golden hour only', status: 'approved' },
  { id: 's2', projectId: '1', sceneNumber: 1, shotNumber: '1B', type: 'wide', movement: 'crane', lens: '35mm', description: 'Pull back from lighthouse door to reveal coastline', notes: 'VFX cleanup needed for horizon', status: 'shot' },
  { id: 's3', projectId: '1', sceneNumber: 2, shotNumber: '2A', type: 'medium', movement: 'steadicam', lens: '50mm', description: 'Follow keeper climbing spiral stairs', notes: 'Practical lighting from window slats', status: 'planned' },
  { id: 's4', projectId: '1', sceneNumber: 2, shotNumber: '2B', type: 'close-up', movement: 'static', lens: '85mm', description: 'Keeper hands turning on the light mechanism', notes: 'Insert detail of worn hands', status: 'planned' },
  { id: 's5', projectId: '1', sceneNumber: 3, shotNumber: '3A', type: 'pov', movement: 'handheld', lens: '35mm', description: 'POV looking out from the top of the lighthouse', notes: 'Darkness encroaching from sea', status: 'ready' },
  { id: 's6', projectId: '1', sceneNumber: 3, shotNumber: '3B', type: 'over-shoulder', movement: 'dolly', lens: '50mm', description: 'OTS keeper watching the darkness approach', notes: 'Slow push in, build tension', status: 'planned' },
];

export const SAMPLE_SCHEDULE: ScheduleDay[] = [
  { id: 'd1', projectId: '1', date: '2026-03-15', dayNumber: 1, scenes: 'Sc. 1, 5, 8', location: 'Point Reyes Lighthouse', callTime: '5:30 AM', wrapTime: '7:00 PM', notes: 'Golden hour at 6:15 PM. All exterior scenes.' },
  { id: 'd2', projectId: '1', date: '2026-03-16', dayNumber: 2, scenes: 'Sc. 2, 3', location: 'Lighthouse Interior (Stage B)', callTime: '7:00 AM', wrapTime: '6:00 PM', notes: 'Spiral staircase rig needed. Check with grip dept.' },
  { id: 'd3', projectId: '1', date: '2026-03-17', dayNumber: 3, scenes: 'Sc. 4, 6, 7', location: 'Coastal Cliff / Beach', callTime: '6:00 AM', wrapTime: '5:00 PM', notes: 'Weather contingency: move to Sc. 9 studio work.' },
];

export const SAMPLE_CREW: CrewMember[] = [
  { id: 'c1', name: 'Maya Chen', role: 'Director', department: 'direction', phone: '+1 555-0101', email: 'maya@lastlight.film' },
  { id: 'c2', name: 'James Okafor', role: 'Director of Photography', department: 'camera', phone: '+1 555-0102', email: 'james@lastlight.film' },
  { id: 'c3', name: 'Priya Sharma', role: '1st Assistant Director', department: 'direction', phone: '+1 555-0103', email: 'priya@lastlight.film' },
  { id: 'c4', name: 'Leo Martinez', role: 'Sound Designer', department: 'sound', phone: '+1 555-0104', email: 'leo@lastlight.film' },
  { id: 'c5', name: 'Sarah Kim', role: 'Production Designer', department: 'art', phone: '+1 555-0105', email: 'sarah@lastlight.film' },
  { id: 'c6', name: 'Tom Hughes', role: 'Gaffer', department: 'lighting', phone: '+1 555-0106', email: 'tom@lastlight.film' },
  { id: 'c7', name: 'Nina Petrov', role: 'Line Producer', department: 'production', phone: '+1 555-0107', email: 'nina@lastlight.film' },
  { id: 'c8', name: 'Elena Voss', role: 'Lead Actress', department: 'talent', phone: '+1 555-0108', email: 'elena.agent@talent.com' },
];

export const SAMPLE_TAKES: Take[] = [
  { id: 't1', projectId: '1', sceneNumber: 1, shotNumber: '1A', takeNumber: 1, isCircled: false, isNG: false, notes: 'Good framing, timing off', timestamp: '2026-03-15T06:45:00' },
  { id: 't2', projectId: '1', sceneNumber: 1, shotNumber: '1A', takeNumber: 2, isCircled: true, isNG: false, notes: 'Perfect. Print this.', timestamp: '2026-03-15T06:52:00' },
  { id: 't3', projectId: '1', sceneNumber: 1, shotNumber: '1A', takeNumber: 3, isCircled: false, isNG: true, notes: 'Boom in frame', timestamp: '2026-03-15T06:58:00' },
];

export const SAMPLE_SCENE_BREAKDOWNS: SceneBreakdown[] = [
  {
    id: 'sb1', projectId: '1', sceneNumber: 1, sceneName: 'The Lighthouse at Dusk',
    intExt: 'EXT', timeOfDay: 'dusk', location: 'Point Reyes Lighthouse',
    cast: ['Elena Voss'], extras: '2 fishermen in background',
    props: ['Lantern', 'Rope coil', 'Journal'], wardrobe: ['Weathered overcoat', 'Wool scarf'],
    specialEquipment: ['Crane', 'Wind machine'], notes: 'Need golden hour. Backup: magic hour composite.',
    pageCount: '2 3/8',
  },
  {
    id: 'sb2', projectId: '1', sceneNumber: 2, sceneName: 'Climbing the Tower',
    intExt: 'INT', timeOfDay: 'night', location: 'Lighthouse Interior (Stage B)',
    cast: ['Elena Voss'], extras: '',
    props: ['Oil lamp', 'Worn key ring'], wardrobe: ['Same overcoat from Sc.1'],
    specialEquipment: ['Steadicam rig', 'Practical window lights'], notes: 'Spiral staircase. Safety harness required.',
    pageCount: '1 5/8',
  },
  {
    id: 'sb3', projectId: '1', sceneNumber: 3, sceneName: 'The View From Above',
    intExt: 'INT/EXT', timeOfDay: 'night', location: 'Lighthouse Top / Green Screen',
    cast: ['Elena Voss'], extras: '',
    props: ['Binoculars', 'Light mechanism controls'], wardrobe: ['Same overcoat'],
    specialEquipment: ['Green screen panels', 'LED volume'], notes: 'VFX plate for sea darkness. Shoot plate separately day 1.',
    pageCount: '3 1/8',
  },
];

export const SAMPLE_LOCATIONS: LocationScout[] = [
  {
    id: 'loc1', projectId: '1', name: 'Point Reyes Lighthouse',
    address: 'Point Reyes National Seashore, CA 94956',
    contactName: 'Park Ranger Davis', contactPhone: '+1 555-0201',
    permitRequired: true, permitStatus: 'Approved',
    parkingNotes: 'Crew parking 0.3mi from set. Shuttle needed.',
    powerAvailable: false, notes: 'Generator required. No drone zone. Check tide schedule.',
    rating: 5, photoUrls: [], scenes: ['1', '5', '8'],
  },
  {
    id: 'loc2', projectId: '1', name: 'Stage B - Lighthouse Interior',
    address: '450 Industrial Blvd, San Rafael, CA',
    contactName: 'Mike from Stage Mgmt', contactPhone: '+1 555-0202',
    permitRequired: false, permitStatus: 'N/A',
    parkingNotes: 'Full lot available. Load-in dock on east side.',
    powerAvailable: true, notes: 'Build spiral staircase set piece. 2 day build.',
    rating: 4, photoUrls: [], scenes: ['2', '3'],
  },
];

export const SAMPLE_BUDGET: BudgetItem[] = [
  { id: 'b1', projectId: '1', category: 'talent', description: 'Elena Voss - Lead', estimated: 8000, actual: 8000, notes: 'SAG-AFTRA short film agreement', paid: true },
  { id: 'b2', projectId: '1', category: 'crew', description: 'DP - James Okafor (3 days)', estimated: 4500, actual: 4500, notes: '', paid: true },
  { id: 'b3', projectId: '1', category: 'equipment', description: 'Camera package (ARRI Alexa Mini)', estimated: 3600, actual: 3200, notes: 'Got indie rate from rental house', paid: true },
  { id: 'b4', projectId: '1', category: 'locations', description: 'Point Reyes permit + fees', estimated: 1200, actual: 1200, notes: 'Park filming permit', paid: true },
  { id: 'b5', projectId: '1', category: 'locations', description: 'Stage B rental (5 days)', estimated: 5000, actual: 5000, notes: 'Includes 2 days build + 2 days shoot + 1 day strike', paid: false },
  { id: 'b6', projectId: '1', category: 'catering', description: 'Craft services (3 shoot days)', estimated: 2400, actual: 1800, notes: 'Local caterer, saved on day 3', paid: true },
  { id: 'b7', projectId: '1', category: 'post-production', description: 'Color grading', estimated: 3000, actual: 0, notes: 'Scheduled for April', paid: false },
  { id: 'b8', projectId: '1', category: 'post-production', description: 'VFX - sea darkness shots', estimated: 6000, actual: 0, notes: 'Awaiting bid from Pixel Forge', paid: false },
  { id: 'b9', projectId: '1', category: 'music', description: 'Original score', estimated: 4000, actual: 0, notes: 'Composer attached: Yuki Tanaka', paid: false },
  { id: 'b10', projectId: '1', category: 'insurance', description: 'Production insurance', estimated: 2000, actual: 2000, notes: 'Short-term entertainment policy', paid: true },
];

export const SAMPLE_CONTINUITY: ContinuityNote[] = [
  { id: 'cn1', projectId: '1', sceneNumber: 1, shotNumber: '1A', description: 'Lantern position', details: 'Lantern in left hand, held at waist height. Scarf tucked into coat on right side.', timestamp: '2026-03-15T06:50:00' },
  { id: 'cn2', projectId: '1', sceneNumber: 1, shotNumber: '1B', description: 'Hair continuity', details: 'Hair loose, blown right by wind machine. Strand across face at end of take.', timestamp: '2026-03-15T07:15:00' },
];

export const SAMPLE_VFX: VFXShot[] = [
  { id: 'vfx1', projectId: '1', sceneNumber: 1, shotNumber: '1B', description: 'Horizon cleanup - remove modern structures', complexity: 'simple', status: 'in-progress', vendor: 'Pixel Forge VFX', deadline: '2026-04-15', notes: 'Wire removal + horizon paint out', estimatedCost: 800 },
  { id: 'vfx2', projectId: '1', sceneNumber: 3, shotNumber: '3A', description: 'Darkness entity approaching from sea', complexity: 'hero', status: 'pending', vendor: 'Pixel Forge VFX', deadline: '2026-05-01', notes: 'Key hero VFX shot. Reference: Annihilation shimmer.', estimatedCost: 4000 },
  { id: 'vfx3', projectId: '1', sceneNumber: 3, shotNumber: '3B', description: 'Window reflections of darkness', complexity: 'moderate', status: 'pending', vendor: '', deadline: '2026-05-01', notes: 'Practical + CG augmentation', estimatedCost: 1200 },
];

export const SAMPLE_FESTIVALS: FestivalSubmission[] = [
  { id: 'f1', projectId: '1', festivalName: 'Sundance Film Festival', location: 'Park City, UT', deadline: '2026-09-15', submissionDate: '', fee: 75, status: 'researching', category: 'Short Film', platformUrl: 'https://filmfreeway.com/sundance', notes: 'Premiere requirement: World Premiere', notificationDate: '2026-12-01' },
  { id: 'f2', projectId: '1', festivalName: 'SXSW', location: 'Austin, TX', deadline: '2026-09-20', submissionDate: '', fee: 55, status: 'researching', category: 'Narrative Short', platformUrl: 'https://filmfreeway.com/sxsw', notes: 'Early bird deadline. Regular: Oct 15', notificationDate: '2027-01-15' },
  { id: 'f3', projectId: '1', festivalName: 'Palm Springs ShortFest', location: 'Palm Springs, CA', deadline: '2026-08-01', submissionDate: '', fee: 45, status: 'researching', category: 'Live Action Short', platformUrl: '', notes: 'Oscar-qualifying festival', notificationDate: '2026-10-15' },
];

export const SAMPLE_NOTES: ProductionNote[] = [
  { id: 'n1', projectId: '1', title: 'Director\'s Vision Statement', content: 'The Last Light is a meditation on isolation and purpose. The lighthouse is both prison and sanctuary. Visual language: Kubrickian symmetry in interior shots, Malick-inspired naturalism for exteriors. The darkness is never fully shown—only suggested. Let the audience\'s imagination do the heavy lifting.', category: 'creative', createdAt: '2025-12-15T10:00:00', updatedAt: '2026-01-20T14:30:00', pinned: true },
  { id: 'n2', projectId: '1', title: 'Sound Design Brief', content: 'The lighthouse itself should have a heartbeat—a low, rhythmic pulse from the light mechanism. Wind and waves are constant companions. The darkness has NO sound. Its approach is marked by the ABSENCE of natural sound. Score should be sparse, cello-driven.', category: 'creative', createdAt: '2026-01-05T09:00:00', updatedAt: '2026-01-05T09:00:00', pinned: false },
  { id: 'n3', projectId: '1', title: 'Day 1 Wrap Notes', content: 'Wrapped 30min early. Got all exterior coverage. Wind machine worked great for Sc.1. Elena nailed the final beat in 2 takes. Need to reshoot fisherman extras—they looked too modern. Check wardrobe.', category: 'logistics', createdAt: '2026-03-15T19:30:00', updatedAt: '2026-03-15T19:30:00', pinned: false },
];

export const SAMPLE_MOOD_BOARD: MoodBoardItem[] = [
  { id: 'mb1', projectId: '1', boardName: 'Visual Tone', type: 'color', color: '#1a2940', label: 'Deep Ocean Blue' },
  { id: 'mb2', projectId: '1', boardName: 'Visual Tone', type: 'color', color: '#c8a04a', label: 'Lighthouse Gold' },
  { id: 'mb3', projectId: '1', boardName: 'Visual Tone', type: 'color', color: '#2d1b2e', label: 'The Darkness' },
  { id: 'mb4', projectId: '1', boardName: 'Visual Tone', type: 'color', color: '#e8d5b7', label: 'Warm Interior' },
  { id: 'mb5', projectId: '1', boardName: 'Visual Tone', type: 'note', note: 'Think Vilmos Zsigmond meets Roger Deakins. Natural light for exteriors, controlled practicals for interiors. Never flat, always depth.', label: 'Lighting Philosophy' },
  { id: 'mb6', projectId: '1', boardName: 'Visual Tone', type: 'reference', imageUrl: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&q=80', label: 'Lighthouse Reference' },
  { id: 'mb7', projectId: '1', boardName: 'Visual Tone', type: 'reference', imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=80', label: 'Ocean Mood' },
];

export const SAMPLE_CREDITS: DirectorCredit[] = [
  { id: 'dc1', title: 'The Last Light', role: 'Director / Writer', year: '2026', format: 'Short Film', festival: 'In Progress', award: '', notes: 'Currently in production' },
  { id: 'dc2', title: 'Quiet Streets', role: 'Director', year: '2024', format: 'Short Film', festival: 'Tribeca Film Festival', award: 'Best Short Film', notes: 'Premiered at Tribeca 2024' },
  { id: 'dc3', title: 'Neon Lullaby', role: 'Director / Editor', year: '2023', format: 'Music Video', festival: '', award: '', notes: 'For artist Mira Lake. 2M+ views.' },
];

export const SHOT_TYPES: { label: string; value: string }[] = [
  { label: 'Wide', value: 'wide' },
  { label: 'Medium', value: 'medium' },
  { label: 'Close-Up', value: 'close-up' },
  { label: 'Extreme CU', value: 'extreme-close-up' },
  { label: 'Over Shoulder', value: 'over-shoulder' },
  { label: 'POV', value: 'pov' },
  { label: 'Aerial', value: 'aerial' },
  { label: 'Insert', value: 'insert' },
  { label: 'Two-Shot', value: 'two-shot' },
  { label: 'Establishing', value: 'establishing' },
];

export const SHOT_MOVEMENTS: { label: string; value: string }[] = [
  { label: 'Static', value: 'static' },
  { label: 'Pan', value: 'pan' },
  { label: 'Tilt', value: 'tilt' },
  { label: 'Dolly', value: 'dolly' },
  { label: 'Tracking', value: 'tracking' },
  { label: 'Crane', value: 'crane' },
  { label: 'Handheld', value: 'handheld' },
  { label: 'Steadicam', value: 'steadicam' },
  { label: 'Zoom', value: 'zoom' },
];

export const DEPARTMENTS: { label: string; value: string }[] = [
  { label: 'Direction', value: 'direction' },
  { label: 'Camera', value: 'camera' },
  { label: 'Sound', value: 'sound' },
  { label: 'Art', value: 'art' },
  { label: 'Lighting', value: 'lighting' },
  { label: 'Production', value: 'production' },
  { label: 'Talent', value: 'talent' },
  { label: 'Post-Production', value: 'postProduction' },
];

export const PROJECT_STATUSES: { label: string; value: string }[] = [
  { label: 'Development', value: 'development' },
  { label: 'Pre-Production', value: 'pre-production' },
  { label: 'Production', value: 'production' },
  { label: 'Post-Production', value: 'post-production' },
  { label: 'Completed', value: 'completed' },
];

export const GENRES: string[] = [
  'Drama', 'Thriller', 'Sci-Fi', 'Horror', 'Comedy',
  'Romance', 'Documentary', 'Animation', 'Action', 'Experimental',
  'Sci-Fi Drama', 'Dark Comedy', 'Musical', 'Mystery', 'Western',
];

export const BUDGET_CATEGORIES: { label: string; value: string }[] = [
  { label: 'Talent', value: 'talent' },
  { label: 'Crew', value: 'crew' },
  { label: 'Equipment', value: 'equipment' },
  { label: 'Locations', value: 'locations' },
  { label: 'Production Design', value: 'production-design' },
  { label: 'Post-Production', value: 'post-production' },
  { label: 'Music', value: 'music' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Legal', value: 'legal' },
  { label: 'Insurance', value: 'insurance' },
  { label: 'Catering', value: 'catering' },
  { label: 'Transport', value: 'transport' },
  { label: 'Contingency', value: 'contingency' },
  { label: 'Other', value: 'other' },
];

export const LENS_DATA = [
  { focal: 14, type: 'Ultra Wide', fov: 114, use: 'Extreme wide establishing shots, landscapes' },
  { focal: 18, type: 'Ultra Wide', fov: 100, use: 'Interiors, architecture, dramatic perspectives' },
  { focal: 24, type: 'Wide', fov: 84, use: 'Establishing shots, wide coverage, walk-and-talk' },
  { focal: 28, type: 'Wide', fov: 75, use: 'Street photography look, documentary feel' },
  { focal: 35, type: 'Standard Wide', fov: 63, use: 'Most versatile. Master shots, two-shots, walking' },
  { focal: 50, type: 'Normal', fov: 47, use: 'Eye-level perspective, dialogue scenes, portraits' },
  { focal: 65, type: 'Short Tele', fov: 38, use: 'Flattering portraits, medium close-ups' },
  { focal: 85, type: 'Telephoto', fov: 29, use: 'Close-ups, beauty shots, compressed backgrounds' },
  { focal: 100, type: 'Telephoto', fov: 24, use: 'Tight close-ups, reaction shots' },
  { focal: 135, type: 'Telephoto', fov: 18, use: 'Extreme close-ups, voyeuristic feel' },
  { focal: 200, type: 'Long Tele', fov: 12, use: 'Surveillance look, extreme compression' },
];
