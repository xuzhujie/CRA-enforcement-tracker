import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  filterProducts,
  getBoardStatus,
  getDashboardMetrics,
  getModeMetrics,
  getTimelineEvents,
} from '../src/lib/dashboard'
import { copy } from '../src/ui/copy'
import MetricStrip from '../src/components/MetricStrip'
import ProductRegister from '../src/components/ProductRegister'
import ProductDetailRail from '../src/components/ProductDetailRail'
import DualLaneTimeline from '../src/components/DualLaneTimeline'
import SourceRail from '../src/components/SourceRail'
import FooterNote from '../src/components/FooterNote'
import TrackStatusCell from '../src/components/TrackStatusCell'
import { officialSources } from '../src/data/sources'
import type { ProductRecord } from '../src/data/types'

const AS_OF_DATE = '2026-11-19'

const products = [
  {
    id: 'p-1',
    brand: 'Acme',
    model: 'Hub H2',
    productName: 'Home Hub H2',
    productType: 'Smart home hub',
    markets: ['EU / EEA'],
    manufacturer: 'Acme Demo Labs',
    boardStatus: 'multi-track-attention',
    cra: {
      status: 'attention',
      reportingStatus: 'Awaiting main notification',
      regulatoryMeasure: 'Remediation requested',
      remediationDeadline: '2026-11-20',
      events: [{ id: 'c1', label: 'T0 / 72h', date: '2026-11-19', state: 'current' }],
      coverage: 'recorded',
      evidence: 'Demo CRA evidence',
      sourceUrl: 'https://example.com/cra',
      provenance: 'illustrative-demo',
      lastVerifiedAt: AS_OF_DATE,
    },
    safetyGate: {
      alertStatus: 'alert',
      alertId: 'SG-001',
      risk: 'high',
      measures: ['Warning message'],
      events: [{ id: 's1', label: 'Alert published', date: '2026-11-18', state: 'done' }],
      coverage: 'recorded',
      evidence: 'Demo Safety Gate evidence',
      sourceUrl: 'https://example.com/safety',
      provenance: 'illustrative-demo',
      lastVerifiedAt: AS_OF_DATE,
    },
  },
  {
    id: 'p-2',
    brand: 'FitWell',
    model: 'TrackPro T5',
    productName: 'TrackPro T5',
    productType: 'Fitness tracker',
    markets: ['EU / EEA'],
    manufacturer: 'FitWell Demo',
    boardStatus: 'multi-track-attention',
    cra: {
      status: 'in-progress',
      reportingStatus: 'Notification submitted',
      regulatoryMeasure: 'Corrective action under review',
      remediationDeadline: '2026-12-30',
      events: [{ id: 'c2', label: 'Initial notification', date: '2026-11-17', state: 'done' }],
      coverage: 'recorded',
      evidence: 'Demo CRA evidence',
      sourceUrl: 'https://example.com/cra',
      provenance: 'illustrative-demo',
      lastVerifiedAt: AS_OF_DATE,
    },
    safetyGate: {
      alertStatus: 'recall',
      alertId: 'SG-002',
      risk: 'serious',
      measures: ['Withdrawal', 'Recall'],
      events: [
        { id: 's2a', label: 'Alert published', date: '2026-11-10', state: 'done' },
        { id: 's2b', label: 'Recall', date: '2026-11-12', state: 'current', measure: 'recall' },
      ],
      coverage: 'recorded',
      evidence: 'Demo Safety Gate evidence',
      sourceUrl: 'https://example.com/safety',
      provenance: 'illustrative-demo',
      lastVerifiedAt: AS_OF_DATE,
    },
  },
  {
    id: 'p-3',
    brand: 'DoorSense',
    model: 'Doorbell D3',
    productName: 'Doorbell D3',
    productType: 'Wireless doorbell',
    markets: ['EU / EEA'],
    manufacturer: 'DoorSense Demo',
    boardStatus: 'no-public-record',
    cra: {
      status: 'compliant',
      reportingStatus: 'Completed',
      regulatoryMeasure: 'No current measure',
      events: [{ id: 'c3', label: 'Assessment complete', date: '2026-10-12', state: 'done' }],
      coverage: 'recorded',
      evidence: 'Demo CRA evidence',
      sourceUrl: 'https://example.com/cra',
      provenance: 'illustrative-demo',
      lastVerifiedAt: AS_OF_DATE,
    },
    safetyGate: {
      alertStatus: 'none',
      measures: [],
      events: [],
      coverage: 'checked-no-record',
      evidence: 'No public record found in curated dataset',
      sourceUrl: 'https://example.com/safety',
      provenance: 'illustrative-demo',
      lastVerifiedAt: AS_OF_DATE,
    },
  },
  {
    id: 'p-4',
    brand: 'BabyCare',
    model: 'Monitor B1',
    productName: 'Baby Monitor B1',
    productType: 'Baby monitor',
    markets: ['United Kingdom'],
    manufacturer: 'BabyCare Demo',
    boardStatus: 'cra-attention',
    cra: {
      status: 'overdue',
      reportingStatus: 'Measure overdue',
      regulatoryMeasure: 'Market surveillance follow-up',
      remediationDeadline: '2026-11-10',
      events: [{ id: 'c4', label: 'Remediation deadline', date: '2026-11-10', state: 'current' }],
      coverage: 'recorded',
      evidence: 'Demo CRA evidence',
      sourceUrl: 'https://example.com/cra',
      provenance: 'illustrative-demo',
      lastVerifiedAt: AS_OF_DATE,
    },
    safetyGate: {
      alertStatus: 'withdrawal',
      alertId: 'SG-004',
      risk: 'medium',
      measures: ['Withdrawal'],
      events: [{ id: 's4', label: 'Withdrawal', date: '2026-11-02', state: 'done', measure: 'withdrawal' }],
      coverage: 'recorded',
      evidence: 'Demo Safety Gate evidence',
      sourceUrl: 'https://example.com/safety',
      provenance: 'illustrative-demo',
      lastVerifiedAt: AS_OF_DATE,
    },
  },
] as const

