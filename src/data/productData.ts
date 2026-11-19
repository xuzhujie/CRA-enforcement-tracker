import type { CraRecord, ProductRecord, SafetyGateEvent, SafetyGateRecord } from './types'
import type { SafetyGateAlertSnapshot, SafetyGateSnapshot } from './safetyGateSnapshot'
import { createNotReviewedCraRecord, craReviewRecords, findCraReview, type CraReviewInput } from './craReview'

function measureType(measure: string): string {
  const normalized = measure.toLowerCase()
  if (normalized.includes('recall')) return 'recall'
  if (normalized.includes('withdraw')
    || normalized.includes('takedown')
    || normalized.includes('removal')
    || normalized.includes('removed')
    || normalized.includes('撤回')
    || normalized.includes('下架')) return 'withdrawal'
  return 'measure'
}

function evidence(alert: SafetyGateAlertSnapshot, lastVerifiedAt: string) {
  return {
    text: alert.riskDescription,
    sourceUrl: alert.sourceUrl,
    provenance: 'official-public' as const,
    lastVerifiedAt,
  }
}

function toSafetyGateRecord(alert: SafetyGateAlertSnapshot, lastVerifiedAt: string): SafetyGateRecord {
  const alertEvidence = evidence(alert, lastVerifiedAt)
  const events: SafetyGateEvent[] = [
    {
      id: `${alert.alertId}-published`,
      label: '警报发布',
      date: alert.publicationDate,
      state: 'done',
      measure: 'alert',
      evidence: alertEvidence,
    },
    ...alert.measures.map((measure, index) => ({
      id: `${alert.alertId}-measure-${index + 1}`,
      label: measure,
      date: alert.publicationDate,
      state: 'current' as const,
      measure: measureType(measure),
      evidence: alertEvidence,
    })),
  ]

  return {
    alertStatus: alert.alertStatus,
    alertId: alert.alertId,
    caseNumber: alert.caseNumber,
    reportReference: alert.reportReference,
    risk: alert.risk,
    riskType: alert.riskType,
    riskDescription: alert.riskDescription,
    productDescription: alert.description,
    barcode: alert.barcode,
    measures: alert.measures,
    notifiedBy: alert.notifyingCountry,
    alertDate: alert.publicationDate,
    countries: [alert.notifyingCountry],
    countryOfOrigin: alert.countryOfOrigin,
    events,
    coverage: 'recorded',
    evidence: alert.riskDescription,
    sourceUrl: alert.sourceUrl,
    provenance: 'official-public',
    lastVerifiedAt,
  }
}

function getBoardStatus(cra: CraRecord, safetyGate: SafetyGateRecord): ProductRecord['boardStatus'] {
  const craAttention = ['attention', 'in-progress', 'overdue'].includes(cra.status)
  const safetyAttention = safetyGate.coverage === 'recorded' && safetyGate.alertStatus !== 'none'
  if (craAttention && safetyAttention) return 'multi-track-attention'
  if (craAttention) return 'cra-attention'
  if (safetyAttention) return 'safety-gate-attention'
  if (cra.coverage === 'not-reviewed' || safetyGate.coverage === 'not-reviewed') return 'not-reviewed'
  return 'no-public-record'
}

export function buildProducts(snapshot: SafetyGateSnapshot, reviews: CraReviewInput[] = craReviewRecords): ProductRecord[] {
  return snapshot.alerts.map((alert) => {
    const safetyGate = toSafetyGateRecord(alert, snapshot.generatedAt)
    const identity = {
      id: `safety-gate-${alert.alertId}`,
      brand: alert.brand,
      model: alert.model,
    }
    const cra = findCraReview({ ...identity, safetyGateAlertId: alert.alertId }, reviews) ?? createNotReviewedCraRecord(snapshot.generatedAt)

    return {
      ...identity,
      productName: alert.product,
      productType: alert.category,
      markets: [],
      manufacturer: undefined,
      boardStatus: getBoardStatus(cra, safetyGate),
      cra,
      safetyGate,
    }
  })
}
