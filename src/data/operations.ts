import type { Machine, MaintenanceRecord, ProductionEntry, Trip, Vehicle } from '@/types/models'
import { isoDaysAgo, isoDaysAhead } from './clock'

import { ORDERS } from './commerce'
import { mulberry32 } from '@/lib/seed'

/** DEMO DATA: registration numbers are fictional. */
export const VEHICLES: Vehicle[] = [
  { id: 'v1', reg: 'AP 27 TB 4821', kind: '40 t trailer', capacityT: 40, driver: 'Ganesh Yadav', status: 'on_trip', utilisationPct: 86, kmThisMonth: 3120, fitnessExpiry: isoDaysAhead(140), insuranceExpiry: isoDaysAhead(212) },
  { id: 'v2', reg: 'AP 27 TB 4822', kind: '40 t trailer', capacityT: 40, driver: 'Harish Kumar', status: 'available', utilisationPct: 74, kmThisMonth: 2680, fitnessExpiry: isoDaysAhead(28), insuranceExpiry: isoDaysAhead(160) },
  { id: 'v3', reg: 'AP 39 UC 1107', kind: '30 t trailer', capacityT: 30, driver: 'Md. Salim', status: 'on_trip', utilisationPct: 81, kmThisMonth: 2890, fitnessExpiry: isoDaysAhead(96), insuranceExpiry: isoDaysAhead(76) },
  { id: 'v4', reg: 'AP 39 UC 1108', kind: '30 t trailer', capacityT: 30, driver: 'Prakash Goud', status: 'on_trip', utilisationPct: 69, kmThisMonth: 2210, fitnessExpiry: isoDaysAhead(260), insuranceExpiry: isoDaysAhead(300) },
  { id: 'v5', reg: 'AP 16 TE 9034', kind: '25 t multi-axle', capacityT: 25, driver: 'Anil Kumar', status: 'maintenance', utilisationPct: 42, kmThisMonth: 940, fitnessExpiry: isoDaysAhead(9), insuranceExpiry: isoDaysAhead(120) },
  { id: 'v6', reg: 'AP 16 TE 9035', kind: '25 t multi-axle', capacityT: 25, driver: 'Bala Krishna', status: 'available', utilisationPct: 58, kmThisMonth: 1620, fitnessExpiry: isoDaysAhead(180), insuranceExpiry: isoDaysAhead(45) },
  { id: 'v7', reg: 'AP 27 CD 6650', kind: 'Pickup (yard runs)', capacityT: 2, driver: 'Yard pool', status: 'available', utilisationPct: 91, kmThisMonth: 1480, fitnessExpiry: isoDaysAhead(310), insuranceExpiry: isoDaysAhead(190) },
]
export const getVehicle = (id: string) => VEHICLES.find((v) => v.id === id)

const dispatchOrders = ORDERS.filter((o) => ['dispatched', 'ready', 'processing', 'delivered'].includes(o.status))
const o = (i: number) => dispatchOrders[i % dispatchOrders.length]!

export const TRIPS: Trip[] = [
  { id: 'TRP-0412', vehicleId: 'v1', orderId: o(0).id, blockIds: o(0).blockIds, origin: 'Kondapi Yard A', destination: 'Krishnapatnam Port', status: 'in_transit', loadingAt: isoDaysAgo(1), dispatchedAt: isoDaysAgo(1), eta: isoDaysAhead(0), distanceKm: 190, progressPct: 72 },
  { id: 'TRP-0413', vehicleId: 'v3', orderId: o(1).id, blockIds: o(1).blockIds, origin: 'Kondapi Yard B', destination: 'Bengaluru', status: 'in_transit', loadingAt: isoDaysAgo(1), dispatchedAt: isoDaysAgo(1), eta: isoDaysAhead(1), distanceKm: 560, progressPct: 41 },
  { id: 'TRP-0414', vehicleId: 'v4', orderId: o(2).id, blockIds: o(2).blockIds, origin: 'Nagavaram Yard C', destination: 'Chennai Port', status: 'in_transit', loadingAt: isoDaysAgo(2), dispatchedAt: isoDaysAgo(2), eta: isoDaysAhead(0), distanceKm: 780, progressPct: 88 },
  { id: 'TRP-0415', vehicleId: 'v2', orderId: o(3).id, blockIds: o(3).blockIds, origin: 'Kondapi Yard A', destination: 'Hyderabad', status: 'loaded', loadingAt: isoDaysAgo(0), eta: isoDaysAhead(1), distanceKm: 380, progressPct: 0 },
  { id: 'TRP-0416', vehicleId: 'v6', orderId: o(4).id, blockIds: o(4).blockIds, origin: 'Nagavaram Yard C', destination: 'Pune', status: 'preparing', eta: isoDaysAhead(3), distanceKm: 1180, progressPct: 0 },
  { id: 'TRP-0417', vehicleId: 'v5', orderId: o(5).id, blockIds: o(5).blockIds, origin: 'Kondapi Yard A', destination: 'Coimbatore', status: 'preparing', eta: isoDaysAhead(4), distanceKm: 690, progressPct: 0 },
  { id: 'TRP-0411', vehicleId: 'v2', orderId: o(6).id, blockIds: o(6).blockIds, origin: 'Kondapi Yard A', destination: 'Chennai Port', status: 'delivered', loadingAt: isoDaysAgo(6), dispatchedAt: isoDaysAgo(6), eta: isoDaysAgo(4), distanceKm: 380, progressPct: 100 },
  { id: 'TRP-0410', vehicleId: 'v6', orderId: o(7).id, blockIds: o(7).blockIds, origin: 'Nagavaram Yard C', destination: 'Vijayawada', status: 'delivered', loadingAt: isoDaysAgo(8), dispatchedAt: isoDaysAgo(8), eta: isoDaysAgo(7), distanceKm: 410, progressPct: 100 },
  { id: 'TRP-0409', vehicleId: 'v1', orderId: o(8).id, blockIds: o(8).blockIds, origin: 'Kondapi Yard B', destination: 'Madurai', status: 'cancelled', distanceKm: 720, progressPct: 0 },
]

