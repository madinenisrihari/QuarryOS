import type { Role } from '@/types/models'

export type ModuleKey =
  | 'overview'
  | 'quarry'
  | 'blocks'
  | 'production'
  | 'inventory'
  | 'customers'
  | 'sales'
  | 'quotations'
  | 'orders'
  | 'payments'
  | 'vehicles'
  | 'transport'
  | 'employees'
  | 'machinery'
  | 'maintenance'
  | 'analytics'
  | 'intelligence'
  | 'settings'

const ALL: ModuleKey[] = [
  'overview',
  'quarry',
  'blocks',
  'production',
  'inventory',
  'customers',
  'sales',
  'quotations',
  'orders',
  'payments',
  'vehicles',
  'transport',
  'employees',
  'machinery',
  'maintenance',
  'analytics',
  'intelligence',
  'settings',
]

export const ROLE_MODULES: Record<Role, ModuleKey[]> = {
  owner: ALL,

  admin: ALL,

  manager: ALL.filter((module) => module !== 'settings'),

  sales: [
    'overview',
    'blocks',
    'inventory',
    'customers',
    'sales',
    'quotations',
    'orders',
    'intelligence',
  ],

  worker: [
    'overview',
    'quarry',
    'blocks',
    'production',
    'inventory',
    'transport',
    'machinery',
    'maintenance',
  ],
}

export const ROLE_LABEL: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  sales: 'Sales employee',
  worker: 'Worker',
}

export const ROLE_BLURB: Record<Role, string> = {
  owner: 'Full access including billing and settings.',
  admin: 'Full access to all modules and user management.',
  manager: 'Operations, sales, logistics and people. No settings.',
  sales: 'Blocks, customers, quotations, orders and enquiries.',
  worker: 'Production, yard, machinery and dispatch tasks.',
}

export const can = (
  role: Role | undefined,
  module: ModuleKey,
): boolean => {
  return Boolean(role && ROLE_MODULES[role]?.includes(module))
}