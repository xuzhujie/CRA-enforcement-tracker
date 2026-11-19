import type { SafetyGateStatus } from './types'

export const SAFETY_GATE_PUBLIC_URL = 'https://ec.europa.eu/safety-gate-alerts/screen/webReport'
export const SAFETY_GATE_REPORT_LIST_URL = 'https://ec.europa.eu/safety-gate-alerts/api/download/weeklyReport/list/xml/en'
export const SAFETY_GATE_ALERT_URL_PATTERN = /^https:\/\/ec\.europa\.eu\/safety-gate-alerts\/screen\/webReport\/alertDetail\/(\d+)(?:[/?#].*)?$/i
export const SAFETY_GATE_MAX_REPORT_AGE_DAYS = 60

export interface SafetyGateReportSummary {
  reference: string
  publicationDate: string
  detailUrl: string
}

export interface SafetyGateAlertSnapshot {
  alertId: string
  caseNumber: string
  reportReference: string
  publicationDate: string
  sourceUrl: string
  category: string
  product: string
  brand: string
  model: string
  barcode?: string
  riskType: string
  riskDescription: string
  risk: 'serious' | 'high' | 'medium' | 'low' | 'unknown'
  alertStatus: SafetyGateStatus
  measures: string[]
  description: string
  notifyingCountry: string
  countryOfOrigin?: string
}

export interface SafetyGateSnapshot {
  sourceUrl: string
  feedUrl: string
  generatedAt: string
  latestReportDate: string
  reportReferences: string[]
  alerts: SafetyGateAlertSnapshot[]
}

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal: string) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function clean(value: string | undefined): string | undefined {
  if (!value) return undefined
  const decoded = decodeXml(value).replace(/\s+/g, ' ').trim()
  return decoded || undefined
}

function tagValue(block: string, tag: string): string | undefined {
  const nilPattern = new RegExp(`<${tag}\\b[^>]*xsi:nil=["']true["'][^>]*/?>`, 'i')
  if (nilPattern.test(block)) return undefined
  const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  return clean(pattern.exec(block)?.[1])
}

function dateToIso(value: string | undefined): string | undefined {
  if (!value) return undefined
  const parts = value.split(/[/-]/).map(Number)
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return undefined
  const [first, second, third] = parts
  if (String(first).length === 4) return `${String(first).padStart(4, '0')}-${String(second).padStart(2, '0')}-${String(third).padStart(2, '0')}`
  return `${String(third).padStart(4, '0')}-${String(second).padStart(2, '0')}-${String(first).padStart(2, '0')}`
}

function extractBlocks(xml: string, tag: string): string[] {
  const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'gi')
  return [...xml.matchAll(pattern)].map((match) => match[1])
}

export function extractSafetyGateAlertId(sourceUrl: string): string | undefined {
  return SAFETY_GATE_ALERT_URL_PATTERN.exec(sourceUrl)?.[1]
}

function normalizeMeasures(value: string | undefined): string[] {
  if (!value) return []
  const matches = [...value.matchAll(/Category of measure\(s\):\s*([\s\S]*?)Date of entry into force/gi)]
  return matches
    .map((match) => clean(match[1]))
    .filter((measure): measure is string => Boolean(measure))
}

function deriveAlertStatus(measures: string[]): SafetyGateStatus {
  const joined = measures.join(' ').toLowerCase()
  if (joined.includes('recall') || joined.includes('召回')) return 'recall'
  if (joined.includes('withdraw')
    || joined.includes('takedown')
    || joined.includes('removal')
    || joined.includes('removed')
    || joined.includes('撤回')
    || joined.includes('下架')) return 'withdrawal'
  return 'alert'
}

function deriveRisk(level: string | undefined): SafetyGateAlertSnapshot['risk'] {
  const normalized = level?.toLowerCase() ?? ''
  if (normalized.includes('serious')) return 'serious'
  if (normalized.includes('high')) return 'high'
  if (normalized.includes('medium')) return 'medium'
  if (normalized.includes('low')) return 'low'
  return 'unknown'
}

export function parseSafetyGateReportList(xml: string): SafetyGateReportSummary[] {
  return extractBlocks(xml, 'weeklyReport')
    .map((block) => {
      const reference = tagValue(block, 'reference')
      const publicationDate = dateToIso(tagValue(block, 'publicationDate'))
      const detailUrl = tagValue(block, 'URL')
      if (!reference || !publicationDate || !detailUrl) return null
      return { reference, publicationDate, detailUrl }
    })
    .filter((report): report is SafetyGateReportSummary => Boolean(report))
    .sort((left, right) => right.publicationDate.localeCompare(left.publicationDate))
}

export function parseSafetyGateDetailXml(xml: string, reportReference: string): SafetyGateAlertSnapshot[] {
  return extractBlocks(xml, 'notifications')
    .map((block): SafetyGateAlertSnapshot | null => {
      const caseNumber = tagValue(block, 'caseNumber') ?? ''
      const sourceUrl = tagValue(block, 'reference')
      const publicationDate = dateToIso(tagValue(block, 'publicationDate'))
      const alertId = sourceUrl ? extractSafetyGateAlertId(sourceUrl) : undefined
      if (!caseNumber || !sourceUrl || !alertId || !publicationDate) return null

      const product = tagValue(block, 'product') ?? 'Unspecified product'
      const name = tagValue(block, 'name')
      const typeNumberOfModel = tagValue(block, 'type_numberOfModel')
      const measures = normalizeMeasures(tagValue(block, 'measures'))
      return {
        alertId,
        caseNumber,
        reportReference,
        publicationDate,
        sourceUrl,
        category: tagValue(block, 'category') ?? 'Unspecified category',
        product,
        brand: tagValue(block, 'brand') ?? 'Not stated',
        model: name ?? typeNumberOfModel ?? 'Not stated',
        barcode: tagValue(block, 'barcode'),
        riskType: tagValue(block, 'riskType') ?? 'Not stated',
        riskDescription: tagValue(block, 'danger') ?? 'Not stated',
        risk: deriveRisk(tagValue(block, 'level')),
        alertStatus: deriveAlertStatus(measures),
        measures,
        description: tagValue(block, 'description') ?? product,
        notifyingCountry: tagValue(block, 'notifyingCountry') ?? 'Not stated',
        countryOfOrigin: tagValue(block, 'countryOfOrigin'),
      }
    })
    .filter((alert): alert is SafetyGateAlertSnapshot => Boolean(alert))
}

export function deduplicateSafetyGateAlerts(alerts: SafetyGateAlertSnapshot[], limit = alerts.length): SafetyGateAlertSnapshot[] {
  const unique = new Map<string, SafetyGateAlertSnapshot>()
  for (const alert of alerts) {
    if (!unique.has(alert.alertId)) unique.set(alert.alertId, alert)
  }
  return [...unique.values()].sort((left, right) => right.publicationDate.localeCompare(left.publicationDate)).slice(0, limit)
}
