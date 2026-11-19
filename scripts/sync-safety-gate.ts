import { mkdir, rename, unlink, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import {
  SAFETY_GATE_PUBLIC_URL,
  SAFETY_GATE_REPORT_LIST_URL,
  deduplicateSafetyGateAlerts,
  parseSafetyGateDetailXml,
  parseSafetyGateReportList,
  type SafetyGateSnapshot,
} from '../src/data/safetyGateSnapshot'
import { validateSafetyGateSnapshot } from '../src/lib/dataValidation'

const SNAPSHOT_PATH = path.resolve(process.cwd(), 'src/data/generated/safety-gate-snapshot.json')

function numericArg(name: string, fallback: number): number {
  const argument = process.argv.find((candidate) => candidate.startsWith(`${name}=`))
  if (!argument) return fallback
  const parsed = Number(argument.split('=')[1])
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${name} must be a positive integer`)
  return parsed
}

async function fetchXml(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw new Error(`Safety Gate request failed (${response.status}) for ${url}`)
  return response.text()
}

export async function writeValidatedSnapshot(snapshot: SafetyGateSnapshot, destinationPath: string): Promise<void> {
  const errors = validateSafetyGateSnapshot(snapshot)
  if (errors.length > 0) throw new Error(`Safety Gate snapshot validation failed: ${errors.join('; ')}`)

  await mkdir(path.dirname(destinationPath), { recursive: true })
  const temporaryPath = `${destinationPath}.tmp-${process.pid}`
  try {
    await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
    await rename(temporaryPath, destinationPath)
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined)
    throw error
  }
}

async function main() {
  const weeks = numericArg('--weeks', 4)
  const limit = numericArg('--limit', 120)
  const reportListXml = await fetchXml(SAFETY_GATE_REPORT_LIST_URL)
  const reports = parseSafetyGateReportList(reportListXml)
  if (reports.length === 0) throw new Error('Safety Gate report list contained no usable weekly reports')

  const selectedReports = reports.slice(0, weeks)
  const detailAlerts = await Promise.all(selectedReports.map(async (report) => {
    const detailXml = await fetchXml(report.detailUrl)
    return parseSafetyGateDetailXml(detailXml, report.reference)
  }))
  const alerts = deduplicateSafetyGateAlerts(detailAlerts.flat(), limit)
  if (alerts.length === 0) throw new Error('Safety Gate detail reports contained no usable alerts')

  const snapshot: SafetyGateSnapshot = {
    sourceUrl: SAFETY_GATE_PUBLIC_URL,
    feedUrl: SAFETY_GATE_REPORT_LIST_URL,
    generatedAt: new Date().toISOString().slice(0, 10),
    latestReportDate: reports[0].publicationDate,
    reportReferences: selectedReports.map((report) => report.reference),
    alerts,
  }

  await writeValidatedSnapshot(snapshot, SNAPSHOT_PATH)

  console.log(`Safety Gate snapshot updated: ${alerts.length} alerts from ${selectedReports.length} weekly reports`)
  console.log(`Latest report: ${snapshot.latestReportDate}; verified: ${snapshot.generatedAt}`)
  console.log(`Output: ${path.relative(process.cwd(), SNAPSHOT_PATH)}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
