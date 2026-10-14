import { initials } from '../lib/format'

/**
 * Identity colours for sponsor avatars only (charts stay single-hue).
 * The colour is derived from the sponsor name, so a sponsor keeps its colour
 * regardless of sort order or which other sponsors are loaded.
 */
const TONES = [
  'bg-teal-700 text-white',
  'bg-indigo-600 text-white',
  'bg-amber-600 text-white',
  'bg-sky-700 text-white',
  'bg-rose-600 text-white',
  'bg-violet-600 text-white',
]

export function sponsorTone(name: string) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return TONES[h % TONES.length]
}

const SIZES = {
  sm: 'size-7 text-[0.65rem] rounded-md',
  md: 'size-10 text-sm rounded-lg',
  lg: 'size-14 text-lg rounded-xl',
}

export function SponsorAvatar({ name, size = 'md', className = '' }: { name: string; size?: keyof typeof SIZES; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center font-semibold tracking-wide ${SIZES[size]} ${sponsorTone(name)} ${className}`} aria-hidden>
      {initials(name)}
    </span>
  )
}
