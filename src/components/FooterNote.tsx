import React from 'react'
import type { Language } from '../data/types'
import { copy } from '../ui/copy'

interface FooterNoteProps {
  language: Language
  dataAsOf: string
}

export default function FooterNote({ language, dataAsOf }: FooterNoteProps) {
  const ui = copy[language]
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <span>CRA / GPSR · {language === 'zh' ? '共用产品看板' : 'Shared Product Board'}</span>
        <span>{ui.researchNote}</span>
        <span>{ui.dataAsOf}: {dataAsOf}</span>
      </div>
    </footer>
  )
}
