import React from 'react'
import { ExternalLink, ShieldAlert } from 'lucide-react'
import type { Language, RecordCoverage, RecordProvenance } from '../data/types'
import { copy } from '../ui/copy'

interface EvidenceItem {
  label: string
  value: string
}

interface EvidenceSectionProps {
  title: string
  tone: 'cra' | 'safety'
  status: string
  items: EvidenceItem[]
  evidence: string
  coverage: RecordCoverage
  provenance: RecordProvenance
  sourceUrl: string
  lastVerifiedAt: string
  language: Language
}

export default function EvidenceSection({ title, tone, status, items, evidence, coverage, provenance, sourceUrl, lastVerifiedAt, language }: EvidenceSectionProps) {
  const ui = copy[language]
  const provenanceLabel = coverage === 'recorded'
    ? (provenance === 'illustrative-demo' ? ui.demoData : ui.official)
    : (coverage === 'not-reviewed' ? ui.notReviewed : ui.noPublicRecord)
  const provenanceClass = coverage === 'recorded'
    ? (provenance === 'illustrative-demo' ? 'demo-mark' : 'official-mark')
    : 'coverage-mark'
  return (
    <section className={`evidence-section evidence-${tone}`}>
      <div className="evidence-heading">
        <div><ShieldAlert size={15} aria-hidden="true" /><strong>{title}</strong></div>
        <span className="evidence-status">{status}</span>
      </div>
      <dl className="evidence-list">
        {items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
      </dl>
      <p className="evidence-copy">{evidence}</p>
      <div className="evidence-meta">
        <span className={provenanceClass}>{provenanceLabel}</span>
        <span>{ui.lastVerified}: {lastVerifiedAt}</span>
        <a href={sourceUrl} target="_blank" rel="noreferrer">{ui.sourceLabel} <ExternalLink size={12} aria-hidden="true" /></a>
      </div>
    </section>
  )
}
