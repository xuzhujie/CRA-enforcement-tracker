import {
  extractSafetyGateAlertId,
  SAFETY_GATE_ALERT_URL_PATTERN,
  SAFETY_GATE_MAX_REPORT_AGE_DAYS,
  SAFETY_GATE_PUBLIC_URL,
  SAFETY_GATE_REPORT_LIST_URL,
  type SafetyGateSnapshot,
} from '../data/safetyGateSnapshot'
import type { ProductRecord } from '../data/types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const SAFETY_GATE_RISKS = new Set(['serious', 'high', 'medium', 'low', 'unknown'])
const SAFETY_GATE_STATUSES = new Set(['none', 'alert', 'withdrawal', 'recall'])

function isIsoDate(value: string | undefined): value is string {
  if (!value || !ISO_DATE.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const timestamp = Date.UTC(year, month - 1, day)
  return new Date(timestamp).toISOString().slice(0, 10) === value
}

function daysBetween(later: string, earlier: string): number | null {
  if (!isIsoDate(later) || !isIsoDate(earlier)) return null
  return Math.round((Date.parse(`${later}T00:00:00Z`) - Date.parse(`${earlier}T00:00:00Z`)) / (24 * 60 * 60 * 1000))
}

export function validateSafetyGateSnapshot(snapshot: SafetyGateSnapshot): string[] {
  const errors: string[] = []
  if (snapshot.sourceUrl !== SAFETY_GATE_PUBLIC_URL) errors.push('snapshot.sourceUrl must be the official Safety Gate portal')
  if (snapshot.feedUrl !== SAFETY_GATE_REPORT_LIST_URL) errors.push('snapshot.feedUrl must be the official Safety Gate weekly XML feed')
  if (!isIsoDate(snapshot.generatedAt)) errors.push('snapshot.generatedAt must be a valid ISO date')
  if (!isIsoDate(snapshot.latestReportDate)) errors.push('snapshot.latestReportDate must be a valid ISO date')

  const reportReferences = Array.isArray(snapshot.reportReferences) ? snapshot.reportReferences : []
  if (reportReferences.length === 0) errors.push('snapshot.reportReferences must not be empty')
  if (new Set(reportReferences).size !== reportReferences.length) errors.push('snapshot.reportReferences must be unique')

  const alerts = Array.isArray(snapshot.alerts) ? snapshot.alerts : []
  if (alerts.length === 0) errors.push('snapshot.alerts must not be empty')

  const latestAge = daysBetween(snapshot.generatedAt, snapshot.latestReportDate)
  if (latestAge != null && latestAge < 0) errors.push('snapshot.latestReportDate cannot be after generatedAt')
  if (latestAge != null && latestAge > SAFETY_GATE_MAX_REPORT_AGE_DAYS) {
    errors.push(`snapshot.latestReportDate is older than ${SAFETY_GATE_MAX_REPORT_AGE_DAYS} days`)
  }

  const alertIds = new Set<string>()
  for (const alert of alerts) {
    if (!alert || typeof alert !== 'object') {
      errors.push('snapshot.alerts contains a malformed entry')
      continue
    }
    if (!/^\d+$/.test(alert.alertId)) errors.push(`${alert.alertId || 'unknown'}: alertId must be numeric`)
    if (alertIds.has(alert.alertId)) errors.push(`${alert.alertId}: duplicate alertId`)
    alertIds.add(alert.alertId)

    if (!SAFETY_GATE_ALERT_URL_PATTERN.test(alert.sourceUrl)) errors.push(`${alert.alertId}: sourceUrl is not a canonical Safety Gate alert URL`)
    const sourceAlertId = extractSafetyGateAlertId(alert.sourceUrl)
    if (sourceAlertId && sourceAlertId !== alert.alertId) errors.push(`${alert.alertId}: alertId does not match sourceUrl`)
    if (!alert.caseNumber) errors.push(`${alert.alertId}: caseNumber is required`)
    if (!reportReferences.includes(alert.reportReference)) errors.push(`${alert.alertId}: reportReference is not in the snapshot`)
    if (!isIsoDate(alert.publicationDate)) errors.push(`${alert.alertId}: publicationDate must be a valid ISO date`)
    if (isIsoDate(snapshot.generatedAt) && isIsoDate(alert.publicationDate) && alert.publicationDate > snapshot.generatedAt) {
      errors.push(`${alert.alertId}: publicationDate cannot be after generatedAt`)
    }
    if (!alert.product || !alert.category || !alert.brand || !alert.model) errors.push(`${alert.alertId}: product identity fields are incomplete`)
    if (!Array.isArray(alert.measures) || alert.measures.length === 0) errors.push(`${alert.alertId}: at least one measure is required`)
    if (!SAFETY_GATE_RISKS.has(alert.risk)) errors.push(`${alert.alertId}: unsupported risk value`)
    if (!SAFETY_GATE_STATUSES.has(alert.alertStatus)) errors.push(`${alert.alertId}: unsupported alertStatus value`)
  }

  return errors
}

export function validateProducts(products: ProductRecord[], snapshot: SafetyGateSnapshot): string[] {
  const errors: string[] = [...validateSafetyGateSnapshot(snapshot)]
  const snapshotAlerts = Array.isArray(snapshot.alerts) ? snapshot.alerts : []
  const snapshotAlertIds = new Set(snapshotAlerts.map((alert) => alert.alertId))
  const ids = new Set<string>()

  for (const product of products) {
    if (ids.has(product.id)) errors.push(`${product.id}: duplicate product id`)
    ids.add(product.id)
    if (!product.brand || !product.model || !product.productName || !product.productType) errors.push(`${product.id}: shared product identity is incomplete`)

    const safety = product.safetyGate
    if (safety?.coverage === 'recorded') {
      if (!safety.alertId) errors.push(`${product.id}: recorded Safety Gate entry requires alertId`)
      if (safety.alertId && !snapshotAlertIds.has(safety.alertId)) errors.push(`${product.id}: Safety Gate alertId is not in the snapshot`)
      if (!safety.sourceUrl) errors.push(`${product.id}: recorded Safety Gate entry requires sourceUrl`)
      if (safety.sourceUrl && !SAFETY_GATE_ALERT_URL_PATTERN.test(safety.sourceUrl)) errors.push(`${product.id}: recorded Safety Gate sourceUrl is not canonical`)
      if (safety.alertId && safety.sourceUrl && extractSafetyGateAlertId(safety.sourceUrl) !== safety.alertId) errors.push(`${product.id}: Safety Gate alertId does not match sourceUrl`)
      if (safety.provenance !== 'official-public') errors.push(`${product.id}: recorded Safety Gate entry cannot use ${safety.provenance} provenance`)
      if (!safety.lastVerifiedAt || !isIsoDate(safety.lastVerifiedAt)) errors.push(`${product.id}: Safety Gate lastVerifiedAt must be a valid ISO date`)
    }

    const cra = product.cra
    if (cra?.coverage === 'recorded' && cra.provenance === 'illustrative-demo') errors.push(`${product.id}: recorded CRA entry cannot use illustrative-demo provenance`)
    if (cra?.coverage === 'not-reviewed' && cra.status !== 'not-reviewed') errors.push(`${product.id}: not-reviewed CRA entry must use not-reviewed status`)
    if (cra?.coverage === 'not-reviewed' && cra.provenance !== 'official-public') errors.push(`${product.id}: not-reviewed CRA entry must use official explanatory provenance`)
  }

  return errors
}
