import type { CraRecord, ProductRecord } from './types'

export const CRA_SOURCE_URL = 'https://digital-strategy.ec.europa.eu/en/policies/cra-summary'

export interface CraReviewInput {
  productId?: string
  safetyGateAlertId?: string
  brand?: string
  model?: string
  record: CraRecord
}

// This manifest is intentionally empty until a CRA evidence owner supplies
// approved product-level records with traceable sources.
export const craReviewRecords: CraReviewInput[] = []

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const timestamp = Date.UTC(year, month - 1, day)
  return new Date(timestamp).toISOString().slice(0, 10) === value
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateCraReviewInputs(records: CraReviewInput[]): string[] {
  const errors: string[] = []
  const productIds = new Set<string>()
  const alertIds = new Set<string>()

  records.forEach((entry, index) => {
    const label = `CRA review entry ${index + 1}`
    const hasProductId = Boolean(entry.productId?.trim())
    const hasAlertId = Boolean(entry.safetyGateAlertId?.trim())
    const hasBrandModel = Boolean(entry.brand?.trim() && entry.model?.trim())

    if (!hasProductId && !hasAlertId && !hasBrandModel) errors.push(`${label}: at least one match key is required`)
    if ((entry.brand && !entry.model) || (!entry.brand && entry.model)) errors.push(`${label}: brand and model must be provided together`)
    if (entry.productId && productIds.has(entry.productId)) errors.push(`${label}: duplicate productId`)
    if (entry.productId) productIds.add(entry.productId)
    if (entry.safetyGateAlertId && alertIds.has(entry.safetyGateAlertId)) errors.push(`${label}: duplicate safetyGateAlertId`)
    if (entry.safetyGateAlertId) alertIds.add(entry.safetyGateAlertId)
    if (entry.safetyGateAlertId && !/^\d+$/.test(entry.safetyGateAlertId)) errors.push(`${label}: safetyGateAlertId must be numeric`)

    const record = entry.record
    if (record.coverage !== 'recorded') errors.push(`${label}: CRA review coverage must be recorded`)
    if (record.status === 'not-reviewed') errors.push(`${label}: approved CRA review cannot use not-reviewed status`)
    if (!record.evidence.trim()) errors.push(`${label}: product-level evidence is required`)
    if (!isHttpUrl(record.sourceUrl)) errors.push(`${label}: sourceUrl must be an HTTP(S) URL`)
    if (!isValidIsoDate(record.lastVerifiedAt)) errors.push(`${label}: lastVerifiedAt must be a valid ISO date`)
    if (record.provenance === 'illustrative-demo') errors.push(`${label}: approved CRA review cannot use illustrative-demo provenance`)
  })

  return errors
}

export function findCraReview(
  product: Pick<ProductRecord, 'id' | 'brand' | 'model'> & { safetyGateAlertId?: string },
  records: CraReviewInput[] = craReviewRecords,
): CraRecord | undefined {
  const match = records.find((entry) => (
    (entry.productId && entry.productId === product.id)
    || (entry.safetyGateAlertId && entry.safetyGateAlertId === product.safetyGateAlertId)
    || (entry.brand && entry.model && entry.brand === product.brand && entry.model === product.model)
  ))
  return match?.record
}

export function createNotReviewedCraRecord(lastVerifiedAt: string): CraRecord {
  return {
    status: 'not-reviewed',
    reportingStatus: '尚未核验',
    regulatoryMeasure: '尚未核验',
    events: [],
    coverage: 'not-reviewed',
    evidence: '当前没有可公开核验的 CRA 产品级案件记录；此状态不表示合规或无风险。',
    sourceUrl: CRA_SOURCE_URL,
    provenance: 'official-public',
    lastVerifiedAt,
  }
}
