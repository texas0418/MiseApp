// ============================================
// ADD TO END OF: mocks/data.ts
// ============================================

// Add LookbookItem, DirectorStatement to the import from '@/types'

export const SAMPLE_LOOKBOOK: LookbookItem[] = [
  {
    id: 'lb-1',
    projectId: '1',
    section: 'tone',
    title: 'Quiet Devastation',
    description: 'The film lives in silences. Every conversation has more unsaid than said. Think Antonioni\'s sense of alienation but grounded in American Southwest landscapes. The audience should feel the heat, the dust, the weight of what Marcus carries.',
    sortOrder: 0,
    createdAt: '2025-02-10T10:00:00Z',
  },
  {
    id: 'lb-2',
    projectId: '1',
    section: 'visual-style',
    title: 'Natural Light, Long Takes',
    description: 'Shoot with available light whenever possible. The desert sequences should feel like Malick — golden, expansive, almost spiritual. Interior scenes are cramped, underlit, claustrophobic. Let the environments tell the emotional story.',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600',
    sortOrder: 1,
    createdAt: '2025-02-10T10:00:00Z',
  },
  {
    id: 'lb-3',
    projectId: '1',
    section: 'color-palette',
    title: 'Desert Warm / Interior Cool',
    description: 'Exteriors: amber, burnt sienna, dusty gold. Interiors: steel blue, muted green, gray. The color temperature shift mirrors Marcus\'s internal state — warmth when he\'s moving, cold when he\'s trapped.',
    colorHex: '#D4A76A',
    sortOrder: 2,
    createdAt: '2025-02-10T10:00:00Z',
  },
  {
    id: 'lb-4',
    projectId: '1',
    section: 'reference-film',
    title: 'Paris, Texas (1984)',
    description: 'The spiritual ancestor of this film. A man walking through the desert, running from himself. Wenders understood that landscape IS character. We borrow the pacing and the ache, but our story is more compressed — Marcus doesn\'t have years, he has days.',
    referenceFilm: 'Paris, Texas',
    sortOrder: 3,
    createdAt: '2025-02-10T10:00:00Z',
  },
  {
    id: 'lb-5',
    projectId: '1',
    section: 'reference-film',
    title: 'No Country for Old Men (2007)',
    description: 'The Coens showed that the Southwest can feel like another planet. Deakins\' photography — clean, precise, terrifyingly beautiful. We want that level of compositional discipline, especially in the wider shots.',
    referenceFilm: 'No Country for Old Men',
    sortOrder: 4,
    createdAt: '2025-02-10T10:00:00Z',
  },
  {
    id: 'lb-6',
    projectId: '1',
    section: 'shot-style',
    title: 'Locked-Off Frames',
    description: 'Minimal camera movement. When the camera moves, it means something. Static frames that let the audience study the composition. Movement is reserved for moments of emotional shift — dolly in when Marcus finally speaks truth, slow push when Elena breaks.',
    sortOrder: 5,
    createdAt: '2025-02-10T10:00:00Z',
  },
  {
    id: 'lb-7',
    projectId: '1',
    section: 'character-look',
    title: 'Marcus: Worn Minimalism',
    description: 'Everything Marcus wears tells you he stopped caring about himself. Faded, dusty, functional. One hero piece: the leather jacket he\'s had for 15 years. It\'s armor. He never takes it off until the final scene.',
    sortOrder: 6,
    createdAt: '2025-02-10T10:00:00Z',
  },
  {
    id: 'lb-8',
    projectId: '1',
    section: 'sound-music',
    title: 'Ambient Dread, Sparse Score',
    description: 'The sound design does the heavy lifting. Wind, highway hum, distant thunder. Score enters sparingly — solo guitar, single cello line. Never sentimental. The music should feel like it\'s coming from inside Marcus\'s head.',
    sortOrder: 7,
    createdAt: '2025-02-10T10:00:00Z',
  },
];

export const SAMPLE_DIRECTOR_STATEMENT: DirectorStatement[] = [
  {
    id: 'ds-1',
    projectId: '1',
    text: 'The Last Light is about the moment you realize you can\'t outrun yourself. Marcus drives because stopping means thinking, and thinking means remembering. This is a film about what happens when the road ends.\n\nI want the audience to sit with discomfort. To feel the silence between two people who once loved each other and now can barely look at each other. The desert is not a metaphor — it\'s a mirror. It shows you exactly what you are when everything else is stripped away.\n\nWe\'re making a film that trusts the audience. No exposition dumps, no flashback montages. Just faces, landscapes, and the terrible gravity of choices we can\'t undo.',
    updatedAt: '2025-02-12T10:00:00Z',
  },
];
