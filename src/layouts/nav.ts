import { BarChart3, Box, ClipboardList, Factory, FileText, LayoutDashboard, Mountain, Route, Settings, Sparkles, TrendingUp, Truck, UserCog, Users, Wallet, Warehouse, Wrench, HardHat, type LucideIcon } from 'lucide-react'
import type { ModuleKey } from '@/auth/permissions'

export interface NavItem { to: string; label: string; icon: LucideIcon; module: ModuleKey; end?: boolean }
export interface NavGroup { label?: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  { items: [{ to: '/app', label: 'Overview', icon: LayoutDashboard, module: 'overview', end: true }] },
  { label: 'Operations', items: [
    { to: '/app/quarry', label: 'Quarry', icon: Mountain, module: 'quarry' },
    { to: '/app/blocks', label: 'Blocks', icon: Box, module: 'blocks' },
    { to: '/app/production', label: 'Production', icon: Factory, module: 'production' },
    { to: '/app/inventory', label: 'Inventory', icon: Warehouse, module: 'inventory' },
    { to: '/app/machinery', label: 'Machinery', icon: HardHat, module: 'machinery' },
    { to: '/app/maintenance', label: 'Maintenance', icon: Wrench, module: 'maintenance' },
  ] },
  { label: 'Business', items: [
    { to: '/app/customers', label: 'Customers', icon: Users, module: 'customers' },
    { to: '/app/sales', label: 'Sales', icon: TrendingUp, module: 'sales' },
    { to: '/app/quotations', label: 'Quotations', icon: FileText, module: 'quotations' },
    { to: '/app/orders', label: 'Orders', icon: ClipboardList, module: 'orders' },
    { to: '/app/payments', label: 'Payments', icon: Wallet, module: 'payments' },
  ] },
  { label: 'Logistics', items: [
    { to: '/app/vehicles', label: 'Vehicles', icon: Truck, module: 'vehicles' },
    { to: '/app/transport', label: 'Transport', icon: Route, module: 'transport' },
  ] },
  { label: 'People', items: [{ to: '/app/employees', label: 'Employees', icon: UserCog, module: 'employees' }] },
  { label: 'Insights', items: [
    { to: '/app/analytics', label: 'Analytics', icon: BarChart3, module: 'analytics' },
    { to: '/app/intelligence', label: 'Quarry Intelligence', icon: Sparkles, module: 'intelligence' },
  ] },
  { items: [{ to: '/app/settings', label: 'Settings', icon: Settings, module: 'settings' }] },
]
export const FLAT_NAV = NAV.flatMap((g) => g.items)
