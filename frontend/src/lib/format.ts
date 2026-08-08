export function formatAppliedRelative(isoDate: string): string {
  const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Applied today'
  if (days < 7) return `Applied ${days}d ago`
  if (days < 30) return `Applied ${Math.floor(days / 7)}w ago`
  return `Applied ${Math.floor(days / 30)}mo ago`
}

// Calendar-day key (local time) for grouping a list by the date it was saved.
function dayKey(isoDate: string): string {
  const d = new Date(isoDate)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export function formatDateGroupLabel(isoDate: string): string {
  const date = new Date(isoDate)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (dayKey(isoDate) === dayKey(today.toISOString())) return 'Today'
  if (dayKey(isoDate) === dayKey(yesterday.toISOString())) return 'Yesterday'
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

// Groups items (already sorted newest-first) into ordered [label, items[]] buckets by the
// calendar day of their date field — used for the Dashboard's date-wise section headers.
export function groupByDate<T>(items: T[], getDate: (item: T) => string): { label: string; items: T[] }[] {
  const groups: { key: string; label: string; items: T[] }[] = []
  for (const item of items) {
    const date = getDate(item)
    const key = dayKey(date)
    const existing = groups.find((g) => g.key === key)
    if (existing) {
      existing.items.push(item)
    } else {
      groups.push({ key, label: formatDateGroupLabel(date), items: [item] })
    }
  }
  return groups.map(({ label, items }) => ({ label, items }))
}
