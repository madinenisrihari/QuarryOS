import { Button } from './Button'
import { Modal } from './Modal'

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', destructive }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; confirmLabel?: string; destructive?: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant={destructive ? 'danger' : 'primary'} data-autofocus onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Button></>}>
      <p className="text-sm text-muted">{description}</p>
    </Modal>
  )
}
