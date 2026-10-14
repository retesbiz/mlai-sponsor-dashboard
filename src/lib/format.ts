const nf = new Intl.NumberFormat('en-AU')
const compact = new Intl.NumberFormat('en-AU', { notation: 'compact', maximumFractionDigits: 1 })
// Fixed three-letter months: en-AU's Intl output mixes "Jun"/"June" and "Sep"/"Sept".
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const formatNumber = (n: number) => nf.format(n)
export const formatCompact = (n: number) => compact.format(n)

export function formatShortDate(iso: string) {
  const [, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]}`
}
export const formatDate = (iso: string) => `${formatShortDate(iso)} ${iso.slice(0, 4)}`

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}
