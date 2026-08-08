import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import StatusChip from '../components/StatusChip'
import { listApplications } from '../lib/api'
import { formatAppliedRelative, groupByDate } from '../lib/format'
import { STATUS_META, STATUS_ORDER, type ApplicationStatus } from '../lib/status'
import type { Application } from '../lib/types'

export default function Dashboard() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<Set<ApplicationStatus>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const [allApplications, setAllApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listApplications()
      .then(setAllApplications)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const applications = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allApplications.filter((app) => {
      const matchesQuery = !q || app.company.toLowerCase().includes(q) || app.roleTitle.toLowerCase().includes(q)
      const matchesStatus = statusFilter.size === 0 || statusFilter.has(app.status)
      return matchesQuery && matchesStatus
    })
  }, [query, statusFilter, allApplications])

  const dateGroups = useMemo(() => groupByDate(applications, (app) => app.appliedDate), [applications])

  const toggleStatus = (status: ApplicationStatus) => {
    setStatusFilter((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  return (
    <div className="bg-background text-on-background font-body-lg antialiased min-h-screen pb-[80px] md:pb-0">
      <TopAppBar />
      <main className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-lg">
        <div className="flex flex-col md:flex-row gap-md items-stretch md:items-center justify-between mb-xl">
          <Input
            icon="search"
            placeholder="Search companies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow max-w-2xl"
          />
          <Button onClick={() => navigate('/track')}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Track New Job
          </Button>
        </div>

        <section>
          <div className="flex items-center justify-between mb-md relative">
            <h2 className="font-headline-md text-headline-md text-on-surface">Active Applications</h2>
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((v) => !v)}
                aria-label="Filter by status"
                className={`relative p-sm rounded-full transition-colors ${
                  filterOpen
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                {statusFilter.size > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary" />
                )}
              </button>

              {filterOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                  <div className="absolute right-0 top-full mt-xs z-20 w-56 bg-surface border border-outline-variant rounded-lg shadow-md p-sm flex flex-col gap-xs">
                    {STATUS_ORDER.map((status) => (
                      <label
                        key={status}
                        className="flex items-center gap-sm px-sm py-xs rounded hover:bg-surface-container-low cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={statusFilter.has(status)}
                          onChange={() => toggleStatus(status)}
                          className="rounded border-outline-variant text-primary focus:ring-primary"
                        />
                        <span className={`w-2 h-2 rounded-full ${STATUS_META[status].dotClass}`} />
                        <span className="font-body-sm text-body-sm text-on-surface">{STATUS_META[status].label}</span>
                      </label>
                    ))}
                    {statusFilter.size > 0 && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter(new Set())}
                        className="mt-xs font-label-md text-label-md text-primary text-left px-sm py-xs hover:underline"
                      >
                        Clear filter
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant">Loading…</p>
          ) : error ? (
            <p className="font-body-sm text-body-sm text-error">{error}</p>
          ) : applications.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {allApplications.length === 0
                ? 'No applications tracked yet.'
                : query
                  ? `No applications match "${query}".`
                  : 'No applications match the selected status filter.'}
            </p>
          ) : (
            <div className="flex flex-col gap-lg">
              {dateGroups.map((group) => (
                <div key={group.label}>
                  <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-sm">
                    {group.label}
                  </h3>
                  <div className="flex flex-col gap-sm">
                    {group.items.map((app) => (
                      <Card
                        key={app.id}
                        onClick={() => navigate(`/applications/${app.id}`)}
                        className="group flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-md">
                          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0 border border-outline-variant">
                            <span className="font-headline-md text-headline-md font-bold text-secondary">
                              {app.company.charAt(0)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-headline-md text-[16px] leading-[22px] font-bold text-on-surface group-hover:text-primary transition-colors">
                              {app.company}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">{app.roleTitle}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-xs">
                          <StatusChip status={app.status} />
                          <span className="font-mono-sm text-mono-sm text-on-surface-variant">
                            {formatAppliedRelative(app.appliedDate)}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  )
}
