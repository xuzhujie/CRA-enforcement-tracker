import type {
  DashboardMetrics,
  Mode,
  ModeMetric,
  ProductFilters,
  ProductRecord,
  TimelineEvent,
} from '../data/types'

const DAY_MS = 24 * 60 * 60 * 1000

function toUtcDay(value: string): number | null {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  const timestamp = Date.UTC(year, month - 1, day)
  return Number.isNaN(timestamp) ? null : timestamp
}

function daysFrom(start: string, end: string): number | null {
  const startDay = toUtcDay(start)
  const endDay = toUtcDay(end)
  if (startDay == null || endDay == null) return null
  return Math.round((endDay - startDay) / DAY_MS)
}

function hasPublicSafetyRecord(product: ProductRecord): boolean {
  return product.safetyGate?.coverage === 'recorded' && product.safetyGate.alertStatus !== 'none'
}

function hasRecall(product: ProductRecord): boolean {
  return product.safetyGate?.coverage === 'recorded'
    && (product.safetyGate.alertStatus === 'recall'
      || product.safetyGate.measures.some((measure) => measure.toLowerCase().includes('recall') || measure.includes('召回')))
}

export function getDashboardMetrics(products: ProductRecord[], asOfDate: string): DashboardMetrics {
  const craFocusCount = new Set(
    products
      .filter((product) => product.cra && ['attention', 'in-progress', 'overdue'].includes(product.cra.status))
      .map((product) => product.id),
  ).size

  const safetyGateAlertCount = new Set(products.filter(hasPublicSafetyRecord).map((product) => product.id)).size
  const publicRecallCount = new Set(products.filter(hasRecall).map((product) => product.id)).size

  const remediationDeadlineCount = new Set(
    products
      .filter((product) => {
        const record = product.cra
        if (!record?.remediationDeadline) return false
        const days = daysFrom(asOfDate, record.remediationDeadline)
        if (record.coverage !== 'recorded') return false
        if (record.status === 'overdue') return true
        return record.status !== 'compliant' && days != null && days <= 30
      })
      .map((product) => product.id),
  ).size

  const reportingNodeCount = products.reduce(
    (count, product) => count + (product.cra?.events.filter((event) => /24h|72h|报告|notification/i.test(event.label)).length ?? 0),
    0,
  )

  const regulatoryMeasureCount = new Set(
    products
      .filter((product) => product.cra
        && product.cra.coverage === 'recorded'
        && product.cra.regulatoryMeasure
        && !/暂无|尚未核验|no current|not reviewed/i.test(product.cra.regulatoryMeasure))
      .map((product) => product.id),
  ).size

  const seriousRiskCount = new Set(
    products.filter((product) => product.safetyGate?.coverage === 'recorded' && product.safetyGate.risk === 'serious').map((product) => product.id),
  ).size

  const withdrawalCount = new Set(
    products
      .filter((product) => product.safetyGate?.coverage === 'recorded'
        && (product.safetyGate.alertStatus === 'withdrawal'
          || product.safetyGate.measures.some((measure) => measure.toLowerCase().includes('withdrawal') || measure.includes('撤回') || measure.includes('下架'))))
      .map((product) => product.id),
  ).size

  return {
    craFocusCount,
    safetyGateAlertCount,
    remediationDeadlineCount,
    publicRecallCount,
    reportingNodeCount,
    regulatoryMeasureCount,
    seriousRiskCount,
    withdrawalCount,
  }
}

