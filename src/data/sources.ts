export interface OfficialSource {
  key: 'cra' | 'safetyGate' | 'enisa'
  label: string
  description: string
  url: string
  dataUrl?: string
}

export const officialSources: OfficialSource[] = [
  {
    key: 'cra',
    label: 'CRA 时间表',
    description: '欧盟委员会对《网络弹性法案》适用日期、报告义务与监管措施的官方摘要。',
    url: 'https://digital-strategy.ec.europa.eu/en/policies/cra-summary',
  },
  {
    key: 'safetyGate',
    label: 'Safety Gate',
    description: '欧盟公开安全警报系统：危险非食品产品、风险描述与下架 / 撤回 / 召回措施。',
    url: 'https://ec.europa.eu/safety-gate-alerts/screen/webReport',
    dataUrl: 'https://ec.europa.eu/safety-gate-alerts/api/download/weeklyReport/list/xml/en',
  },
  {
    key: 'enisa',
    label: 'ENISA · SRP',
    description: 'CRA Single Reporting Platform 的报告说明、注册指导与官方入口。',
    url: 'https://www.enisa.europa.eu/topics/product-security/vulnerability-services/eu-incident-response-and-cyber-crisis-management/single-reporting-platform-srp',
  },
]
