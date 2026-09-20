import type { Config } from 'tailwindcss'

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: { DEFAULT: token('surface'), 2: token('surface-2'), 3: token('surface-3') },
        fg: token('fg'),
        muted: token('muted'),
        subtle: token('subtle'),
        sand: { DEFAULT: token('sand'), dim: token('sand-dim') },
        titanium: token('titanium'),
        ai: token('ai'),
        ok: token('ok'),
        warn: token('warn'),
        bad: token('bad'),
        info: token('info'),
        // Hairline colours support opacity modifiers (e.g. border-line/60) on top of a base alpha.
        line: ({ opacityValue }: { opacityValue?: string }) => `rgb(var(--line) / calc(0.08 * ${opacityValue ?? 1}))`,
        'line-strong': ({ opacityValue }: { opacityValue?: string }) => `rgb(var(--line) / calc(0.16 * ${opacityValue ?? 1}))`,
      },
      fontFamily: {
        sans: ['"Geist Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono Variable"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        display: ['clamp(2.75rem, 6.2vw, 5.75rem)', { lineHeight: '0.98', letterSpacing: '-0.035em' }],
        headline: ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.03', letterSpacing: '-0.03em' }],
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.125rem' },
      boxShadow: {
        lift: '0 1px 0 rgb(255 255 255 / 0.04) inset, 0 12px 32px -12px rgb(0 0 0 / 0.6)',
        ring: '0 0 0 1px rgb(var(--line) / 0.1)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        pulseDot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
      },
      animation: { shimmer: 'shimmer 1.6s infinite', pulseDot: 'pulseDot 2s ease-in-out infinite' },
    },
  },
  plugins: [],
} satisfies Config
