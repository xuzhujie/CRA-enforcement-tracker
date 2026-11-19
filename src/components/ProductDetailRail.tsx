import React from 'react'
import { CalendarDays, CircleX, FileCheck2 } from 'lucide-react'
import type { CraRecord, Language, Mode, ProductRecord, SafetyGateRecord } from '../data/types'
import { getBoardStatus } from '../lib/dashboard'
import { copy } from '../ui/copy'
import EvidenceSection from './EvidenceSection'

interface ProductDetailRailProps {
  product: ProductRecord | null
  mode: Mode
  language: Language
  open: boolean
  onClose: () => void
}

function boardStatusLabel(status: ProductRecord['boardStatus'], language: Language) {
  const labels = language === 'zh'
    ? {
      'multi-track-attention': '多轨关注',
      'cra-attention': 'CRA 关注',
      'safety-gate-attention': 'Safety Gate 关注',
      'no-public-record': '无公开记录',
      'not-reviewed': '尚未核验',
    }
    : {
      'multi-track-attention': 'Multi-track attention',
      'cra-attention': 'CRA attention',
      'safety-gate-attention': 'Safety Gate attention',
      'no-public-record': 'No public record',
      'not-reviewed': 'Not reviewed',
    }
  return labels[status]
}

function craStatusLabel(record: CraRecord | undefined, language: Language) {
  if (!record) return language === 'zh' ? '无 CRA 记录' : 'No CRA record'
  const labels = language === 'zh'
    ? { compliant: '合规', 'in-progress': '进行中', attention: '关注', overdue: '整改逾期', 'not-reviewed': '尚未核验' }
    : { compliant: 'Compliant', 'in-progress': 'In progress', attention: 'Attention', overdue: 'Overdue', 'not-reviewed': 'Not reviewed' }
  return labels[record.status]
}

function safetyStatusLabel(record: SafetyGateRecord | undefined, language: Language) {
  if (!record || record.coverage === 'checked-no-record') return copy[language].noPublicRecord
  const labels = language === 'zh'
    ? { none: '无公开警报', alert: '已发布警报', withdrawal: '下架 / 撤回', recall: '公开召回' }
    : { none: 'No public alert', alert: 'Alert published', withdrawal: 'Withdrawal / takedown', recall: 'Public recall' }
  return labels[record.alertStatus]
}

export default function ProductDetailRail({ product, mode, language, open, onClose }: ProductDetailRailProps) {
  if (!open || !product) return null

  const ui = copy[language]
  const showCra = mode === 'overview' || mode === 'cra'
  const showSafety = mode === 'overview' || mode === 'safety'
  const cra = product.cra
  const safety = product.safetyGate

  return (
    <aside className="product-detail-rail" aria-label={`${product.brand} ${product.model}`}>
      <header className="detail-rail-header">
        <div>
          <span className="section-kicker">{ui.sharedProduct}</span>
          <h2>{product.brand} · {product.model}</h2>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label={ui.close}><CircleX size={18} aria-hidden="true" /></button>
      </header>
      <div className="detail-rail-body">
        <div className="detail-status">
          <span>{ui.productStatus}</span>
          <strong>{boardStatusLabel(getBoardStatus(product), language)}</strong>
        </div>
        <dl className="product-facts">
          <div><dt>Brand</dt><dd>{product.brand}</dd></div>
          <div><dt>Model</dt><dd>{product.model}</dd></div>
          <div><dt>{language === 'zh' ? '产品类型' : 'Product type'}</dt><dd>{product.productType}</dd></div>
          <div><dt>Market</dt><dd>{product.markets.join(' · ') || ui.notStated}</dd></div>
          <div><dt>{language === 'zh' ? '制造商' : 'Manufacturer'}</dt><dd>{product.manufacturer ?? ui.notStated}</dd></div>
        </dl>
        {mode === 'overview' && <p className="parallel-note"><FileCheck2 size={14} aria-hidden="true" /> {ui.sameProductNote}</p>}

        {showCra && (cra ? (
          <EvidenceSection
            title={ui.craEvidence}
            tone="cra"
            status={craStatusLabel(cra, language)}
            items={[
              { label: language === 'zh' ? '制造商报告' : 'Manufacturer report', value: cra.reportingStatus },
              { label: language === 'zh' ? '监管措施' : 'Regulatory measure', value: cra.regulatoryMeasure },
              { label: language === 'zh' ? '整改期限' : 'Remediation deadline', value: cra.remediationDeadline ?? '—' },
              { label: language === 'zh' ? '主管机关' : 'Authority', value: cra.authority ?? '—' },
            ]}
            evidence={cra.evidence}
            coverage={cra.coverage}
            provenance={cra.provenance}
            sourceUrl={cra.sourceUrl}
            lastVerifiedAt={cra.lastVerifiedAt}
            language={language}
          />
        ) : (
          <div className="detail-no-record"><CalendarDays size={15} aria-hidden="true" /> {language === 'zh' ? '当前没有 CRA 记录。' : 'No CRA record for this product.'}</div>
        ))}

        {showSafety && (safety ? (
          <EvidenceSection
            title={ui.safetyEvidence}
            tone="safety"
            status={safetyStatusLabel(safety, language)}
            items={[
              { label: 'Safety Gate ID', value: safety.alertId ?? '—' },
              { label: language === 'zh' ? '案件编号' : 'Case number', value: safety.caseNumber ?? '—' },
              { label: language === 'zh' ? '风险' : 'Risk', value: safety.risk ?? '—' },
              { label: language === 'zh' ? '风险类别' : 'Risk type', value: safety.riskType ?? '—' },
              { label: language === 'zh' ? '措施类型' : 'Measures', value: safety.measures.join(' · ') || '—' },
              { label: language === 'zh' ? '发布日期' : 'Alert date', value: safety.alertDate ?? '—' },
              { label: language === 'zh' ? '通知国家' : 'Notifying country', value: safety.notifiedBy ?? '—' },
              { label: language === 'zh' ? '原产国' : 'Country of origin', value: safety.countryOfOrigin ?? '—' },
              { label: language === 'zh' ? '条码' : 'Barcode', value: safety.barcode ?? '—' },
              { label: language === 'zh' ? '产品描述' : 'Product description', value: safety.productDescription ?? '—' },
            ]}
            evidence={safety.evidence}
            coverage={safety.coverage}
            provenance={safety.provenance}
            sourceUrl={safety.sourceUrl}
            lastVerifiedAt={safety.lastVerifiedAt}
            language={language}
          />
        ) : (
          <div className="detail-no-record"><CalendarDays size={15} aria-hidden="true" /> {ui.noPublicRecord}</div>
        ))}
      </div>
    </aside>
  )
}
