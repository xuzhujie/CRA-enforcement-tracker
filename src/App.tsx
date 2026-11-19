import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Globe2, Info, ShieldCheck } from 'lucide-react'
import { AS_OF_DATE, DATA_AS_OF_DATE, products } from './data/products'
import { officialSources } from './data/sources'
import type { Language, Mode, ProductFilters } from './data/types'
import { filterProducts, getDashboardMetrics, getModeMetrics, getUniqueFilterValues } from './lib/dashboard'
import FilterBar from './components/FilterBar'
import MetricStrip from './components/MetricStrip'
import ProductDetailRail from './components/ProductDetailRail'
import ProductRegister from './components/ProductRegister'
import DualLaneTimeline from './components/DualLaneTimeline'
import SourceRail from './components/SourceRail'
import FooterNote from './components/FooterNote'
import { copy } from './ui/copy'

const MODE_KEYS: Mode[] = ['overview', 'cra', 'safety']

const emptyFilters: ProductFilters = {
  brand: '',
  model: '',
  market: '',
  productType: '',
  search: '',
}

function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'zh'
  return window.localStorage.getItem('cra-gpsr-language') === 'en' ? 'en' : 'zh'
}

export default function App() {
  const [mode, setMode] = useState<Mode>('overview')
  const [language, setLanguage] = useState<Language>(getStoredLanguage)
  const [filters, setFilters] = useState<ProductFilters>(emptyFilters)
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? '')
  const [detailOpen, setDetailOpen] = useState(true)
  const activeCopy = copy[language]

  const filterOptions = useMemo(() => getUniqueFilterValues(products), [])
  const filteredProducts = useMemo(() => filterProducts(products, filters), [filters])
  const metrics = useMemo(() => getDashboardMetrics(filteredProducts, AS_OF_DATE), [filteredProducts])
  const modeMetrics = useMemo(() => getModeMetrics(metrics, mode), [metrics, mode])
  const selectedProduct = filteredProducts.find((product) => product.id === selectedProductId) ?? null

  useEffect(() => {
    if (filteredProducts.length > 0 && !filteredProducts.some((product) => product.id === selectedProductId)) {
      setSelectedProductId(filteredProducts[0].id)
    }
    if (filteredProducts.length === 0) setSelectedProductId('')
  }, [filteredProducts, selectedProductId])

  useEffect(() => {
    window.localStorage.setItem('cra-gpsr-language', language)
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  }, [language])

  return (
    <div className="app-shell" data-mode={mode} data-selected-product={selectedProductId} data-detail-open={detailOpen}>
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-lockup">
            <ShieldCheck size={19} aria-hidden="true" />
            <div>
              <p className="portal-label">{activeCopy.portal}</p>
              <h1>{activeCopy.title}</h1>
            </div>
          </div>
          <div className="header-meta">
            <span>{activeCopy.lastVerified}: {AS_OF_DATE}</span>
            <span>{activeCopy.dataAsOf}: {DATA_AS_OF_DATE}</span>
            <nav className="source-links" aria-label={activeCopy.sourceLabel}>
              {officialSources.map((source) => (
                <a key={source.key} href={source.url} target="_blank" rel="noreferrer">
                  {source.label} <ExternalLink size={12} aria-hidden="true" />
                </a>
              ))}
            </nav>
            <label className="language-control">
              <Globe2 size={14} aria-hidden="true" />
              <span className="sr-only">{activeCopy.language}</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
                <option value="zh">中文（简体）</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>
        </div>
        <div className="mode-tabs" role="tablist" aria-label={activeCopy.title}>
          {MODE_KEYS.map((key, index) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              aria-pressed={mode === key}
              className={mode === key ? 'mode-tab is-active' : 'mode-tab'}
              onClick={() => setMode(key)}
            >
              {activeCopy.modes[index]}
            </button>
          ))}
        </div>
      </header>

      <main className="app-main">
        <div className="separation-notice" role="note">
          <Info size={17} aria-hidden="true" />
          <span>{activeCopy.separationNotice}</span>
        </div>
        <section className="overview-surface" aria-live="polite">
          <div>
            <span className="section-kicker">{activeCopy.dataLabel}</span>
            <h2>{activeCopy.overview}</h2>
            <p>{activeCopy.shellPlaceholder}</p>
          </div>
          <div className="overview-counts">
            <span>{filteredProducts.length} {language === 'zh' ? '条产品' : 'products'}</span>
            <span>{activeCopy.filters}: {Object.values(filters).filter(Boolean).length}</span>
          </div>
        </section>
        <MetricStrip items={modeMetrics.map((item) => ({
          ...item,
          metricKey: item.label,
          label: activeCopy.metricLabels[item.label] ?? item.label,
          note: activeCopy.metricNotes[item.label] ?? item.note,
        }))} />
        <FilterBar filters={filters} options={filterOptions} language={language} onChange={setFilters} onClear={() => setFilters(emptyFilters)} />
        <div className="workspace-grid">
          <div className="main-column">
            <ProductRegister products={filteredProducts} mode={mode} selectedProductId={selectedProductId} language={language} onSelect={(productId) => { setSelectedProductId(productId); setDetailOpen(true) }} />
            <DualLaneTimeline product={selectedProduct} mode={mode} language={language} />
          </div>
          <div className="side-column">
            <ProductDetailRail product={selectedProduct} mode={mode} language={language} open={detailOpen} onClose={() => setDetailOpen(false)} />
            <SourceRail sources={officialSources} language={language} dataAsOf={DATA_AS_OF_DATE} />
          </div>
        </div>
      </main>
      <FooterNote language={language} dataAsOf={DATA_AS_OF_DATE} />
    </div>
  )
}