test('counts CRA attention, in-progress, and overdue products once', () => {
  const metrics = getDashboardMetrics(products, AS_OF_DATE)

  assert.equal(metrics.craFocusCount, 3)
})

test('counts Safety Gate alerts and recalls by product, not by event', () => {
  const metrics = getDashboardMetrics(products, AS_OF_DATE)

  assert.equal(metrics.safetyGateAlertCount, 3)
  assert.equal(metrics.publicRecallCount, 1)
  assert.equal(metrics.seriousRiskCount, 1)
})

test('counts only open deadlines due within 30 days or already overdue', () => {
  const metrics = getDashboardMetrics(products, AS_OF_DATE)

  assert.equal(metrics.remediationDeadlineCount, 2)
})

test('counts only non-compliant open deadlines and includes stale dates', () => {
  const edgeCases: ProductRecord[] = [
    {
      ...products[2],
      id: 'p-compliant-future-deadline',
      cra: { ...products[2].cra, remediationDeadline: '2026-12-10' },
    },
    {
      ...products[2],
      id: 'p-attention-stale-deadline',
      cra: { ...products[2].cra, status: 'attention', remediationDeadline: '2026-11-10' },
    },
    {
      ...products[2],
      id: 'p-attention-later-deadline',
      cra: { ...products[2].cra, status: 'attention', remediationDeadline: '2026-12-21' },
    },
  ]

  assert.equal(getDashboardMetrics([edgeCases[0]], AS_OF_DATE).remediationDeadlineCount, 0)
  assert.equal(getDashboardMetrics([edgeCases[1]], AS_OF_DATE).remediationDeadlineCount, 1)
  assert.equal(getDashboardMetrics([edgeCases[2]], AS_OF_DATE).remediationDeadlineCount, 0)
})

test('treats missing safety gate data as no record in the curated dataset', () => {
  assert.equal(getBoardStatus(products[2]), 'no-public-record')
})

test('filters by brand, model, market, and case-insensitive search', () => {
  assert.deepEqual(filterProducts(products, { brand: 'Acme', model: '', market: '', productType: '', search: '' }).map((item) => item.id), ['p-1'])
  assert.deepEqual(filterProducts(products, { brand: '', model: 'TrackPro T5', market: '', productType: '', search: '' }).map((item) => item.id), ['p-2'])
  assert.deepEqual(filterProducts(products, { brand: '', model: '', market: 'United Kingdom', productType: '', search: '' }).map((item) => item.id), ['p-4'])
  assert.deepEqual(filterProducts(products, { brand: '', model: '', market: '', productType: '', search: 'sg-002' }).map((item) => item.id), ['p-2'])
})

