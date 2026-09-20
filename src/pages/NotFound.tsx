import { Compass } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg">
      <EmptyState icon={Compass} title="This page doesn't exist" description="The link may be broken, or the page may have moved." action={<Button to="/" variant="primary">Go to home</Button>} />
    </div>
  )
}
