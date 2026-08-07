import type { ApplicationStatus } from '../lib/status'
import { STATUS_META, STATUS_ORDER } from '../lib/status'

type Props = {
  status: ApplicationStatus
  onChange: (status: ApplicationStatus) => void
}

export default function StatusSelect({ status, onChange }: Props) {
  const meta = STATUS_META[status]
  return (
    <div className="flex items-center gap-sm w-full md:w-auto">
      <div className="flex items-center gap-xs px-sm py-xs rounded-full bg-secondary-container border border-outline-variant">
        <div className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
        <span className="font-label-md text-label-md text-on-surface">{meta.label}</span>
      </div>
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as ApplicationStatus)}
        className="font-label-md text-label-md text-primary bg-transparent hover:text-surface-tint transition-all px-sm py-xs border border-outline-variant rounded cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-primary ml-auto md:ml-0"
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_META[s].label}
          </option>
        ))}
      </select>
    </div>
  )
}
