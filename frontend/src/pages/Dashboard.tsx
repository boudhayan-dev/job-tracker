import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopAppBar from '../components/TopAppBar'
import BottomNav from '../components/BottomNav'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import StatusChip from '../components/StatusChip'
import { MOCK_APPLICATIONS } from '../lib/mockApplications'
import { formatAppliedRelative } from '../lib/format'

export default function Dashboard() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const applications = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return MOCK_APPLICATIONS
    return MOCK_APPLICATIONS.filter(
      (app) => app.company.toLowerCase().includes(q) || app.roleTitle.toLowerCase().includes(q),
    )
  }, [query])

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
          <div className="flex items-center justify-between mb-md">
            <h2 className="font-headline-md text-headline-md text-on-surface">Active Applications</h2>
          </div>

          {applications.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">No applications match "{query}".</p>
          ) : (
            <div className="flex flex-col gap-sm">
              {applications.map((app) => (
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
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  )
}
