import type { Language } from '../data/types'

export interface Copy {
  title: string
  portal: string
  dataAsOf: string
  lastVerified: string
  language: string
  sourceLabel: string
  modes: [string, string, string]
  separationNotice: string
  overview: string
  shellPlaceholder: string
  filters: string
  allBrands: string
  allModels: string
  allMarkets: string
  allProductTypes: string
  searchPlaceholder: string
  clearFilters: string
  dataLabel: string
  demoData: string
  official: string
  notReviewed: string
  notStated: string
  researchNote: string
  noPublicRecord: string
  sameProductNote: string
  productStatus: string
  sharedProduct: string
  craEvidence: string
  safetyEvidence: string
  close: string
  selectProduct: string
  empty: string
  metricLabels: Record<string, string>
  metricNotes: Record<string, string>
  sourceDescriptions: Record<'cra' | 'safetyGate' | 'enisa', string>
}

export const copy: Record<Language, Copy> = {
  zh: {
    title: 'CRA / GPSR · 共用产品看板',
    portal: '欧盟产品安全与网络韧性 · 产品级证据看板',
    dataAsOf: '数据日期',
    lastVerified: '最后核验',
    language: '语言',
    sourceLabel: '来源',
    modes: ['总览', 'CRA', 'GPSR / Safety Gate'],
    separationNotice: 'Safety Gate 警报不等于 CRA 执法；召回也不等于罚款。',
    overview: '产品状态总览',
    shellPlaceholder: '筛选产品后，在同一产品行中分别查看 CRA 与 GPSR / Safety Gate 证据。',
    filters: '筛选',
    allBrands: '全部品牌',
    allModels: '全部型号',
    allMarkets: '全部市场',
    allProductTypes: '全部产品类型',
    searchPlaceholder: '搜索品牌、型号、产品名或 Safety Gate ID',
    clearFilters: '清除筛选',
    dataLabel: '官方公开数据快照',
    demoData: '演示数据',
    official: '官方来源',
    notReviewed: '尚未核验',
    notStated: '公开警报未说明',
    researchNote: '仅供研究参考，不构成法律意见；请以欧盟及成员国主管机关官方原文为准。',
    noPublicRecord: '当前同步数据集中未发现公开记录',
    sameProductNote: '同一产品的并列记录；不表示同一执法程序。',
    productStatus: '看板状态（非法律结论）',
    sharedProduct: '共用产品信息',
    craEvidence: 'CRA 相关证据',
    safetyEvidence: 'Safety Gate 相关证据',
    close: '关闭详情',
    selectProduct: '选择产品查看详情',
    empty: '没有符合当前筛选条件的产品。',
    metricLabels: {
      craFocus: 'CRA 关注产品',
      reportingNodes: '报告节点',
      deadlines: '整改期限',
      regulatoryMeasures: '监管措施',
      safetyAlerts: 'Safety Gate alerts',
      seriousRisk: '严重风险',
      withdrawals: '下架 / 撤回',
      recalls: '公开召回',
    },
    metricNotes: {
      craFocus: '制造商报告 / 监管措施 / 整改',
      reportingNodes: '24h / 72h / 报告节点',
      deadlines: '未来 30 天或已逾期',
      regulatoryMeasures: '当前有 CRA 措施记录',
      safetyAlerts: '公开安全警报（欧盟）',
      seriousRisk: '标记为 serious 的产品',
      withdrawals: '下架 / 撤回措施',
      recalls: '已发布的公开召回',
    },
    sourceDescriptions: {
      cra: 'CRA 适用日期、制造商义务、报告节点与监管措施。',
      safetyGate: '公开安全警报、风险描述与下架 / 撤回 / 召回信息。',
      enisa: 'CRA Single Reporting Platform 的官方报告说明与入口。',
    },
  },
  en: {
    title: 'CRA / GPSR · Shared Product Board',
    portal: 'EU product safety and cyber resilience · product-level evidence board',
    dataAsOf: 'Data date',
    lastVerified: 'Last verified',
    language: 'Language',
    sourceLabel: 'Sources',
    modes: ['Overview', 'CRA', 'GPSR / Safety Gate'],
    separationNotice: 'A Safety Gate alert is not CRA enforcement; a recall is not a fine.',
    overview: 'Product status overview',
    shellPlaceholder: 'Filter products to compare CRA and GPSR / Safety Gate evidence on one shared product row.',
    filters: 'Filters',
    allBrands: 'All brands',
    allModels: 'All models',
    allMarkets: 'All markets',
    allProductTypes: 'All product types',
    searchPlaceholder: 'Search brand, model, product name or Safety Gate ID',
    clearFilters: 'Clear filters',
    dataLabel: 'Official public snapshot',
    demoData: 'Illustrative demo data',
    official: 'Official source',
    notReviewed: 'Not reviewed',
    notStated: 'Not stated in public alert',
    researchNote: 'For research only, not legal advice; refer to the official text of EU and national authorities.',
    noPublicRecord: 'No public record found in the current synchronized dataset',
    sameProductNote: 'Parallel records for the same product; not the same proceeding.',
    productStatus: 'Board status (not a legal conclusion)',
    sharedProduct: 'Shared product identity',
    craEvidence: 'CRA evidence',
    safetyEvidence: 'Safety Gate evidence',
    close: 'Close details',
    selectProduct: 'Select a product to view details',
    empty: 'No products match the current filters.',
    metricLabels: {
      craFocus: 'CRA focus products',
      reportingNodes: 'Reporting nodes',
      deadlines: 'Remediation deadlines',
      regulatoryMeasures: 'Regulatory measures',
      safetyAlerts: 'Safety Gate alerts',
      seriousRisk: 'Serious risk',
      withdrawals: 'Withdrawal / takedown',
      recalls: 'Public recalls',
    },
    metricNotes: {
      craFocus: 'Manufacturer reports / measures / remediation',
      reportingNodes: '24h / 72h / reporting nodes',
      deadlines: 'Due within 30 days or overdue',
      regulatoryMeasures: 'Products with a CRA measure',
      safetyAlerts: 'Public alerts in the dataset',
      seriousRisk: 'Products marked serious',
      withdrawals: 'Withdrawal / takedown measures',
      recalls: 'Products with a public recall',
    },
    sourceDescriptions: {
      cra: 'CRA dates, manufacturer duties, reporting nodes and regulatory measures.',
      safetyGate: 'Public safety alerts, risk descriptions and withdrawal / recall information.',
      enisa: 'Official CRA Single Reporting Platform guidance and entry point.',
    },
  },
}
