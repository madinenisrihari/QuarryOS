import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { RequireAuth, RequireModule } from '@/auth/guards'
import type { ModuleKey } from '@/auth/permissions'
import AppLayout from '@/layouts/AppLayout'
import MarketingLayout from '@/layouts/MarketingLayout'
import { Skeleton } from '@/components/ui/Skeleton'

// Every page is its own chunk. Marketing pages never download app code and vice versa.
const page = <T extends { default: React.ComponentType }>(f: () => Promise<T>) => lazy(f)
const Home = page(() => import('@/pages/marketing/Home'))
const Features = page(() => import('@/pages/marketing/Features'))
const Solutions = page(() => import('@/pages/marketing/Solutions'))
const Pricing = page(() => import('@/pages/marketing/Pricing'))
const About = page(() => import('@/pages/marketing/About'))
const Contact = page(() => import('@/pages/marketing/Contact'))
const Login = page(() => import('@/pages/auth/Login'))
const Signup = page(() => import('@/pages/auth/Signup'))
const Dashboard = page(() => import('@/pages/app/Dashboard'))
const Quarry = page(() => import('@/pages/app/Quarry'))
const Blocks = page(() => import('@/pages/app/Blocks'))
const BlockDetail = page(() => import('@/pages/app/BlockDetail'))
const Inventory = page(() => import('@/pages/app/Inventory'))
const Production = page(() => import('@/pages/app/Production'))
const Customers = page(() => import('@/pages/app/Customers'))
const Sales = page(() => import('@/pages/app/Sales'))
const Quotations = page(() => import('@/pages/app/Quotations'))
const Orders = page(() => import('@/pages/app/Orders'))
const Payments = page(() => import('@/pages/app/Payments'))
const Vehicles = page(() => import('@/pages/app/Vehicles'))
const Transport = page(() => import('@/pages/app/Transport'))
const Employees = page(() => import('@/pages/app/Employees'))
const Machinery = page(() => import('@/pages/app/Machinery'))
const Maintenance = page(() => import('@/pages/app/Maintenance'))
const Analytics = page(() => import('@/pages/app/Analytics'))
const Intelligence = page(() => import('@/pages/app/Intelligence'))
const Settings = page(() => import('@/pages/app/Settings'))
const Storefront = page(() => import('@/pages/public/Storefront'))
const PublicBlock = page(() => import('@/pages/public/PublicBlock'))
const Marketplace = page(() => import('@/pages/public/Marketplace'))
const BuyerPortal = page(() => import('@/pages/public/BuyerPortal'))
const NotFound = page(() => import('@/pages/NotFound'))

const Fallback = () => <div className="p-8" role="status" aria-label="Loading page"><Skeleton className="mb-4 h-8 w-64" /><Skeleton className="h-64 w-full" /></div>
const guard = (module: ModuleKey, el: React.ReactNode) => <RequireModule module={module}>{el}</RequireModule>

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route index element={<Home />} />
          <Route path="features" element={<Features />} />
          <Route path="solutions" element={<Solutions />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="buyer" element={<BuyerPortal />} />
          <Route path="quarry/:slug" element={<Storefront />} />
        </Route>
        <Route path="b/:id" element={<PublicBlock />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />

        <Route path="app" element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route index element={guard('overview', <Dashboard />)} />
          <Route path="quarry" element={guard('quarry', <Quarry />)} />
          <Route path="blocks" element={guard('blocks', <Blocks />)} />
          <Route path="blocks/:id" element={guard('blocks', <BlockDetail />)} />
          <Route path="inventory" element={guard('inventory', <Inventory />)} />
          <Route path="production" element={guard('production', <Production />)} />
          <Route path="customers/:id?" element={guard('customers', <Customers />)} />
          <Route path="sales" element={guard('sales', <Sales />)} />
          <Route path="quotations" element={guard('quotations', <Quotations />)} />
          <Route path="orders" element={guard('orders', <Orders />)} />
          <Route path="payments" element={guard('payments', <Payments />)} />
          <Route path="vehicles" element={guard('vehicles', <Vehicles />)} />
          <Route path="transport" element={guard('transport', <Transport />)} />
          <Route path="employees" element={guard('employees', <Employees />)} />
          <Route path="machinery" element={guard('machinery', <Machinery />)} />
          <Route path="maintenance" element={guard('maintenance', <Maintenance />)} />
          <Route path="analytics" element={guard('analytics', <Analytics />)} />
          <Route path="intelligence" element={guard('intelligence', <Intelligence />)} />
          <Route path="settings" element={guard('settings', <Settings />)} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
