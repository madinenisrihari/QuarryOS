/** Recharts renders SVG attributes, which can't use CSS variables, so the dark palette is mirrored here.
 *  When light mode ships, derive these from a theme hook. */
export const C = {
  sand: '#cdba9a', sandDim: '#8e806a', titanium: '#a0a8b2', ai: '#6ec1d6', ok: '#6cba94', warn: '#daaa60', bad: '#d66e64', info: '#7ea4d6',
  grid: 'rgba(255,255,255,0.06)', axis: '#8b8f98', surface: '#1a1d21',
}
export const TYPE_COLORS: Record<string, string> = {
  'Black Galaxy': '#cdba9a', 'Absolute Black': '#7ea4d6', 'Steel Grey': '#a0a8b2', 'Tan Brown': '#b98a5e', 'Colonial White': '#e2ddd2', 'Viscount White': '#8e806a',
}
