import { ListFilter, Search, X } from 'lucide-react'
import type { Language, ProductFilters } from '../data/types'
import { copy } from '../ui/copy'

export interface FilterOptions {
  brands: string[]
  models: string[]
  markets: string[]
  productTypes: string[]
}

interface FilterBarProps {
  filters: ProductFilters
  options: FilterOptions
  language: Language
  onChange: (next: ProductFilters) => void
  onClear: () => void
}

function SelectFilter({
  label,
  value,
  options,
  allLabel,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  allLabel: string
  onChange: (value: string) => void
}) {
  return (
    <label className="filter-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{allLabel}</option>
        {options.map((option) => <option value={option} key={option}>{option}</option>)}
      </select>
    </label>
  )
}

export default function FilterBar({ filters, options, language, onChange, onClear }: FilterBarProps) {
  const ui = copy[language]
  const hasFilters = Object.values(filters).some(Boolean)

  const update = (key: keyof ProductFilters, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <section className="filter-bar" aria-label={ui.filters}>
      <div className="filter-heading"><ListFilter size={15} aria-hidden="true" /><span>{ui.filters}</span></div>
      <SelectFilter label="Brand" value={filters.brand} options={options.brands} allLabel={ui.allBrands} onChange={(value) => update('brand', value)} />
      <SelectFilter label="Model" value={filters.model} options={options.models} allLabel={ui.allModels} onChange={(value) => update('model', value)} />
      <SelectFilter label="Market" value={filters.market} options={options.markets} allLabel={ui.allMarkets} onChange={(value) => update('market', value)} />
      <SelectFilter label="Product type" value={filters.productType} options={options.productTypes} allLabel={ui.allProductTypes} onChange={(value) => update('productType', value)} />
      <label className="filter-search">
        <Search size={15} aria-hidden="true" />
        <span className="sr-only">{ui.searchPlaceholder}</span>
        <input value={filters.search} placeholder={ui.searchPlaceholder} onChange={(event) => update('search', event.target.value)} />
      </label>
      {hasFilters && (
        <button type="button" className="clear-filters" onClick={onClear}>
          <X size={14} aria-hidden="true" /> {ui.clearFilters}
        </button>
      )}
    </section>
  )
}
