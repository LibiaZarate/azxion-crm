import { useState } from 'react'
import { useCRM } from './hooks/useCRM.js'
import Pipeline from './sections/Pipeline.jsx'
import DealsList from './sections/DealsList.jsx'
import Contacts from './sections/Contacts.jsx'
import Activities from './sections/Activities.jsx'
import Dashboard from './sections/Dashboard.jsx'
import Quotes from './sections/Quotes.jsx'

const NAV = [
  { id: 'pipeline',   label: 'Pipeline',     icon: '⬜' },
  { id: 'deals',      label: 'Oportunidades',icon: '💰' },
  { id: 'contacts',   label: 'Contactos',    icon: '👥' },
  { id: 'activities', label: 'Actividades',  icon: '📋' },
  { id: 'quotes',     label: 'Cotizaciones', icon: '📄' },
  { id: 'dashboard',  label: 'Dashboard',    icon: '📊' },
]

export default function App() {
  const [section, setSection] = useState('pipeline')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const crm = useCRM()

  const Section = {
    pipeline: Pipeline,
    deals: DealsList,
    contacts: Contacts,
    activities: Activities,
    quotes: Quotes,
    dashboard: Dashboard,
  }[section] || Pipeline

  return (
    <div style={S.root}>
      {/* Sidebar */}
      <aside style={{ ...S.sidebar, width: sidebarOpen ? 240 : 60 }}>
        <div style={S.logo} onClick={() => setSidebarOpen(p => !p)}>
          <span style={S.logoIcon}>◆</span>
          {sidebarOpen && <span style={S.logoText}>AZXION CRM</span>}
        </div>
        <nav style={S.nav}>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              style={{
                ...S.navBtn,
                ...(section === n.id ? S.navBtnActive : {}),
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
              }}
            >
              <span style={S.navIcon}>{n.icon}</span>
              {sidebarOpen && <span>{n.label}</span>}
            </button>
          ))}
        </nav>
        {sidebarOpen && (
          <div style={S.sidebarFooter}>
            {crm.demoMode && <span style={S.demoBadge}>DEMO</span>}
            <span style={S.version}>v0.1.0</span>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main style={{ ...S.main, marginLeft: sidebarOpen ? 240 : 60 }}>
        <header style={S.header}>
          <h1 style={S.headerTitle}>{NAV.find(n => n.id === section)?.label}</h1>
          <div style={S.headerRight}>
            <span style={S.statPill}>{crm.stats.open.length} abiertas</span>
            <span style={S.statPill}>${fmt(crm.stats.pipelineValue)}</span>
            {crm.stats.overdueActivities.length > 0 && (
              <span style={{ ...S.statPill, background: '#fef2f2', color: '#dc2626' }}>
                {crm.stats.overdueActivities.length} vencidas
              </span>
            )}
          </div>
        </header>
        <div style={S.content}>
          <Section crm={crm} />
        </div>
      </main>
    </div>
  )
}

function fmt(n) {
  return new Intl.NumberFormat('es-MX').format(Math.round(n))
}

const S = {
  root: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f8fafc',
    minHeight: '100vh',
    color: '#1e293b',
    fontSize: 14,
  },
  sidebar: {
    position: 'fixed', top: 0, left: 0, bottom: 0,
    background: '#0f172a',
    color: '#e2e8f0',
    display: 'flex', flexDirection: 'column',
    transition: 'width 0.2s',
    zIndex: 50,
    overflow: 'hidden',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '20px 16px', cursor: 'pointer',
    borderBottom: '1px solid #1e293b',
  },
  logoIcon: { fontSize: 24, color: '#818cf8' },
  logoText: { fontWeight: 700, fontSize: 16, letterSpacing: 1 },
  nav: {
    flex: 1, display: 'flex', flexDirection: 'column',
    gap: 2, padding: '12px 8px',
  },
  navBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', border: 'none', borderRadius: 8,
    background: 'transparent', color: '#94a3b8',
    cursor: 'pointer', fontSize: 14, textAlign: 'left',
    transition: 'all 0.15s',
  },
  navBtnActive: {
    background: '#1e293b', color: '#e2e8f0', fontWeight: 600,
  },
  navIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  sidebarFooter: {
    padding: '12px 16px', borderTop: '1px solid #1e293b',
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
  },
  demoBadge: {
    background: '#fbbf24', color: '#1e293b', padding: '2px 8px',
    borderRadius: 4, fontWeight: 700, fontSize: 10,
  },
  version: { color: '#475569' },
  main: {
    transition: 'margin-left 0.2s',
    minHeight: '100vh',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px',
    background: '#fff', borderBottom: '1px solid #e2e8f0',
    position: 'sticky', top: 0, zIndex: 40,
  },
  headerTitle: { fontSize: 20, fontWeight: 700, margin: 0 },
  headerRight: { display: 'flex', gap: 8 },
  statPill: {
    background: '#f1f5f9', padding: '4px 12px', borderRadius: 20,
    fontSize: 13, fontWeight: 500, color: '#475569',
  },
  content: { padding: 24 },
}