const d = (n: number) => isoDaysAhead(n)
export const MACHINES: Machine[] = [
  { id: 'm1', tag: 'EX-01', name: 'Hydraulic excavator', kind: 'Excavator', status: 'maintenance', hoursTotal: 11840, hoursThisMonth: 96, lastService: isoDaysAgo(118), nextServiceAt: d(-4), nextServiceHours: 12000, hoursSinceService: 512, serviceIntervalHours: 500, costYtd: 412000, location: 'Kondapi · Bench 2' },
  { id: 'm2', tag: 'WL-02', name: 'Wheel loader', kind: 'Loader', status: 'running', hoursTotal: 7420, hoursThisMonth: 141, lastService: isoDaysAgo(41), nextServiceAt: d(48), nextServiceHours: 7700, hoursSinceService: 254, serviceIntervalHours: 500, costYtd: 186000, location: 'Kondapi · Yard A' },
  { id: 'm3', tag: 'CR-01', name: 'Derrick crane 40 t', kind: 'Crane', status: 'running', hoursTotal: 9260, hoursThisMonth: 128, lastService: isoDaysAgo(72), nextServiceAt: d(9), nextServiceHours: 9300, hoursSinceService: 468, serviceIntervalHours: 500, costYtd: 268000, location: 'Kondapi · Yard A' },
  { id: 'm4', tag: 'DR-03', name: 'Crawler drill rig', kind: 'Drill', status: 'running', hoursTotal: 5310, hoursThisMonth: 154, lastService: isoDaysAgo(33), nextServiceAt: d(61), nextServiceHours: 5500, hoursSinceService: 198, serviceIntervalHours: 400, costYtd: 324000, location: 'Kondapi · Bench 3' },
  { id: 'm5', tag: 'WS-01', name: 'Diamond wire saw', kind: 'Saw', status: 'running', hoursTotal: 4120, hoursThisMonth: 118, lastService: isoDaysAgo(58), nextServiceAt: d(18), nextServiceHours: 4200, hoursSinceService: 361, serviceIntervalHours: 400, costYtd: 298000, location: 'Kondapi · Bench 1' },
  { id: 'm6', tag: 'CP-02', name: 'Air compressor 900 cfm', kind: 'Compressor', status: 'idle', hoursTotal: 6890, hoursThisMonth: 62, lastService: isoDaysAgo(84), nextServiceAt: d(35), nextServiceHours: 7000, hoursSinceService: 310, serviceIntervalHours: 500, costYtd: 94000, location: 'Nagavaram · Bench 1' },
  { id: 'm7', tag: 'GN-01', name: 'Diesel generator 250 kVA', kind: 'Generator', status: 'running', hoursTotal: 12300, hoursThisMonth: 180, lastService: isoDaysAgo(24), nextServiceAt: d(72), nextServiceHours: 12600, hoursSinceService: 120, serviceIntervalHours: 300, costYtd: 152000, location: 'Kondapi · Power house' },
  { id: 'm8', tag: 'FL-01', name: 'Forklift 10 t', kind: 'Forklift', status: 'breakdown', hoursTotal: 3980, hoursThisMonth: 40, lastService: isoDaysAgo(95), nextServiceAt: d(5), nextServiceHours: 4000, hoursSinceService: 402, serviceIntervalHours: 400, costYtd: 133000, location: 'Nagavaram · Yard C' },
  { id: 'm9', tag: 'DR-04', name: 'Handheld drill set', kind: 'Drill', status: 'running', hoursTotal: 2210, hoursThisMonth: 88, lastService: isoDaysAgo(19), nextServiceAt: d(80), nextServiceHours: 2400, hoursSinceService: 90, serviceIntervalHours: 300, costYtd: 41000, location: 'Nagavaram · Bench 3' },
]
export const getMachine = (id: string) => MACHINES.find((m) => m.id === id)

