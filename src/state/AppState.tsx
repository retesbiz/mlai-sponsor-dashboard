import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { DemoSession, ImpactRecord, Page, Role } from '../types'
import { clearAll, load, save } from '../lib/storage'
import { parseImpactCsv, recordKey } from '../lib/csv'
import { SAMPLE_CSV, SAMPLE_FILE_NAME } from '../data/sample'

export interface ImportSummary {
  fileName: string
  added: number
  skippedExisting: number
  mode: 'replace' | 'append'
  at: string
  /** Ids of the records added by this import (used to highlight them) */
  ids: string[]
}

export interface Toast {
  id: number
  tone: 'success' | 'info' | 'error'
  message: string
}

interface AppState {
  session: DemoSession | null
  records: ImpactRecord[]
  lastImport: ImportSummary | null
  selectedSponsor: string | null
  page: Page
  toasts: Toast[]
  isStaff: boolean
  /** Sponsors whose dashboard has been displayed with data this session (evidence for the Sprint 1 page) */
  viewedDashboards: string[]
  markDashboardViewed: (sponsor: string) => void
  login: (role: Role) => void
  logout: () => void
  switchRole: (role: Role) => void
  navigate: (page: Page) => void
  selectSponsor: (sponsor: string | null) => void
  loadSampleData: () => ImportSummary
  importRecords: (incoming: ImpactRecord[], fileName: string, mode: 'replace' | 'append') => ImportSummary
  clearData: () => void
  resetDemo: () => void
  notify: (tone: Toast['tone'], message: string) => void
  dismissToast: (id: number) => void
}

const Ctx = createContext<AppState | null>(null)

const DEMO_NAMES: Record<Role, string> = { staff: 'Demo Staff User', viewer: 'Demo Viewer' }

const isSession = (v: unknown) =>
  typeof v === 'object' && v !== null && ((v as DemoSession).role === 'staff' || (v as DemoSession).role === 'viewer')
const isRecordArray = (v: unknown) =>
  Array.isArray(v) && v.every((r) => typeof r === 'object' && r !== null && typeof r.sponsor === 'string' && typeof r.date === 'string')
const isPage = (v: unknown) => v === 'import' || v === 'sponsors' || v === 'dashboard' || v === 'sprint'

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(() => load('session', null, isSession))
  const [records, setRecords] = useState<ImpactRecord[]>(() => load('records', [], isRecordArray))
  const [lastImport, setLastImport] = useState<ImportSummary | null>(() => load('lastImport', null))
  const [selectedSponsor, setSelectedSponsor] = useState<string | null>(() => load('selectedSponsor', null))
  const [page, setPage] = useState<Page>(() => load('page', 'import', isPage))
  const [toasts, setToasts] = useState<Toast[]>([])
  const [viewedDashboards, setViewedDashboards] = useState<string[]>(() => load('viewedDashboards', [], Array.isArray))

  useEffect(() => save('session', session), [session])
  useEffect(() => save('records', records), [records])
  useEffect(() => save('lastImport', lastImport), [lastImport])
  useEffect(() => save('selectedSponsor', selectedSponsor), [selectedSponsor])
  useEffect(() => save('page', page), [page])
  useEffect(() => save('viewedDashboards', viewedDashboards), [viewedDashboards])

  const markDashboardViewed = useCallback((sponsor: string) => {
    setViewedDashboards((v) => (v.includes(sponsor) ? v : [...v, sponsor]))
  }, [])

  // Keep the selected sponsor valid if the data changes underneath it.
  useEffect(() => {
    if (selectedSponsor && !records.some((r) => r.sponsor === selectedSponsor)) setSelectedSponsor(null)
  }, [records, selectedSponsor])

  const notify = useCallback((tone: Toast['tone'], message: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t.slice(-2), { id, tone, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500)
  }, [])
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const login = useCallback((role: Role) => {
    setSession({ name: DEMO_NAMES[role], role, startedAt: new Date().toISOString() })
    setPage(role === 'staff' ? 'import' : 'sponsors')
  }, [])

  const logout = useCallback(() => {
    setSession(null)
    setPage('import')
  }, [])

  const switchRole = useCallback(
    (role: Role) => {
      setSession((s) => (s ? { ...s, role, name: DEMO_NAMES[role] } : s))
      notify('info', `Simulated role switched to ${role === 'staff' ? 'MLAI Staff' : 'Viewer'}.`)
    },
    [notify],
  )

  const importRecords = useCallback(
    (incoming: ImpactRecord[], fileName: string, mode: 'replace' | 'append'): ImportSummary => {
      const base = mode === 'replace' ? [] : records
      const existing = new Set(base.map(recordKey))
      const fresh = incoming.filter((r) => !existing.has(recordKey(r)))
      const summary: ImportSummary = {
        fileName,
        added: fresh.length,
        skippedExisting: incoming.length - fresh.length,
        mode,
        at: new Date().toISOString(),
        ids: fresh.map((r) => r.id),
      }
      setRecords([...base, ...fresh])
      setLastImport(summary)
      return summary
    },
    [records],
  )

  const loadSampleData = useCallback(() => {
    const parsed = parseImpactCsv(SAMPLE_CSV, SAMPLE_FILE_NAME)
    return importRecords(parsed.valid, SAMPLE_FILE_NAME, 'replace')
  }, [importRecords])

  const clearData = useCallback(() => {
    setRecords([])
    setLastImport(null)
    setSelectedSponsor(null)
    setViewedDashboards([])
  }, [])

  const resetDemo = useCallback(() => {
    clearAll()
    setRecords([])
    setLastImport(null)
    setSelectedSponsor(null)
    setViewedDashboards([])
    setSession(null)
    setPage('import')
  }, [])

  const value = useMemo<AppState>(
    () => ({
      session,
      records,
      lastImport,
      selectedSponsor,
      page,
      toasts,
      isStaff: session?.role === 'staff',
      viewedDashboards,
      markDashboardViewed,
      login,
      logout,
      switchRole,
      navigate: setPage,
      selectSponsor: setSelectedSponsor,
      loadSampleData,
      importRecords,
      clearData,
      resetDemo,
      notify,
      dismissToast,
    }),
    [session, records, lastImport, selectedSponsor, page, toasts, viewedDashboards, markDashboardViewed, login, logout, switchRole, loadSampleData, importRecords, clearData, resetDemo, notify, dismissToast],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAppState() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider')
  return ctx
}
