import { QRCodeSVG } from 'qrcode.react'
import { blockPublicUrl } from '@/data/blocks'

/** QR encodes the public block URL. Rendered on white for scanner contrast regardless of theme. */
export function BlockQR({ blockId, size = 128, className }: { blockId: string; size?: number; className?: string }) {
  return (
    <div className={className} style={{ width: size + 16, height: size + 16 }}>
      <div className="rounded-lg bg-white p-2"><QRCodeSVG value={blockPublicUrl(blockId)} size={size} level="M" bgColor="#ffffff" fgColor="#0c0d0f" role="img" aria-label={`QR code for block ${blockId}`} /></div>
    </div>
  )
}
