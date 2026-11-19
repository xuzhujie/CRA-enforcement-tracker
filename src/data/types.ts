export type Mode = 'overview' | 'cra' | 'safety'
export type Language = 'zh' | 'en'
export type RecordProvenance = 'official-public' | 'illustrative-demo'
export type RecordCoverage = 'recorded' | 'checked-no-record' | 'not-reviewed'

export type CraStatus = 'compliant' | 'in-progress' | 'attention' | 'overdue' | 'not-reviewed'
export type SafetyGateStatus = 'none' | 'alert' | 'withdrawal' | 'recall'
export type TimelineState = 'done' | 'current' | 'upcoming'

export interface EvidenceRef {
  text: string
  sourceUrl: string
  provenance: RecordProvenance
  lastVerifiedAt: string
}

export interface CraEvent {
  id: string
  label: string
  date?: string
  state: TimelineState
  evidence?: EvidenceRef
  sourceUrl?: string
  provenance?: RecordProvenance
}

export interface SafetyGateEvent {
  id: string
  label: string
  date?: string
  state: TimelineState
  measure?: string
  evidence?: EvidenceRef
  sourceUrl?: string
  provenance?: RecordProvenance
}

export interface CraRecord {
  status: CraStatus
  reportingStatus: string
  regulatoryMeasure: string
  remediationDeadline?: string
  authority?: string
  events: CraEvent[]
  coverage: RecordCoverage
  evidence: string
  sourceUrl: string
  provenance: RecordProvenance
  lastVerifiedAt: string
}

export interface SafetyGateRecord {
  alertStatus: SafetyGateStatus
  alertId?: string
  caseNumber?: string
  reportReference?: string
  risk?: 'serious' | 'high' | 'medium' | 'low' | 'unknown'
  riskType?: string
  riskDescription?: string
  productDescription?: string
  barcode?: string
  measures: string[]
  notifiedBy?: string
  alertDate?: string
  countries?: string[]
  countryOfOrigin?: string
  events: SafetyGateEvent[]
  coverage: RecordCoverage
  evidence: string
  sourceUrl: string
  provenance: RecordProvenance
  lastVerifiedAt: string
}

export interface ProductRecord {
  id: string
  brand: string
  model: string
  productName: string
  productType: string
  markets: string[]
  manufacturer?: string
  boardStatus: 'multi-track-attention' | 'cra-attention' | 'safety-gate-attention' | 'no-public-record' | 'not-reviewed'
  cra?: CraRecord
  safetyGate?: SafetyGateRecord
}

export interface ProductFilters {
  brand: string
  model: string
  market: string
  productType: string
  search: string
}

export interface DashboardMetrics {
  craFocusCount: number
  safetyGateAlertCount: number
  remediationDeadlineCount: number
  publicRecallCount: number
  reportingNodeCount: number
  regulatoryMeasureCount: number
  seriousRiskCount: number
  withdrawalCount: number
}

export interface TimelineEvent {
  id: string
  lane: 'cra' | 'safetyGate'
  label: string
  date?: string
  state: TimelineState
  measure?: string
  sourceUrl?: string
  provenance?: RecordProvenance
}

export type MetricTone = 'blue' | 'amber' | 'red' | 'green'

export interface ModeMetric {
  label: string
  value: string
  note: string
  tone: MetricTone
}
