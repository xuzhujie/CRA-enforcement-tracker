import React from 'react'
import type { MetricTone, ModeMetric } from '../data/types'

interface MetricStripItem extends Omit<ModeMetric, 'label'> {
  label: string
  metricKey?: string
}

interface MetricStripProps {
  items: MetricStripItem[]
}

const toneIcons: Record<MetricTone, string> = {
  blue: '◈',
  amber: '△',
  red: '↻',
  green: '✓',
}

export default function MetricStrip({ items }: MetricStripProps) {
  return (
    <div className="metric-strip" aria-label="Dashboard metrics">
      {items.map((item) => (
        <div className={`metric-cell metric-${item.tone}`} data-metric={item.metricKey ?? item.label} key={item.metricKey ?? item.label}>
          <div className="metric-cell-label">
            <span>{item.label}</span>
            <span className="metric-icon" aria-hidden="true">{toneIcons[item.tone]}</span>
          </div>
          <strong className="metric-cell-value">{item.value}</strong>
          <span className="metric-cell-note">{item.note}</span>
        </div>
      ))}
    </div>
  )
}
