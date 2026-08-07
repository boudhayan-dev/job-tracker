import type { ApplicationStatus } from '../lib/status'
import { STATUS_META } from '../lib/status'

export default function StatusChip({ status }: { status: ApplicationStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={`font-label-md text-[10px] leading-[14px] px-sm py-[2px] rounded-full flex items-center gap-[2px] ${meta.chipClass}`}
    >
      <span className={`w-[6px] h-[6px] rounded-full block ${meta.dotClass}`} />
      {meta.label}
    </span>
  )
}
