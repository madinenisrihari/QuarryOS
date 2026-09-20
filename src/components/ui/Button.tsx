import { Link } from 'react-router-dom'
import { Loader2, type LucideIcon } from 'lucide-react'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'ai' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-fg text-bg hover:bg-fg/90',
  accent: 'bg-sand text-bg hover:bg-sand/90',
  secondary: 'bg-surface-2 text-fg border border-line-strong hover:bg-surface-3',
  ghost: 'text-muted hover:text-fg hover:bg-surface-2',
  ai: 'bg-ai/10 text-ai border border-ai/25 hover:bg-ai/[0.16]',
  danger: 'bg-bad/10 text-bad border border-bad/25 hover:bg-bad/[0.16]',
}
const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-[15px] gap-2',
  icon: 'h-9 w-9 justify-center',
}

interface Props {
  variant?: Variant
  size?: Size
  icon?: LucideIcon
  loading?: boolean
  to?: string
  href?: string
  className?: string
  children?: ReactNode
}
type ButtonProps = Props & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Props> & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof Props | 'type'>

export function Button({ variant = 'secondary', size = 'md', icon: Icon, loading, to, href, className, children, ...rest }: ButtonProps) {
  const classes = cn(
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-lg font-medium transition-[background,color,transform,opacity] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant], SIZES[size], className,
  )
  const inner = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
      {children}
    </>
  )
  if (to) return <Link to={to} className={classes} {...(rest as object)}>{inner}</Link>
  if (href) return <a href={href} className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>{inner}</a>
  return (
    <button type="button" className={classes} disabled={loading || (rest as ButtonHTMLAttributes<HTMLButtonElement>).disabled} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  )
}
