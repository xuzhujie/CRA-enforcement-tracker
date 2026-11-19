import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { parseSafetyGateDetailXml, parseSafetyGateReportList, type SafetyGateSnapshot } from '../src/data/safetyGateSnapshot'
import { writeValidatedSnapshot } from '../scripts/sync-safety-gate'

const reportListXml = `<?xml version="1.0"?>
<Safety-Gate>
  <weeklyReport>
    <report_language>en</report_language>
    <reference>Report-2026-45</reference>
    <publicationDate>13/11/2026</publicationDate>
    <URL>https://example.test/detail.xml?language=en&amp;search=one</URL>
  </weeklyReport>
  <weeklyReport>
    <report_language>en</report_language>
    <reference>Report-2026-44</reference>
    <publicationDate>06/11/2026</publicationDate>
    <URL>https://example.test/detail-44.xml</URL>
  </weeklyReport>
</Safety-Gate>`

const detailXml = `<?xml version="1.0"?>
<Safety-Gate>
  <report_language>en</report_language>
  <report_date>13/11/2026</report_date>
  <notifications>
    <caseNumber>SR/03208/26</caseNumber>
    <publicationDate>10-11-2026</publicationDate>
    <reference><![CDATA[https://ec.europa.eu/safety-gate-alerts/screen/webReport/alertDetail/10118633]]></reference>
    <category><![CDATA[Electrical appliances and equipment]]></category>
    <product><![CDATA[Smart plug]]></product>
    <brand><![CDATA[Acme &amp; Co]]></brand>
    <name><![CDATA[Plug Pro]]></name>
    <type_numberOfModel><![CDATA[PP-1]]></type_numberOfModel>
    <barcode xsi:nil="true" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>
    <riskType><![CDATA[Electric shock, Fire]]></riskType>
    <danger><![CDATA[The product may overheat.]]></danger>
    <measures><![CDATA[Type of economic operator to whom the measure(s) were ordered: DistributorCategory of measure(s): Withdrawal of the product from the marketDate of entry into force: UnknownType of economic operator to whom the measure(s) were ordered: DistributorCategory of measure(s): Recall of the product from end usersDate of entry into force: Unknown]]></measures>
    <description><![CDATA[White smart plug.]]></description>
    <notifyingCountry>Germany</notifyingCountry>
    <countryOfOrigin>China</countryOfOrigin>
    <type>Consumer</type>
    <level>Serious risk</level>
  </notifications>
</Safety-Gate>`

test('parses and sorts weekly report summaries from the official list XML', () => {
  const reports = parseSafetyGateReportList(reportListXml)

  assert.deepEqual(reports, [
    {
      reference: 'Report-2026-45',
      publicationDate: '2026-11-13',
      detailUrl: 'https://example.test/detail.xml?language=en&search=one',
    },
    {
      reference: 'Report-2026-44',
      publicationDate: '2026-11-06',
      detailUrl: 'https://example.test/detail-44.xml',
    },
  ])
})

test('normalizes a Safety Gate alert with CDATA, nil fields, risk and multiple measures', () => {
  const [alert] = parseSafetyGateDetailXml(detailXml, 'Report-2026-45')

  assert.equal(alert.alertId, '10118633')
  assert.equal(alert.caseNumber, 'SR/03208/26')
  assert.equal(alert.publicationDate, '2026-11-10')
  assert.equal(alert.brand, 'Acme & Co')
  assert.equal(alert.model, 'Plug Pro')
  assert.equal(alert.barcode, undefined)
  assert.equal(alert.risk, 'serious')
  assert.equal(alert.alertStatus, 'recall')
  assert.deepEqual(alert.measures, ['Withdrawal of the product from the market', 'Recall of the product from end users'])
  assert.equal(alert.notifyingCountry, 'Germany')
  assert.equal(alert.sourceUrl, 'https://ec.europa.eu/safety-gate-alerts/screen/webReport/alertDetail/10118633')
})

test('does not fabricate a model or accept a weekly report URL as alert evidence', () => {
  const xml = `<notifications>
    <caseNumber>SR/03209/26</caseNumber>
    <publicationDate>10-11-2026</publicationDate>
    <reference>https://example.test/detail.xml</reference>
    <category>Toys</category>
    <product>Unbranded toy</product>
    <brand>Not stated</brand>
    <measures><![CDATA[Category of measure(s): Removal of this product listing by the online marketplaceDate of entry into force: Unknown]]></measures>
    <danger>Choking</danger>
    <riskType>Choking</riskType>
    <level>Serious risk</level>
    <notifyingCountry>Germany</notifyingCountry>
  </notifications>`

  assert.deepEqual(parseSafetyGateDetailXml(xml, 'Report-2026-45'), [])

  const validXml = xml.replace('https://example.test/detail.xml', 'https://ec.europa.eu/safety-gate-alerts/screen/webReport/alertDetail/10118634')
  const [alert] = parseSafetyGateDetailXml(validXml, 'Report-2026-45')
  assert.equal(alert.model, 'Not stated')
  assert.equal(alert.alertId, '10118634')
})

test('does not classify a ban-only measure as a withdrawal', () => {
  const xml = `<notifications>
    <caseNumber>SR/03210/26</caseNumber>
    <publicationDate>10-11-2026</publicationDate>
    <reference>https://ec.europa.eu/safety-gate-alerts/screen/webReport/alertDetail/10118635</reference>
    <category>Toys</category>
    <product>Unbranded toy</product>
    <brand>Not stated</brand>
    <name>TOY-1</name>
    <measures><![CDATA[Category of measure(s): Ban on the marketing of the product and any accompanying measuresDate of entry into force: Unknown]]></measures>
    <danger>Choking</danger>
    <riskType>Choking</riskType>
    <level>Serious risk</level>
    <notifyingCountry>Germany</notifyingCountry>
  </notifications>`

  const [alert] = parseSafetyGateDetailXml(xml, 'Report-2026-45')
  assert.equal(alert.alertStatus, 'alert')
})

test('rejects a malformed candidate before replacing the last known-good snapshot', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cra-safety-gate-'))
  const destination = path.join(directory, 'snapshot.json')
  await writeFile(destination, 'known-good\n', 'utf8')
  const malformed: SafetyGateSnapshot = {
    sourceUrl: 'https://ec.europa.eu/safety-gate-alerts/screen/webReport',
    feedUrl: 'https://ec.europa.eu/safety-gate-alerts/api/download/weeklyReport/list/xml/en',
    generatedAt: '2026-11-19',
    latestReportDate: '2026-11-13',
    reportReferences: ['Report-2026-45'],
    alerts: [{
      alertId: 'SR/03210/26',
      caseNumber: 'SR/03210/26',
      reportReference: 'Report-2026-45',
      publicationDate: '2026-11-10',
      sourceUrl: 'https://ec.europa.eu/safety-gate-alerts/screen/webReport/alertDetail/10118635',
      category: 'Toys',
      product: 'Unbranded toy',
      brand: 'Not stated',
      model: 'Not stated',
      riskType: 'Choking',
      riskDescription: 'Choking',
      risk: 'serious',
      alertStatus: 'alert',
      measures: ['Ban on the marketing'],
      description: 'Unbranded toy',
      notifyingCountry: 'Germany',
    }],
  }

  await assert.rejects(() => writeValidatedSnapshot(malformed, destination), /validation failed/i)
  assert.equal(await readFile(destination, 'utf8'), 'known-good\n')
})
