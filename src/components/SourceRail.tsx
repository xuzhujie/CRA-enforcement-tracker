import React from 'react'
import { AlertTriangle, CalendarDays, ExternalLink, ShieldCheck } from 'lucide-react'
import type { Language } from '../data/types'
import type { OfficialSource } from '../data/sources'
import { copy } from '../ui/copy'

interface SourceRailProps {
  sources: OfficialSource[]
  language: Language
  dataAsOf: string
}

function SourceIcon({ sourceKey }: { sourceKey: OfficialSource['key'] }) {
  if (sourceKey === 'cra') return <CalendarDays size={16} aria-hidden="true" />
  if (sourceKey === 'safetyGate') return <AlertTriangle size={16} aria-hidden="true" />
  return <ShieldCheck size={16} aria-hidden="true" />
}

export default function SourceRail({ sources, language, dataAsOf }: SourceRailProps) {
  const ui = copy[language]
  return (
    <section className="source-rail" aria-label={ui.sourceLabel}>
      <div className="source-rail-heading">
        <div><span className="section-kicker">{ui.official}</span><h2>{language === 'zh' ? '来源 / 定义' : 'Sources / definitions'}</h2></div>
        <span className="source-as-of">{dataAsOf}</span>
      </div>
      <div className="source-card-list">
        {sources.map((source) => (
          <a className="source-card" data-source-key={source.key} key={source.key} href={source.url} target="_blank" rel="noreferrer">
            <div className="source-card-title"><SourceIcon sourceKey={source.key} /><strong>{source.label}</strong><ExternalLink size={13} aria-hidden="true" /></div>
            <p>{ui.sourceDescriptions[source.key]}</p>
          </a>
        ))}
      </div>
    </section>
  )
}
