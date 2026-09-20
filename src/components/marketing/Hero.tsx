import { motion } from 'framer-motion'
import { LogoMark } from '@/components/common/Logo'
import { Granite3D } from '@/components/three/Granite3D'
import { Button } from '@/components/ui/Button'
import { StrataBackground } from './StrataBackground'

const ease = [0.22, 1, 0.36, 1] as const

function Callout({ className, label, value }: { className: string; label: string; value: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.8 }} className={`pointer-events-none absolute z-10 hidden sm:block ${className}`} aria-hidden>
      <div className="rounded-md border border-line-strong bg-bg/70 px-2.5 py-1.5 backdrop-blur-md">
        <div className="text-[10px] text-muted">{label}</div>
        <div className="font-mono text-[12px] tracking-wide text-fg">{value}</div>
      </div>
    </motion.div>
  )
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-line">
      <StrataBackground className="opacity-90 mask-fade-b" />
      <div className="container-page relative grid min-h-[100svh] items-center gap-6 pb-14 pt-28 lg:grid-cols-[1.02fr_1fr] lg:pt-20">
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="flex items-center gap-2.5 text-sm text-muted">
            <LogoMark className="h-5 w-5 text-sand" />The digital operating system for quarries
          </motion.div>
          <h1 className="mt-6 text-display font-semibold">
            {['Manage your quarry.', 'Track every block.', 'Grow your business.'].map((line, i) => (
              <motion.span key={line} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.12 + i * 0.12, ease }} className="block">{line}</motion.span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55, ease }} className="mt-7 max-w-[34rem] text-lg leading-relaxed text-muted">
            One system for blocks, inventory, sales, transport and payments, so nothing gets lost between the quarry face and the customer's gate.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.7, ease }} className="mt-9 flex flex-wrap gap-3">
            <Button to="/signup" variant="primary" size="lg">Start free</Button>
            <Button to="/features" size="lg">Explore platform</Button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }} className="mt-6 text-[13px] text-subtle">Product preview. The demo workspace uses sample data.</motion.p>
        </div>

        <div className="relative h-[380px] sm:h-[480px] lg:h-[min(78svh,700px)]">
          <div className="absolute inset-x-0 top-1/2 h-[70%] -translate-y-1/2 rounded-full bg-sand/[0.05] blur-3xl" aria-hidden />
          <Granite3D type="Black Galaxy" dims={[8.2, 5.1, 4.8]} className="absolute inset-0" seed={42} />
          <Callout className="left-[4%] top-[14%]" label="Block" value="GR-1042" />
          <Callout className="right-[2%] top-[30%]" label="Dimensions" value="8.2 × 5.1 × 4.8 ft" />
          <Callout className="bottom-[16%] left-[6%]" label="Weight · volume" value="15.3 t · 200.7 cft" />
          <Callout className="bottom-[8%] right-[4%]" label="Status" value="Available · Yard B" />
        </div>
      </div>
    </section>
  )
}