test('projects only the selected track into CRA or Safety Gate timelines', () => {
  assert.ok(getTimelineEvents(products[1], 'cra').every((event) => event.lane === 'cra'))
  assert.ok(getTimelineEvents(products[1], 'safety').every((event) => event.lane === 'safetyGate'))
  assert.deepEqual(new Set(getTimelineEvents(products[1], 'overview').map((event) => event.lane)), new Set(['cra', 'safetyGate']))
})

test('exposes bilingual shell copy without changing the approved information architecture', () => {
  assert.equal(copy.zh.title, 'CRA / GPSR · 共用产品看板')
  assert.deepEqual(copy.zh.modes, ['总览', 'CRA', 'GPSR / Safety Gate'])
  assert.equal(copy.zh.separationNotice, 'Safety Gate 警报不等于 CRA 执法；召回也不等于罚款。')
  assert.equal(copy.en.title, 'CRA / GPSR · Shared Product Board')
  assert.equal(copy.en.modes.length, 3)
})

test('labels public snapshots and unreviewed CRA coverage without demo provenance', () => {
  assert.equal(copy.zh.dataLabel, '官方公开数据快照')
  assert.equal(copy.zh.notReviewed, '尚未核验')
  assert.equal(copy.zh.noPublicRecord, '当前同步数据集中未发现公开记录')

  const markup = renderToStaticMarkup(createElement(TrackStatusCell, {
    track: 'cra',
    record: {
      status: 'not-reviewed',
      reportingStatus: '尚未核验',
      regulatoryMeasure: '尚未核验',
      events: [],
      coverage: 'not-reviewed',
      evidence: '当前没有可公开核验的 CRA 产品案件记录。',
      sourceUrl: 'https://digital-strategy.ec.europa.eu/en/policies/cra-summary',
      provenance: 'official-public',
      lastVerifiedAt: AS_OF_DATE,
    },
    language: 'zh',
  }))

  assert.match(markup, /尚未核验/)
  assert.doesNotMatch(markup, /演示数据/)
})

test('does not badge unreviewed CRA coverage as product-level official evidence', () => {
  const product = {
    ...products[0],
    cra: {
      ...products[0].cra,
      status: 'not-reviewed' as const,
      reportingStatus: '尚未核验',
      regulatoryMeasure: '尚未核验',
      events: [],
      coverage: 'not-reviewed' as const,
      evidence: '当前没有可公开核验的 CRA 产品级案件记录。',
      provenance: 'official-public' as const,
    },
  } satisfies ProductRecord

  const markup = renderToStaticMarkup(createElement(ProductDetailRail, {
    product,
    mode: 'cra',
    language: 'zh',
    open: true,
    onClose: () => undefined,
  }))

  assert.match(markup, /尚未核验/)
  assert.doesNotMatch(markup, /official-mark/)
})

test('filtering a single product recomputes all four overview metrics', () => {
  const filtered = filterProducts(products, { brand: 'FitWell', model: '', market: '', productType: '', search: '' })
  const metrics = getDashboardMetrics(filtered, AS_OF_DATE)

  assert.deepEqual(
    [metrics.craFocusCount, metrics.safetyGateAlertCount, metrics.remediationDeadlineCount, metrics.publicRecallCount],
    [1, 1, 0, 1],
  )
})

test('CRA mode returns CRA-only metric labels and values', () => {
  const metrics = getDashboardMetrics(products, AS_OF_DATE)
  const modeMetrics = getModeMetrics(metrics, 'cra')

  assert.deepEqual(modeMetrics.map((item) => item.label), ['craFocus', 'reportingNodes', 'deadlines', 'regulatoryMeasures'])
  assert.deepEqual(modeMetrics.map((item) => item.value), ['3', '2', '2', '3'])
})