export const MAINTENANCE_LOG: MaintenanceRecord[] = [
  { id: 'mt1', machineId: 'm1', date: isoDaysAgo(3), type: 'Repair', description: 'Hydraulic hose replacement on boom cylinder', cost: 46000, vendor: 'Coastal Hydraulics' },
  { id: 'mt2', machineId: 'm8', date: isoDaysAgo(1), type: 'Repair', description: 'Mast chain and fork positioner fault: parts on order', cost: 28500, vendor: 'In-house workshop' },
  { id: 'mt3', machineId: 'm4', date: isoDaysAgo(33), type: 'Preventive', description: 'Rock drill service, bit and rod replacement', cost: 82000, vendor: 'Deccan Drilling Services' },
  { id: 'mt4', machineId: 'm2', date: isoDaysAgo(41), type: 'Preventive', description: '500 h service: oil, filters, greasing', cost: 34000, vendor: 'In-house workshop' },
  { id: 'mt5', machineId: 'm7', date: isoDaysAgo(24), type: 'Preventive', description: 'Oil and coolant change, injector check', cost: 26000, vendor: 'Power Systems Care' },
  { id: 'mt6', machineId: 'm3', date: isoDaysAgo(72), type: 'Inspection', description: 'Wire rope and load-brake inspection', cost: 18000, vendor: 'Certified inspector' },
  { id: 'mt7', machineId: 'm5', date: isoDaysAgo(58), type: 'Preventive', description: 'Diamond wire replacement and pulley alignment', cost: 112000, vendor: 'Stone Tooling Supplies' },
  { id: 'mt8', machineId: 'm6', date: isoDaysAgo(84), type: 'Preventive', description: 'Compressor oil separator and filter change', cost: 31000, vendor: 'In-house workshop' },
]
/** Maintenance is due if service date is within 14 days, or hours since service are within 10% of the interval. */
export function maintenanceAlerts() {
  return MACHINES.flatMap((m) => {
    const alerts: { machine: Machine; severity: 'critical' | 'due' | 'soon'; message: string }[] = []
    if (m.status === 'breakdown') { alerts.push({ machine: m, severity: 'critical', message: 'Breakdown reported. Out of service.' }); return alerts }
    const daysLeft = Math.ceil((new Date(m.nextServiceAt).getTime() - new Date('2026-09-19').getTime()) / 86400000)
    const hoursLeft = m.serviceIntervalHours - m.hoursSinceService
    if (daysLeft < 0 || hoursLeft < 0) alerts.push({ machine: m, severity: 'critical', message: `Service overdue by ${daysLeft < 0 ? `${-daysLeft} days` : `${-hoursLeft} h`}.` })
    else if (daysLeft <= 14 || hoursLeft <= m.serviceIntervalHours * 0.1) alerts.push({ machine: m, severity: 'due', message: `Service due in ${daysLeft} days, ${hoursLeft} h remaining.` })
    else if (daysLeft <= 30) alerts.push({ machine: m, severity: 'soon', message: `Service due in ${daysLeft} days.` })
    return alerts
  })
}

const rand = mulberry32(88)
const ENTRY_CREWS = [['KR-B1', 'Crew Alpha', 'WS-01'], ['KR-B2', 'Crew Bravo', 'EX-01'], ['KR-B3', 'Crew Charlie', 'DR-03'], ['NH-B1', 'Crew Delta', 'DR-04'], ['NH-B3', 'Crew Foxtrot', 'CP-02']] as const
export const PRODUCTION: ProductionEntry[] = Array.from({ length: 14 }, (_, day) =>
  ENTRY_CREWS.filter((_, i) => (day + i) % 5 !== 4 || i < 2).slice(0, 3 + (day % 2)).map(([benchId, crew, machine], i) => {
    const blocks = 1 + Math.floor(rand() * 3)
    return {
      id: `pr-${day}-${i}`, date: isoDaysAgo(day), benchId, crew, blocksExtracted: blocks,
      volumeCft: Math.round(blocks * (185 + rand() * 60)), wastePct: Math.round((6 + rand() * 9) * 10) / 10, machine,
      note: rand() < 0.15 ? 'Fissure encountered; face re-marked.' : '',
    }
  }),
).flat()
export const productionByDay = (n = 14) => {
  const days = Array.from({ length: n }, (_, i) => isoDaysAgo(n - 1 - i))
  return days.map((date) => ({ date, blocks: PRODUCTION.filter((p) => p.date === date).reduce((s, p) => s + p.blocksExtracted, 0), volume: PRODUCTION.filter((p) => p.date === date).reduce((s, p) => s + p.volumeCft, 0) }))
}
