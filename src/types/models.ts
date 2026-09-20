/** Domain models. These mirror the intended PostgreSQL tables so the FastAPI layer can return them 1:1. */

export type Role = 'owner' | 'admin' | 'manager' | 'sales' | 'worker'

export type GraniteType =
  | 'Black Galaxy' | 'Absolute Black' | 'Steel Grey' | 'Tan Brown' | 'Colonial White' | 'Viscount White'

export type BlockStatus = 'available' | 'reserved' | 'in_processing' | 'sold' | 'dispatched'

export interface Quarry {
  id: string
  slug: string
  name: string
  company: string
  district: string
  state: string
  country: string
  areaHectares: number
  established: number
  stoneTypes: GraniteType[]
  benches: Bench[]
  certifications: string[]
  about: string
}

export interface Bench {
  id: string
  name: string
  levelM: number
  stone: GraniteType
  status: 'active' | 'idle' | 'planned'
  estReserveM3: number
  crew: string
}

export interface MediaItem { id: string; kind: 'photo' | 'video'; label: string; seed: number }

export interface Block {
  id: string                 // e.g. GR-1042 (also the QR payload)
  quarryId: string
  type: GraniteType
  color: string
  lengthFt: number
  widthFt: number
  heightFt: number
  volumeCft: number
  weightT: number
  status: BlockStatus
  pricePerCft: number
  price: number
  location: string           // yard / bay
  extractedOn: string        // ISO date
  bench: string
  notes: string
  customerId?: string
  media: MediaItem[]
}

export interface BlockEvent {
  id: string
  at: string
  title: string
  detail?: string
  kind: 'extraction' | 'inspection' | 'listing' | 'reservation' | 'sale' | 'transport' | 'note'
}

export interface Customer {
  id: string
  name: string
  company: string
  phone: string
  email: string
  city: string
  country: string
  segment: 'Exporter' | 'Fabricator' | 'Dealer' | 'Contractor' | 'Monument maker'
  since: string
  notes: string
}

export type OrderStatus = 'confirmed' | 'processing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  customerId: string
  blockIds: string[]
  date: string
  dueDate: string
  total: number
  paid: number
  status: OrderStatus
  destination: string
}

export type PaymentStatus = 'received' | 'pending' | 'overdue'
export interface Payment {
  id: string
  orderId: string
  customerId: string
  amount: number
  method: 'Bank transfer' | 'UPI' | 'Cheque' | 'Letter of credit' | 'Cash'
  date: string
  status: PaymentStatus
  reference: string
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'expired' | 'declined'
export interface QuoteLine { blockId: string; price: number }
export interface Quotation {
  id: string
  customerId: string
  lines: QuoteLine[]
  transport: number
  taxRatePct: number
  date: string
  validUntil: string
  status: QuoteStatus
}

export type LeadStage = 'new' | 'contacted' | 'quoted' | 'negotiation' | 'won' | 'lost'
export interface Lead {
  id: string
  name: string
  company: string
  interest: string
  estValue: number
  stage: LeadStage
  source: 'QR scan' | 'Storefront' | 'Referral' | 'Phone' | 'Trade enquiry'
  date: string
}

export type VehicleStatus = 'available' | 'on_trip' | 'maintenance'
export interface Vehicle {
  id: string
  reg: string
  kind: string
  capacityT: number
  driver: string
  status: VehicleStatus
  utilisationPct: number
  kmThisMonth: number
  fitnessExpiry: string
  insuranceExpiry: string
}

export type TripStatus = 'preparing' | 'loaded' | 'in_transit' | 'delivered' | 'cancelled'
export interface Trip {
  id: string
  vehicleId: string
  orderId?: string
  blockIds: string[]
  origin: string
  destination: string
  status: TripStatus
  loadingAt?: string
  dispatchedAt?: string
  eta?: string
  distanceKm: number
  progressPct: number
}

export interface Employee {
  id: string
  name: string
  title: string
  department: 'Extraction' | 'Yard' | 'Logistics' | 'Sales' | 'Accounts' | 'Maintenance' | 'Management'
  phone: string
  joined: string
  monthlySalary: number
  attendanceToday: 'present' | 'absent' | 'leave' | 'half_day'
  daysPresentMonth: number
  assignment: string
  role: Role
}

export type MachineStatus = 'running' | 'idle' | 'maintenance' | 'breakdown'
export interface Machine {
  id: string
  tag: string
  name: string
  kind: string
  status: MachineStatus
  hoursTotal: number
  hoursThisMonth: number
  lastService: string
  nextServiceAt: string
  nextServiceHours: number
  hoursSinceService: number
  serviceIntervalHours: number
  costYtd: number
  location: string
}

export interface MaintenanceRecord {
  id: string
  machineId: string
  date: string
  type: 'Preventive' | 'Repair' | 'Inspection'
  description: string
  cost: number
  vendor: string
}

export interface ProductionEntry {
  id: string
  date: string
  benchId: string
  crew: string
  blocksExtracted: number
  volumeCft: number
  wastePct: number
  machine: string
  note: string
}

export interface MonthlyPoint {
  month: string
  sales: number       // ₹ lakh
  expenses: number    // ₹ lakh
  extracted: number   // blocks
  dispatched: number  // blocks
}

export interface MarketplaceListing {
  id: string
  title: string
  quarrySlug: string
  quarryName: string
  state: string
  country: string
  type: GraniteType
  kind: 'Block' | 'Slab'
  size: string
  priceFrom: number
  unit: string
  availability: 'In stock' | 'Limited' | 'Made to order'
  seed: number
}

export type InsightTone = 'positive' | 'attention' | 'neutral'
export interface Insight { id: string; tone: InsightTone; text: string; href?: string }

export interface IntelligenceAnswer {
  title: string
  summary: string
  metrics?: { label: string; value: string; tone?: InsightTone }[]
  table?: { columns: string[]; rows: string[][] }
  bars?: { label: string; value: number; display: string }[]
  followUps?: string[]
  basis: string
  matched: boolean
}
