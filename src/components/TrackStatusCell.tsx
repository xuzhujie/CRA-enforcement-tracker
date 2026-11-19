import React from 'react'
import { AlertTriangle, CircleCheck, CircleMinus, RotateCcw, ShieldCheck } from 'lucide-react'
import type { CraRecord, Language, SafetyGateRecord } from '../data/types'
import { copy } from '../ui/copy'

interface TrackStatusCellProps {
  track: 'cra' | 'safetyGate'
  record?: CraRecord | SafetyGateRecord
  language: Language
}

function renderCoverage(record: CraRecord | SafetyGateRecord | undefined, ui: ReturnType<typeof getCopy>) {
  if (!record || record.coverage === 'checked-no-record') {
    return <span className="track-empty"><CircleMinus size={14} aria-hidden="true" /> {ui.noPublicRecord}</span>
  }
  if (record.coverage === 'not-reviewed') return <span className="track-empty"><CircleMinus size={14} aria-hidden="true" /> {ui.notReviewed}</span>
  return null
}

function getCopy(language: Language) {
  return copy[language]
}

function craStatusLabel(status: CraRecord['status'], language: Language) {
  const labels = language === 'zh'
    ? { compliant: '合规', 'in-progress': '进行中', attention: '关注', overdue: '整改逾期', 'not-reviewed': '尚未核验' }
    : { compliant: 'Compliant', 'in-progress': 'In progress', attention: 'Attention', overdue: 'Overdue', 'not-reviewed': 'Not reviewed' }
  return labels[status]
}

function safetyStatusLabel(status: SafetyGateRecord['alertStatus'], language: Language) {
  const labels = language === 'zh'
    ? { none: '无公开警报', alert: '已发布警报', withdrawal: '下架 / 撤回', recall: '公开召回' }
    : { none: 'No public alert', alert: 'Alert published', withdrawal: 'Withdrawal / takedown', recall: 'Public recall' }
  return labels[status]
}

export default function TrackStatusCell({ track, record, language }: TrackStatusCellProps) {
  const ui = getCopy(language)
  const empty = renderCoverage(record, ui)
  if (empty) return <div className={`track-cell track-${track}`}>{empty}</div>

  if (track === 'cra') {
    const cra = record as CraRecord
    const Icon = cra.status === 'compliant' ? CircleCheck : cra.status === 'overdue' ? AlertTriangle : ShieldCheck
    return (
      <div className={`track-cell track-cra cra-${cra.status}`} data-track="cra">
        <div className="track-cell-head">
          <span className="track-status"><Icon size={15} aria-hidden="true" /> {craStatusLabel(cra.status, language)}</span>
          {cra.provenance === 'illustrative-demo' && <span className="demo-mark">{ui.demoData}</span>}
        </div>
        <strong>{cra.reportingStatus}</strong>
        <span>{cra.regulatoryMeasure}</span>
        {cra.remediationDeadline && <span className="track-deadline">{language === 'zh' ? '整改期限' : 'Deadline'}: {cra.remediationDeadline}</span>}
      </div>
    )
  }

  const safety = record as SafetyGateRecord
  const Icon = safety.alertStatus === 'none' ? CircleMinus : safety.alertStatus === 'recall' ? RotateCcw : AlertTriangle
  return (
    <div className={`track-cell track-safety ${safety.alertStatus}`} data-track="safetyGate">
      <div className="track-cell-head">
        <span className="track-status"><Icon size={15} aria-hidden="true" /> {safetyStatusLabel(safety.alertStatus, language)}</span>
        {safety.provenance === 'illustrative-demo' && <span className="demo-mark">{ui.demoData}</span>}
      </div>
      {safety.alertId ? <strong>{safety.alertId}</strong> : <strong>—</strong>}
      <span>{safety.measures.length > 0 ? safety.measures.join(' · ') : ui.noPublicRecord}</span>
      {safety.risk && <span className="track-risk">{language === 'zh' ? '风险' : 'Risk'}: {safety.risk}</span>}
    </div>
  )
}
