import assert from 'node:assert/strict'
import test from 'node:test'
import { buildProducts } from '../src/data/productData'
import { findCraReview, validateCraReviewInputs } from '../src/data/craReview'
import { validateProducts } from '../src/lib/dataValidation'
import { getDashboardMetrics } from '../src/lib/dashboard'
import type { SafetyGateSnapshot } from '../src/data/safetyGateSnapshot'

const snapshot: SafetyGateSnapshot = {
  sourceUrl: 'https://ec.europa.eu/safety-gate-alerts/screen/webReport',
  feedUrl: 'https://ec.europa.eu/safety-gate-alerts/api/download/weeklyReport/list/xml/en',
  generatedAt: '2026-11-19',
  latestReportDate: '2026-11-13',
  reportReferences: ['Report-2026-45'],
  alerts: [{
    alertId: '1001',
    caseNumber: 'SR/00001/26',
    reportReference: 'Report-2026-45',
    publicationDate: '2026-11-10',
    sourceUrl: 'https://ec.europa.eu/safety-gate-alerts/screen/webReport/alertDetail/1001',
    category: 'Electrical appliances and equipment',
    product: 'Smart plug',
    brand: 'Acme',
    model: 'Plug Pro',
    barcode: '1234567890123',
    riskType: 'Fire',
    riskDescription: 'The product may overheat.',
    risk: 'high',
    alertStatus: 'recall',
    measures: ['Recall of the product from end users'],
    description: 'White smart plug.',
    notifyingCountry: 'Germany',
    countryOfOrigin: 'China',
  }],
}

test('maps an official Safety Gate alert without fabricating a CRA case', () => {
  const [product] = buildProducts(snapshot)

  assert.equal(product.id, 'safety-gate-1001')
  assert.equal(product.brand, 'Acme')
  assert.equal(product.model, 'Plug Pro')
  assert.deepEqual(product.markets, [])
  assert.equal(product.safetyGate?.notifiedBy, 'Germany')
  assert.equal(product.manufacturer, undefined)
  assert.equal(product.boardStatus, 'safety-gate-attention')
  assert.equal(product.safetyGate?.provenance, 'official-public')
  assert.equal(product.safetyGate?.alertId, '1001')
  assert.equal(product.safetyGate?.alertStatus, 'recall')
  assert.equal(product.cra?.status, 'not-reviewed')
  assert.equal(product.cra?.coverage, 'not-reviewed')
  assert.deepEqual(product.cra?.events, [])
})

test('rejects records that lose official provenance or traceability', () => {
  const [product] = buildProducts(snapshot)
  const invalid = {
    ...product,
    safetyGate: {
      ...product.safetyGate!,
      alertId: undefined,
      sourceUrl: '',
      provenance: 'illustrative-demo' as const,
    },
  }

  const errors = validateProducts([invalid], snapshot)
  assert.ok(errors.some((error) => error.includes('alertId')))
  assert.ok(errors.some((error) => error.includes('sourceUrl')))
  assert.ok(errors.some((error) => error.includes('illustrative-demo')))
})

test('accepts the normalized official product shape', () => {
  const products = buildProducts(snapshot)

  assert.deepEqual(validateProducts(products, snapshot), [])
})

test('does not count unreviewed CRA coverage as regulatory measures', () => {
  const products = buildProducts(snapshot)

  assert.equal(getDashboardMetrics(products, snapshot.generatedAt).regulatoryMeasureCount, 0)
})

test('matches an approved CRA review by Safety Gate alert ID', () => {
  const record = {
    status: 'attention' as const,
    reportingStatus: 'Reviewed by compliance owner',
    regulatoryMeasure: 'Follow-up required',
    events: [],
    coverage: 'recorded' as const,
    evidence: 'Approved internal CRA review evidence',
    sourceUrl: 'https://example.test/cra-review/1001',
    provenance: 'official-public' as const,
    lastVerifiedAt: snapshot.generatedAt,
  }

  assert.equal(findCraReview({ id: 'safety-gate-1001', brand: 'Acme', model: 'Plug Pro', safetyGateAlertId: '1001' }, [{ safetyGateAlertId: '1001', record }]), record)
  assert.equal(buildProducts(snapshot, [{ safetyGateAlertId: '1001', record }])[0].cra, record)
})

test('rejects CRA review entries without a match key or with demo provenance', () => {
  const errors = validateCraReviewInputs([
    {
      record: {
        status: 'attention',
        reportingStatus: 'Needs review',
        regulatoryMeasure: 'Follow-up required',
        events: [],
        coverage: 'recorded',
        evidence: 'Unapproved placeholder',
        sourceUrl: 'https://example.test/cra',
        provenance: 'illustrative-demo',
        lastVerifiedAt: snapshot.generatedAt,
      },
    },
  ])

  assert.ok(errors.some((error) => error.includes('match key')))
  assert.ok(errors.some((error) => error.includes('illustrative-demo')))
})