export function getModeMetrics(metrics: DashboardMetrics, mode: Mode): ModeMetric[] {
  if (mode === 'cra') {
    return [
      { label: 'craFocus', value: String(metrics.craFocusCount), note: '报告、监管措施或整改待跟进', tone: 'blue' },
      { label: 'reportingNodes', value: String(metrics.reportingNodeCount), note: '24h / 72h / 报告节点', tone: 'blue' },
      { label: 'deadlines', value: String(metrics.remediationDeadlineCount), note: '逾期或未来 30 天内', tone: 'red' },
      { label: 'regulatoryMeasures', value: String(metrics.regulatoryMeasureCount), note: '当前有 CRA 措施记录', tone: 'green' },
    ]
  }

  if (mode === 'safety') {
    return [
      { label: 'safetyAlerts', value: String(metrics.safetyGateAlertCount), note: '当前数据集的公开警报产品', tone: 'amber' },
      { label: 'seriousRisk', value: String(metrics.seriousRiskCount), note: '标记为 serious 的产品', tone: 'red' },
      { label: 'withdrawals', value: String(metrics.withdrawalCount), note: '下架 / 撤回措施', tone: 'amber' },
      { label: 'recalls', value: String(metrics.publicRecallCount), note: '公开召回产品', tone: 'red' },
    ]
  }

  return [
    { label: 'craFocus', value: String(metrics.craFocusCount), note: '制造商报告 / 监管措施 / 整改', tone: 'blue' },
    { label: 'safetyAlerts', value: String(metrics.safetyGateAlertCount), note: '公开安全警报（欧盟）', tone: 'amber' },
    { label: 'deadlines', value: String(metrics.remediationDeadlineCount), note: '未来 30 天或已逾期', tone: 'red' },
    { label: 'recalls', value: String(metrics.publicRecallCount), note: '已发布的公开召回', tone: 'red' },
  ]
}

export function filterProducts(products: ProductRecord[], filters: ProductFilters): ProductRecord[] {
  const search = filters.search.trim().toLowerCase()

  return products.filter((product) => {
    const searchFields = [
      product.brand,
      product.model,
      product.productName,
      product.productType,
      product.safetyGate?.alertId ?? '',
    ].join(' ').toLowerCase()

    return (filters.brand === '' || product.brand === filters.brand)
      && (filters.model === '' || product.model === filters.model)
      && (filters.market === '' || product.markets.includes(filters.market))
      && (filters.productType === '' || product.productType === filters.productType)
      && (search === '' || searchFields.includes(search))
  })
}

export function getTimelineEvents(product: ProductRecord, mode: Mode): TimelineEvent[] {
  const craEvents: TimelineEvent[] = (mode === 'overview' || mode === 'cra')
    ? (product.cra?.events ?? []).map((event) => ({
      id: event.id,
      lane: 'cra' as const,
      label: event.label,
      date: event.date,
      state: event.state,
      sourceUrl: event.sourceUrl ?? event.evidence?.sourceUrl ?? product.cra?.sourceUrl,
      provenance: event.provenance ?? event.evidence?.provenance ?? product.cra?.provenance,
    }))
    : []

  const safetyEvents: TimelineEvent[] = (mode === 'overview' || mode === 'safety')
    ? (product.safetyGate?.events ?? []).map((event) => ({
      id: event.id,
      lane: 'safetyGate' as const,
      label: event.label,
      date: event.date,
      state: event.state,
      measure: event.measure,
      sourceUrl: event.sourceUrl ?? event.evidence?.sourceUrl ?? product.safetyGate?.sourceUrl,
      provenance: event.provenance ?? event.evidence?.provenance ?? product.safetyGate?.provenance,
    }))
    : []

  return [...craEvents, ...safetyEvents].sort((left, right) => (left.date ?? '').localeCompare(right.date ?? ''))
}

export function getUniqueFilterValues(products: ProductRecord[]) {
  return {
    brands: [...new Set(products.map((product) => product.brand))].sort(),
    models: [...new Set(products.map((product) => product.model))].sort(),
    markets: [...new Set(products.flatMap((product) => product.markets))].sort(),
    productTypes: [...new Set(products.map((product) => product.productType))].sort(),
  }
}

export function getBoardStatus(product: ProductRecord): ProductRecord['boardStatus'] {
  const craAttention = Boolean(product.cra && ['attention', 'in-progress', 'overdue'].includes(product.cra.status))
  const safetyAttention = hasPublicSafetyRecord(product)

  if (craAttention && safetyAttention) return 'multi-track-attention'
  if (craAttention) return 'cra-attention'
  if (safetyAttention) return 'safety-gate-attention'
  if (product.cra?.coverage === 'not-reviewed' || product.safetyGate?.coverage === 'not-reviewed') return 'not-reviewed'
  return 'no-public-record'
}
