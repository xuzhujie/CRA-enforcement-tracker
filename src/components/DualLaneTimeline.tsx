import React from 'react'
import { AlertTriangle, CalendarDays, CircleCheck, CircleDot, ShieldCheck } from 'lucide-react'
import type { Language, Mode, ProductRecord, TimelineEvent } from '../data/types'
import { getTimelineEvents } from '../lib/dashboard'
import { copy } from '../ui/copy'

interface DualLaneTimelineProps {
  product: ProductRecord | null
  mode: Mode
  language: Language
}

function Lane({ lane, events, language, noRecord }: { lane: 'cra' | 'safetyGate'; events: TimelineEvent[]; language: Language; noRecord: string }) {
  const isCra = lane === 'cra'
  const title = isCra ? 'CRA' : 'Safety Gate'
  const subtitle = isCra
    ? (language === 'zh' ? '制造商报告 / 监管措施' : 'Manufacturer reports / measures')
    : (language === 'zh' ? '产品安全 / 公开措施' : 'Product safety / public measures')

  return (
    <section className={`timeline-lane timeline-lane-${lane}`} data-lane={lane}>
      <div className="timeline-lane-label">
        {isCra ? <ShieldCheck size={16} aria-hidden="true" /> : <AlertTriangle size={16} aria-hidden="true" />}
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <div className="timeline-track">
        {events.length === 0 ? (
          <div className="timeline-empty"><CircleDot size={14} aria-hidden="true" /> {noRecord}</div>
        ) : events.map((event) => (
          <div className={`timeline-event timeline-event-${event.state}${event.measure === 'recall' ? ' is-recall' : ''}`} key={event.id}>
            <span className="timeline-marker" aria-hidden="true">{event.state === 'done' ? <CircleCheck size={16} /> : <CircleDot size={16} />}</span>
            <span className="timeline-event-date">{event.date ?? '—'}</span>
            <strong>{event.label}</strong>
            {event.measure && <span className="timeline-event-measure">{event.measure}</span>}
          </div>
        ))}
      </div>
    </section>
  )
}

export default function DualLaneTimeline({ product, mode, language }: DualLaneTimelineProps) {
  const ui = copy[language]
  const events = product ? getTimelineEvents(product, mode) : []
  const emptyMessage = product ? ui.noPublicRecord : ui.selectProduct
  const craEvents = events.filter((event) => event.lane === 'cra')
  const safetyEvents = events.filter((event) => event.lane === 'safetyGate')

  return (
    <section className="timeline-panel" aria-label={language === 'zh' ? '合规与安全事件时间线' : 'Compliance and safety event timeline'}>
      <div className="panel-heading timeline-heading">
        <div>
          <span className="section-kicker">{language === 'zh' ? '选中产品' : 'Selected product'}</span>
          <h2>{product ? `${product.brand} · ${product.model}` : ui.selectProduct}</h2>
        </div>
        <span className="timeline-heading-note"><CalendarDays size={14} aria-hidden="true" /> {language === 'zh' ? '事件日期' : 'Event dates'}</span>
      </div>
      <div className="timeline-body">
        {(mode === 'overview' || mode === 'cra') && <Lane lane="cra" events={craEvents} language={language} noRecord={emptyMessage} />}
        {(mode === 'overview' || mode === 'safety') && <Lane lane="safetyGate" events={safetyEvents} language={language} noRecord={emptyMessage} />}
      </div>
    </section>
  )
}
