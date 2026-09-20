import { motion } from 'framer-motion'
import { MapPin, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Block } from '@/types/models'
import { StoneSwatch } from '@/components/common/StoneSwatch'
import { StatusBadge } from '@/components/common/StatusBadge'
import { daysSince, inr } from '@/lib/format'

export function BlockCard({ block }: { block: Block }) {
  const age = daysSince(block.extractedOn)
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
      <Link to={`/app/blocks/${block.id}`} className="group block overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-line-strong" aria-label={`${block.id}, ${block.type}, ${block.status}, ${inr(block.price)}`}>
        <div className="relative aspect-[16/10] overflow-hidden">
          <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.06]"><StoneSwatch type={block.type} seed={block.media[0]!.seed} /></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 font-mono text-xs tracking-wide text-white backdrop-blur">{block.id}</span>
          <div className="absolute right-3 top-3"><StatusBadge status={block.status} className="bg-black/50 backdrop-blur" /></div>
          {block.media.some((m) => m.kind === 'video') && <Video className="absolute bottom-3 right-3 h-4 w-4 text-white/80" aria-label="Has video" />}
        </div>
        <div className="p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="truncate text-[15px] font-medium">{block.type}</h3>
            <span className="tabular shrink-0 text-[15px] font-semibold">{inr(block.price)}</span>
          </div>
          <p className="mt-1 font-mono text-[12.5px] text-muted">{block.lengthFt} × {block.widthFt} × {block.heightFt} ft</p>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
            <span className="tabular">{block.volumeCft} cft · {block.weightT} t</span>
            <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3" aria-hidden />{block.location.replace('Left the yard', 'Dispatched')}</span>
          </div>
          {block.status === 'available' && age > 60 && <p className="mt-2 text-xs text-warn">In stock {age} days</p>}
        </div>
      </Link>
    </motion.div>
  )
}
