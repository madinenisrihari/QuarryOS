import type { GraniteType } from '@/types/models'

/** Visual recipes shared by the 2D swatches and the 3D block textures. Kept free of three.js. */
export interface Recipe { base: string; mottle: string; flecks: string[]; count: number; maxSize: number; roughness: number }

export const RECIPES: Record<GraniteType, Recipe> = {
  'Black Galaxy': { base: '#0e0f11', mottle: '#2b2c31', flecks: ['#e0b862', '#b9773a', '#f4dc98', '#8d8f96'], count: 11000, maxSize: 2.4, roughness: 0.26 },
  'Absolute Black': { base: '#08080a', mottle: '#1b1b1f', flecks: ['#3a3a40', '#4c4c54'], count: 3000, maxSize: 1.6, roughness: 0.22 },
  'Steel Grey': { base: '#565b61', mottle: '#30343a', flecks: ['#e4e6e9', '#20242a', '#9aa0a8'], count: 9000, maxSize: 2.2, roughness: 0.4 },
  'Tan Brown': { base: '#5b3d28', mottle: '#2b190e', flecks: ['#d29a62', '#1c0f08', '#8f6440'], count: 9500, maxSize: 2.8, roughness: 0.38 },
  'Colonial White': { base: '#c9c5bb', mottle: '#8c887e', flecks: ['#763a3e', '#4a4744', '#a59f95'], count: 7000, maxSize: 2.4, roughness: 0.4 },
  'Viscount White': { base: '#d3cec3', mottle: '#978f82', flecks: ['#6b6156', '#4d443c', '#b9b1a4'], count: 6500, maxSize: 2.6, roughness: 0.4 },
}

