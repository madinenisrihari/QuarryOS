import type { Quarry } from '@/types/models'

/** DEMO DATA: fictional operator and quarries used to illustrate the product. */
export const QUARRIES: Quarry[] = [
  {
    id: 'q-kondapi',
    slug: 'meridian-granites',
    name: 'Kondapi Ridge',
    company: 'Meridian Granites',
    district: 'Prakasam',
    state: 'Andhra Pradesh',
    country: 'India',
    areaHectares: 14.6,
    established: 2009,
    stoneTypes: ['Black Galaxy', 'Absolute Black', 'Steel Grey'],
    certifications: ['Mining lease on file', 'Environmental clearance on file', 'ISO 9001 (sample entry)'],
    about:
      'Dimension-stone quarry producing dark granite blocks for slab and tile manufacturers. Blocks are measured, photographed and tagged with a QR code before entering the yard.',
    benches: [
      { id: 'KR-B1', name: 'Bench 1 · North face', levelM: 6, stone: 'Black Galaxy', status: 'active', estReserveM3: 18400, crew: 'Crew Alpha' },
      { id: 'KR-B2', name: 'Bench 2 · North face', levelM: 12, stone: 'Black Galaxy', status: 'active', estReserveM3: 22100, crew: 'Crew Bravo' },
      { id: 'KR-B3', name: 'Bench 3 · East cut', levelM: 6, stone: 'Absolute Black', status: 'active', estReserveM3: 15800, crew: 'Crew Charlie' },
      { id: 'KR-B4', name: 'Bench 4 · East cut', levelM: 12, stone: 'Steel Grey', status: 'idle', estReserveM3: 9600, crew: 'Unassigned' },
      { id: 'KR-B5', name: 'Bench 5 · South slope', levelM: 18, stone: 'Absolute Black', status: 'planned', estReserveM3: 12200, crew: 'Unassigned' },
    ],
  },
  {
    id: 'q-nagavaram',
    slug: 'meridian-granites-nagavaram',
    name: 'Nagavaram Hills',
    company: 'Meridian Granites',
    district: 'Srikakulam',
    state: 'Andhra Pradesh',
    country: 'India',
    areaHectares: 9.8,
    established: 2015,
    stoneTypes: ['Tan Brown', 'Colonial White', 'Viscount White'],
    certifications: ['Mining lease on file', 'Environmental clearance on file'],
    about:
      'Light-coloured and warm-toned granite quarry serving export fabricators. Smaller bench faces yield consistent, low-fissure blocks.',
    benches: [
      { id: 'NH-B1', name: 'Bench 1 · West wall', levelM: 6, stone: 'Colonial White', status: 'active', estReserveM3: 11200, crew: 'Crew Delta' },
      { id: 'NH-B2', name: 'Bench 2 · West wall', levelM: 12, stone: 'Viscount White', status: 'active', estReserveM3: 9400, crew: 'Crew Echo' },
      { id: 'NH-B3', name: 'Bench 3 · Central pit', levelM: 6, stone: 'Tan Brown', status: 'active', estReserveM3: 13500, crew: 'Crew Foxtrot' },
    ],
  },
]

export const getQuarry = (id: string) => QUARRIES.find((q) => q.id === id)
export const getQuarryBySlug = (slug: string) => QUARRIES.find((q) => q.slug === slug)
