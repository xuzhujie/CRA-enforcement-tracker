import React from 'react'
import type { Language, Mode, ProductRecord } from '../data/types'
import { copy } from '../ui/copy'
import TrackStatusCell from './TrackStatusCell'

interface ProductRowProps {
  product: ProductRecord
  index: number
  mode: Mode
  selected: boolean
  language: Language
  onSelect: (productId: string) => void
}

export default function ProductRow({ product, index, mode, selected, language, onSelect }: ProductRowProps) {
  const ui = copy[language]
  const select = () => onSelect(product.id)
  const onKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      select()
    }
  }

  return (
    <tr
      className={selected ? 'product-row is-selected' : 'product-row'}
      aria-selected={selected}
      tabIndex={0}
      onClick={select}
      onKeyDown={onKeyDown}
    >
      <td className="row-index">{String(index + 1).padStart(2, '0')}</td>
      <td className="product-brand"><strong>{product.brand}</strong><span>{product.manufacturer ?? ui.notStated}</span></td>
      <td className="product-model"><strong>{product.model}</strong><span>{product.productName} · {product.productType}</span></td>
      <td className="product-market">{product.markets.join(' · ') || ui.notStated}</td>
      {(mode === 'overview' || mode === 'cra') && <td data-track-column="cra"><TrackStatusCell track="cra" record={product.cra} language={language} /></td>}
      {(mode === 'overview' || mode === 'safety') && <td data-track-column="safetyGate"><TrackStatusCell track="safetyGate" record={product.safetyGate} language={language} /></td>}
    </tr>
  )
}
