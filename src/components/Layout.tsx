import React, { type ReactNode } from 'react'
import { Navbar } from './Navbar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <div className="app-content">{children}</div>
      </main>
      <footer className="app-footer">
        <span>Aker BP Offshore Access Control Management</span>
        <span className="footer-version">v1.0.0 — Internal Use Only</span>
      </footer>
    </div>
  )
}
