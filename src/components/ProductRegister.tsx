import React from 'react'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import type { Language, Mode, ProductRecord } from '../data/types'
import { copy } from '../ui/copy'
import ProductRow from './ProductRow'

interface ProductRegisterProps {
  products: ProductRecord[]
  mode: Mode
  selectedProductId: string
  language: Language
  onSelect: (productId: string) => void
}

export default function ProductRegister({ products, mode, selectedProductId, language, onSelect }: ProductRegisterProps) {
  const ui = copy[language]
  const showCra = mode === 'overview' || mode === 'cra'
  const showSafety = mode === 'overview' || mode === 'safety'

  return (
    <section className="register-panel" aria-label={ui.overview}>
      <div className="panel-heading">
        <div>
          <span className="section-kicker">{ui.dataLabel}</span>
          <h2>{ui.overview}</h2>
        </div>
        <span className="panel-count">{products.length} {language === 'zh' ? '条产品' : 'products'}</span>
      </div>
      {products.length === 0 ? (
        <div className="empty-register">{ui.empty}</div>
      ) : (
        <div className="table-scroll">
          <table className="product-table">
            <thead>
              <tr className="table-group-row">
                <th colSpan={4} scope="colgroup">{ui.sharedProduct}</th>
                {showCra && <th data-track-column="cra" colSpan={1} scope="colgroup" className="group-cra">CRA · {language === 'zh' ? '制造商报告 / 监管措施 / 整改期限' : 'reporting / measures / remediation'}</th>}
                {showSafety && <th data-track-column="safetyGate" colSpan={1} scope="colgroup" className="group-safety">GPSR / Safety Gate · {language === 'zh' ? '警报 / 下架撤回 / 召回' : 'alerts / withdrawal / recalls'}</th>}
              </tr>
              <tr className="table-column-row">
                <th scope="col">#</th>
                <th scope="col">Brand</th>
                <th scope="col">Model</th>
                <th scope="col">Market</th>
                {showCra && <th data-track-column="cra" scope="col" className="track-heading-cra">{language === 'zh' ? 'CRA 状态' : 'CRA status'} <ChevronDown size={13} aria-hidden="true" /></th>}
                {showSafety && <th data-track-column="safetyGate" scope="col" className="track-heading-safety">{language === 'zh' ? 'Safety Gate 状态' : 'Safety Gate status'} <ChevronDown size={13} aria-hidden="true" /></th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <ProductRow key={product.id} product={product} index={index} mode={mode} selected={product.id === selectedProductId} language={language} onSelect={onSelect} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="register-footnote"><ArrowUpRight size={13} aria-hidden="true" /> {language === 'zh' ? '点击产品行查看独立证据与时间线' : 'Select a product row to view independent evidence and timelines'}</div>
    </section>
  )
}