test('Safety Gate mode returns Safety Gate-only metric labels and values', () => {
  const metrics = getDashboardMetrics(products, AS_OF_DATE)
  const modeMetrics = getModeMetrics(metrics, 'safety')

  assert.deepEqual(modeMetrics.map((item) => item.label), ['safetyAlerts', 'seriousRisk', 'withdrawals', 'recalls'])
  assert.deepEqual(modeMetrics.map((item) => item.value), ['3', '1', '2', '1'])
})

test('renders four non-interactive metric cells', () => {
  const markup = renderToStaticMarkup(createElement(MetricStrip, {
    items: [
      { label: 'craFocus', value: '3', note: 'CRA focus', tone: 'blue' },
      { label: 'safetyAlerts', value: '2', note: 'Alerts', tone: 'amber' },
      { label: 'deadlines', value: '3', note: 'Deadlines', tone: 'red' },
      { label: 'recalls', value: '1', note: 'Recalls', tone: 'red' },
    ],
  }))

  assert.equal((markup.match(/data-metric=/g) ?? []).length, 4)
  assert.match(markup, /CRA focus/)
})

test('renders shared product fields and selected dual-track row state', () => {
  const markup = renderToStaticMarkup(createElement(ProductRegister, {
    products,
    mode: 'overview',
    selectedProductId: 'p-2',
    language: 'zh',
    onSelect: () => undefined,
  }))

  assert.match(markup, /<table/)
  assert.match(markup, /FitWell/)
  assert.match(markup, /aria-selected="true"/)
  assert.match(markup, /data-track="cra"/)
  assert.match(markup, /data-track="safetyGate"/)
  assert.match(markup, /data-track-column="cra"/)
  assert.match(markup, /data-track-column="safetyGate"/)
})

test('renders independent CRA and Safety Gate evidence in the selected product rail', () => {
  const markup = renderToStaticMarkup(createElement(ProductDetailRail, {
    product: products[1],
    mode: 'overview',
    language: 'zh',
    open: true,
    onClose: () => undefined,
  }))

  assert.match(markup, /同一产品的并列记录；不表示同一执法程序。/)
  assert.match(markup, /CRA 相关证据/)
  assert.match(markup, /Safety Gate 相关证据/)
  assert.match(markup, /SG-002/)
  assert.match(markup, /演示数据/)
})

test('derives the detail rail board status from both evidence tracks', () => {
  const markup = renderToStaticMarkup(createElement(ProductDetailRail, {
    product: products[3],
    mode: 'overview',
    language: 'zh',
    open: true,
    onClose: () => undefined,
  }))

  assert.match(markup, /多轨关注/)
})

test('renders overview and line-specific timelines without merging lanes', () => {
  const overview = renderToStaticMarkup(createElement(DualLaneTimeline, { product: products[1], mode: 'overview', language: 'zh' }))
  const cra = renderToStaticMarkup(createElement(DualLaneTimeline, { product: products[1], mode: 'cra', language: 'zh' }))
  const safety = renderToStaticMarkup(createElement(DualLaneTimeline, { product: products[2], mode: 'safety', language: 'zh' }))

  assert.match(overview, /data-lane="cra"/)
  assert.match(overview, /data-lane="safetyGate"/)
  assert.match(cra, /data-lane="cra"/)
  assert.doesNotMatch(cra, /data-lane="safetyGate"/)
  assert.match(safety, /当前同步数据集中未发现公开记录/)
})

test('renders a select-product state when no timeline product is selected', () => {
  const markup = renderToStaticMarkup(createElement(DualLaneTimeline, { product: null, mode: 'overview', language: 'zh' }))

  assert.match(markup, /选择产品查看详情/)
})

test('renders official source cards and the research disclaimer', () => {
  const sources = renderToStaticMarkup(createElement(SourceRail, { sources: officialSources, language: 'zh', dataAsOf: AS_OF_DATE }))
  const footer = renderToStaticMarkup(createElement(FooterNote, { language: 'zh', dataAsOf: AS_OF_DATE }))

  assert.equal((sources.match(/class="source-card"/g) ?? []).length, 3)
  assert.match(sources, /CRA 时间表/)
  assert.match(sources, /rel="noreferrer"/)
  assert.match(footer, /仅供研究参考，不构成法律意见/)
})
