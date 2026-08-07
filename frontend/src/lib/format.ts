export function formatAppliedRelative(isoDate: string): string {
  const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Applied today'
  if (days < 7) return `Applied ${days}d ago`
  if (days < 30) return `Applied ${Math.floor(days / 7)}w ago`
  return `Applied ${Math.floor(days / 30)}mo ago`
}
