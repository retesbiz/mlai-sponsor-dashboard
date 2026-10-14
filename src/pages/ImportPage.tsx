import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, Download, FileSpreadsheet, FileWarning, Inbox, Info, Lock, Sparkles, Trash2, UploadCloud, X } from 'lucide-react'
import { useAppState, type ImportSummary } from '../state/AppState'
import { MAX_FILE_BYTES, OPTIONAL_COLUMNS, REQUIRED_COLUMNS, downloadText, parseImpactCsv, recordsToCsv } from '../lib/csv'
import { formatNumber } from '../lib/format'
import { ERROR_SAMPLE_CSV, ERROR_SAMPLE_FILE_NAME, SAMPLE_CSV, SAMPLE_FILE_NAME } from '../data/sample'
import type { ParseResult } from '../types'
import { Badge, Button, Card, CardHeader, ConfirmDialog, PageHeader, Spinner } from '../components/ui'
import { RecordsTable } from '../components/RecordsTable'
import { SponsorAvatar } from '../components/SponsorAvatar'

const PREVIEW_LIMIT = 8

function ImportConfirmation({ summary, onDismiss }: { summary: ImportSummary; onDismiss: () => void }) {
  const { navigate, records } = useAppState()
  const sponsors = [...new Set(records.map((r) => r.sponsor))].sort((a, b) => a.localeCompare(b))
  const nothingNew = summary.added === 0
  return (
    <div
      className={`mb-6 animate-slide-up overflow-hidden rounded-2xl border shadow-card ${nothingNew ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-white'}`}
      role="status"
    >
      <div className="flex flex-wrap items-start gap-4 p-5 sm:p-6">
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${nothingNew ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {nothingNew ? <Info className="size-5" aria-hidden /> : <CheckCircle2 className="size-6" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold tracking-tight text-slate-900">
            {nothingNew
              ? 'No new records imported'
              : `${formatNumber(summary.added)} sponsor-impact record${summary.added === 1 ? '' : 's'} imported`}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            From <span className="font-medium text-slate-800">{summary.fileName}</span>
            {summary.mode === 'replace' ? ' · replaced previous data' : ' · added to existing data'}
            {summary.skippedExisting > 0 && ` · ${summary.skippedExisting} already-imported record(s) skipped to avoid double counting`}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-800 tabular-nums">{formatNumber(records.length)} records loaded</span>
            {sponsors.map((sp) => (
              <span key={sp} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-0.5 pl-0.5 pr-2.5 text-sm text-slate-700">
                <SponsorAvatar name={sp} size="sm" className="!size-6 !rounded-full !text-[0.6rem]" />
                {sp}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="lg" className="!h-11" onClick={() => navigate('sponsors')}>
            Select a sponsor <ArrowRight className="size-4" aria-hidden />
          </Button>
          <button type="button" onClick={onDismiss} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800" aria-label="Dismiss confirmation">
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ValidationPreview({
  result,
  hasExisting,
  onImport,
  onCancel,
}: {
  result: ParseResult
  hasExisting: boolean
  onImport: (mode: 'replace' | 'append') => void
  onCancel: () => void
}) {
  const [mode, setMode] = useState<'replace' | 'append'>('append')
  const invalidRows = new Set(result.errors.map((e) => e.line)).size

  if (result.fatal) {
    return (
      <Card className="animate-slide-up border-red-200">
        <div className="flex flex-wrap items-start gap-4 p-5">
          <FileWarning className="mt-0.5 size-6 shrink-0 text-red-600" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-red-800">“{result.fileName}” could not be imported</p>
            <p className="mt-1 text-sm text-red-800/90" role="alert">{result.fatal}</p>
            <p className="mt-2 text-sm text-slate-600">Check the file has a header row with: {REQUIRED_COLUMNS.join(', ')}.</p>
          </div>
          <Button onClick={onCancel}>Dismiss</Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="animate-slide-up overflow-hidden">
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <FileSpreadsheet className="size-4 text-slate-500" aria-hidden /> Review “{result.fileName}”
          </span>
        }
        subtitle="Nothing is saved until you confirm the import."
      />
      <dl className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
        {[
          ['Rows in file', result.totalRows, 'text-slate-900'],
          ['Valid records', result.valid.length, 'text-emerald-700'],
          ['Rows with errors', invalidRows - result.duplicatesInFile, invalidRows - result.duplicatesInFile ? 'text-red-700' : 'text-slate-900'],
          ['Duplicates skipped', result.duplicatesInFile, result.duplicatesInFile ? 'text-amber-700' : 'text-slate-900'],
        ].map(([label, value, cls]) => (
          <div key={label as string} className="bg-white px-5 py-4 sm:px-6">
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
            <dd className={`mt-1 text-3xl font-bold tabular-nums ${cls}`}>{formatNumber(value as number)}</dd>
          </div>
        ))}
      </dl>

      {result.errors.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <AlertTriangle className="size-4 text-amber-600" aria-hidden /> Validation issues ({result.errors.length}) — these rows will not be imported
          </h3>
          <ul className="mt-3 max-h-56 space-y-1.5 overflow-y-auto text-sm">
            {result.errors.map((e, i) => (
              <li key={i} className="flex flex-wrap gap-x-2 rounded-md bg-slate-50 px-3 py-2">
                <span className="font-mono text-xs leading-5 text-slate-500">Line {e.line}</span>
                {e.field && <Badge tone="red">{e.field}</Badge>}
                <span className="text-slate-700">{e.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.valid.length > 0 && (
        <div className="border-t border-slate-100">
          <p className="px-5 pt-4 text-sm font-semibold text-slate-900">
            Preview{result.valid.length > PREVIEW_LIMIT ? ` (first ${PREVIEW_LIMIT} of ${result.valid.length} valid records)` : ''}
          </p>
          <div className="mt-3">
            <RecordsTable records={result.valid.slice(0, PREVIEW_LIMIT)} caption="Preview of valid records" />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
        {hasExisting && result.valid.length > 0 ? (
          <fieldset className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
            <legend className="sr-only">Import mode</legend>
            <label className="flex items-center gap-2">
              <input type="radio" name="mode" checked={mode === 'append'} onChange={() => setMode('append')} className="accent-brand-700" />
              Add to existing data
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="mode" checked={mode === 'replace'} onChange={() => setMode('replace')} className="accent-brand-700" />
              Replace existing data
            </label>
          </fieldset>
        ) : (
          <span className="text-sm text-slate-600">
            {result.valid.length === 0 ? 'No valid records to import. Fix the issues above and upload again.' : 'Ready to import.'}
          </span>
        )}
        <div className="flex gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="primary" disabled={result.valid.length === 0} onClick={() => onImport(hasExisting ? mode : 'replace')}>
            Import {formatNumber(result.valid.length)} valid record{result.valid.length === 1 ? '' : 's'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function ImportPage() {
  const { records, lastImport, isStaff, loadSampleData, importRecords, clearData, notify, navigate, noteEvidence } = useAppState()
  const [busy, setBusy] = useState<null | 'sample' | 'file'>(null)
  const [dragging, setDragging] = useState(false)
  const [parsed, setParsed] = useState<ParseResult | null>(null)
  const [confirmation, setConfirmation] = useState<ImportSummary | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const sponsorCount = useMemo(() => new Set(records.map((r) => r.sponsor)).size, [records])

  // Evidence for the Sprint page (US01): validation problems were reported to the user.
  useEffect(() => {
    if (!parsed) return
    if (parsed.fatal) noteEvidence('validation-shown', `“${parsed.fileName}” was rejected: ${parsed.fatal}`)
    else if (parsed.errors.length > 0)
      noteEvidence('validation-shown', `${parsed.errors.length} problem${parsed.errors.length === 1 ? '' : 's'} reported in “${parsed.fileName}”; those rows were not importable.`)
  }, [parsed, noteEvidence])

  const handleSample = () => {
    setBusy('sample')
    setParsed(null)
    // Short delay so the loading state is visible; the data itself is bundled locally (no network).
    setTimeout(() => {
      const summary = loadSampleData()
      setConfirmation(summary)
      setBusy(null)
      notify('success', `Sample data loaded: ${summary.added} records.`)
    }, 400)
  }

  const handleFile = (file: File | undefined) => {
    if (!file) return
    setConfirmation(null)
    if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
      setParsed({ fileName: file.name, totalRows: 0, valid: [], errors: [], duplicatesInFile: 0, fatal: 'Only .csv files are supported.' })
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setParsed({ fileName: file.name, totalRows: 0, valid: [], errors: [], duplicatesInFile: 0, fatal: 'The file is larger than 2 MB.' })
      return
    }
    setBusy('file')
    file
      .text()
      .then((text) => setParsed(parseImpactCsv(text, file.name)))
      .catch(() =>
        setParsed({ fileName: file.name, totalRows: 0, valid: [], errors: [], duplicatesInFile: 0, fatal: 'The file could not be read.' }),
      )
      .finally(() => {
        setBusy(null)
        if (inputRef.current) inputRef.current.value = ''
      })
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (!isStaff) return
    handleFile(e.dataTransfer.files[0])
  }

  const doImport = (mode: 'replace' | 'append') => {
    if (!parsed) return
    const summary = importRecords(parsed.valid, parsed.fileName, mode)
    setParsed(null)
    setConfirmation(summary)
    notify('success', `${summary.added} record${summary.added === 1 ? '' : 's'} imported from ${summary.fileName}.`)
  }

  return (
    <>
      <PageHeader
        eyebrow="US01 · Import sponsor-impact data"
        title="Import Sponsor Data"
        description="Upload a CSV of agreed sponsor-impact records, or load the bundled sample data. Files are read in your browser only — this prototype does not connect to Slack, Luma, Humanitix, Substack or any other MLAI platform."
        actions={
          !isStaff && (
            // Shown in the header (not above the cards) so switching roles never moves the buttons below.
            <p className="flex max-w-xs items-start gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm" role="status">
              <Lock className="mt-0.5 size-3.5 shrink-0 text-slate-500" aria-hidden />
              <span>
                <span className="font-semibold text-slate-900">Viewer (simulated): read-only.</span> Import and clear are turned off in the UI for this demo
                role. This is not real access control.
              </span>
            </p>
          )
        }
      />

      {confirmation && <ImportConfirmation summary={confirmation} onDismiss={() => setConfirmation(null)} />}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="relative overflow-hidden lg:col-span-1">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand-600" aria-hidden />
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Sparkles className="size-4 text-brand-700" aria-hidden /> Quick start
              </span>
            }
            subtitle="Recommended for the class demo"
          />
          <div className="space-y-3 p-5 sm:px-6">
            <p className="text-sm text-slate-600">
              Loads 11 fictional events for 3 sample sponsors: Acme Technology, Northstar Innovations and Horizon Ventures.
            </p>
            <Button variant="primary" size="lg" className="w-full" onClick={handleSample} disabled={!isStaff || busy !== null}>
              {busy === 'sample' ? <Spinner /> : <Sparkles className="size-4" aria-hidden />}
              {busy === 'sample' ? 'Loading sample data…' : 'Load Sample Data'}
            </Button>
            <p className="text-center text-xs text-slate-500">Replaces any data currently loaded with the sample set.</p>
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Sample files</p>
              <div className="flex flex-col gap-2">
                <Button size="sm" className="justify-start" onClick={() => downloadText(SAMPLE_FILE_NAME, SAMPLE_CSV)}>
                  <Download className="size-4" aria-hidden /> Download sample CSV
                </Button>
                <Button size="sm" className="justify-start" onClick={() => downloadText(ERROR_SAMPLE_FILE_NAME, ERROR_SAMPLE_CSV)}>
                  <Download className="size-4" aria-hidden /> Download CSV with errors
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Upload a CSV file" subtitle="Drag a file here or choose one from your computer. Max 2 MB." />
          <div className="p-5 sm:px-6">
            <div
              onClick={() => isStaff && busy === null && inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                if (isStaff) setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-150 ${
                dragging ? 'scale-[1.01] border-brand-600 bg-brand-50' : 'border-slate-300 bg-slate-50/60'
              } ${!isStaff ? 'opacity-60' : 'cursor-pointer hover:border-brand-500 hover:bg-brand-50/40'}`}
            >
              {busy === 'file' ? (
                <Spinner className="size-8 text-brand-700" />
              ) : (
                <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm ring-1 ring-slate-200">
                  <UploadCloud className="size-7" aria-hidden />
                </span>
              )}
              <p className="mt-4 text-[0.95rem] font-semibold text-slate-800">
                {busy === 'file'
                  ? 'Reading and validating file…'
                  : !isStaff
                    ? 'Import is off for the simulated Viewer role'
                    : dragging
                      ? 'Drop to upload'
                      : 'Drag and drop a .csv file here'}
              </p>
              <p className="mt-1 text-xs text-slate-500">or</p>
              <Button
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation()
                  inputRef.current?.click()
                }}
                disabled={!isStaff || busy !== null}
              >
                Choose file
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
            <dl className="mt-4 space-y-2 text-xs text-slate-600">
              {[
                ['Required', REQUIRED_COLUMNS],
                ['Optional', OPTIONAL_COLUMNS],
              ].map(([label, cols]) => (
                <div key={label as string} className="flex flex-wrap items-center gap-1.5">
                  <dt className="w-16 shrink-0 font-semibold text-slate-700">{label as string}</dt>
                  {(cols as readonly string[]).map((c) => (
                    <dd key={c}>
                      <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.72rem] text-slate-800 ring-1 ring-inset ring-slate-200">{c}</code>
                    </dd>
                  ))}
                </div>
              ))}
            </dl>
            <p className="mt-2 text-xs text-slate-500">Dates as YYYY-MM-DD (or DD/MM/YYYY). Counts as whole numbers.</p>
          </div>
        </Card>
      </div>

      {parsed && (
        <div className="mt-6">
          <ValidationPreview result={parsed} hasExisting={records.length > 0} onImport={doImport} onCancel={() => setParsed(null)} />
        </div>
      )}

      <Card className="mt-6 overflow-hidden">
        <CardHeader
          title="Data currently loaded"
          subtitle={
            records.length
              ? `${formatNumber(records.length)} records · ${sponsorCount} sponsor${sponsorCount === 1 ? '' : 's'}${lastImport ? ` · last import: ${lastImport.fileName}` : ''}`
              : 'No sponsor-impact records loaded yet.'
          }
          actions={
            records.length > 0 && (
              <>
                <Button size="sm" onClick={() => downloadText('mlai-current-demo-data.csv', recordsToCsv(records))}>
                  <Download className="size-4" aria-hidden /> Export CSV
                </Button>
                <Button size="sm" variant="danger" onClick={() => setConfirmClear(true)} disabled={!isStaff}>
                  <Trash2 className="size-4" aria-hidden /> Clear data
                </Button>
                <Button size="sm" variant="primary" onClick={() => navigate('sponsors')}>
                  View sponsors <ArrowRight className="size-4" aria-hidden />
                </Button>
              </>
            )
          }
        />
        {records.length > 0 ? (
          <div className="max-h-[26rem] overflow-y-auto">
            <RecordsTable
              records={[...records].sort((a, b) => b.date.localeCompare(a.date))}
              newIds={confirmation && confirmation.mode === 'append' ? new Set(confirmation.ids ?? []) : undefined}
              caption="All loaded sponsor-impact records"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <Inbox className="size-6 text-slate-400" aria-hidden />
            <p className="text-sm font-medium text-slate-700">Nothing imported yet</p>
            <p className="text-sm text-slate-500">Load the sample data or upload a CSV to get started.</p>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all imported data?"
        body="All sponsor-impact records will be removed from this browser. You can load the sample data again at any time."
        confirmLabel="Clear data"
        tone="danger"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          setConfirmClear(false)
          setConfirmation(null)
          clearData()
          notify('info', 'Imported data cleared.')
        }}
      />
    </>
  )
}
