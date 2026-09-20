import { PageHero } from './PageHero'
import { FinalCTA } from '@/components/marketing/Sections'

const ROADMAP = [
  { when: 'Now', title: 'Workspace preview', text: 'Blocks, inventory, sales, transport, machinery and analytics running on sample data.' },
  { when: 'Next', title: 'Live data and accounts', text: 'Supabase authentication, a FastAPI backend, PDF quotations and camera QR scanning.' },
  { when: 'Later', title: 'Marketplace', text: 'Search across quarries, request quotations and compare stock. Payments come last.' },
]
export default function About() {
  return (
    <>
      <PageHero title="Software for a trade that has been run on paper for centuries" lead="Natural stone is heavy, valuable and each piece is different. That makes good records more important here than in almost any other industry." />
      <div className="container-page grid gap-16 py-20 lg:grid-cols-2">
        <div className="space-y-5 text-[16px] leading-relaxed text-fg/90">
          <p>A single granite block can be worth several lakh rupees, and it may sit in a yard for months before it sells. Yet its size, quality and history are often kept in a notebook.</p>
          <p>QuarryOS gives every block a digital record from the day it is lifted, and connects that record to the customer, the quotation, the truck and the payment. The aim is simple: fewer lost details, faster decisions, and buyers who can find what you have.</p>
          <p>We are building in the open with quarry owners in mind, and we say clearly what works today and what does not. This site is a product preview running on demonstration data.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Where we are</h2>
          <ol className="mt-6 space-y-7 border-l border-line-strong pl-7">
            {ROADMAP.map((r) => <li key={r.title} className="relative"><span className="absolute -left-[33px] top-1.5 h-2.5 w-2.5 rounded-full border border-sand bg-bg" aria-hidden /><div className="text-xs text-sand">{r.when}</div><h3 className="mt-1 font-medium">{r.title}</h3><p className="mt-1 text-[14px] text-muted">{r.text}</p></li>)}
          </ol>
        </div>
      </div>
      <FinalCTA />
    </>
  )
}
