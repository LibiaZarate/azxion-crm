import { useState } from 'react'

export default function Contacts({ crm }) {
  const { contacts, companies, deals, stages } = crm
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase()
    if (!q) return true
    const name = `${c.first_name} ${c.last_name || ''}`.toLowerCase()
    const company = companies.find(co => co.id === c.company_id)?.name || ''
    return name.includes(q) || company.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q)
  })

  const detail = selected ? contacts.find(c => c.id === selected) : null
  const detailCompany = detail ? companies.find(co => co.id === detail.company_id) : null
  const detailDeals = detail
    ? deals.filter(d => d.contact_name === `${detail.first_name} ${detail.last_name || ''}`.trim())
    : []

  return (
    <div>
      <div style={S.filters}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar contacto, empresa o email..." style={S.search} />
        <span style={S.count}>{filtered.length} contactos</span>
      </div>

      <div style={S.layout}>
        <div style={S.grid}>
          {filtered.map(c => {
            const company = companies.find(co => co.id === c.company_id)
            return (
              <div key={c.id} onClick={() => setSelected(c.id === selected ? null : c.id)} style={{ ...S.card, ...(selected === c.id ? S.cardSelected : {}) }}>
                <div style={S.avatar}>{(c.first_name || '?')[0]}</div>
                <div style={S.cardBody}>
                  <div style={S.name}>{c.first_name} {c.last_name}</div>
                  {c.position && <div style={S.position}>{c.position}</div>}
                  {company && <div style={S.company}>{company.name}</div>}
                </div>
                <div style={S.cardRight}>
                  {c.email && <div style={S.email}>{c.email}</div>}
                  {c.phone && <div style={S.phone}>{c.phone}</div>}
                </div>
              </div>
            )
          })}
        </div>

        {detail && (
          <div style={S.detail}>
            <div style={S.detailHeader}>
              <div style={S.detailAvatar}>{(detail.first_name || '?')[0]}</div>
              <div>
                <h2 style={S.detailName}>{detail.first_name} {detail.last_name}</h2>
                {detail.position && <div style={S.detailPos}>{detail.position}</div>}
              </div>
              <button onClick={() => setSelected(null)} style={S.closeBtn}>✕</button>
            </div>

            <div style={S.detailSection}>
              <h3 style={S.sectionTitle}>Información</h3>
              <div style={S.detailGrid}>
                <div style={S.label}>Email</div><div>{detail.email || '—'}</div>
                <div style={S.label}>Teléfono</div><div>{detail.phone || '—'}</div>
                <div style={S.label}>Empresa</div><div>{detailCompany?.name || '—'}</div>
                {detailCompany && <>
                  <div style={S.label}>Industria</div><div>{detailCompany.industry || '—'}</div>
                  <div style={S.label}>Ciudad</div><div>{detailCompany.city}, {detailCompany.state}</div>
                </>}
              </div>
            </div>

            {detailDeals.length > 0 && (
              <div style={S.detailSection}>
                <h3 style={S.sectionTitle}>Oportunidades ({detailDeals.length})</h3>
                {detailDeals.map(d => {
                  const st = stages.find(s => s.id === d.stage_id)
                  return (
                    <div key={d.id} style={S.dealRow}>
                      <span style={{ ...S.badge, background: st?.color + '20', color: st?.color }}>{st?.name}</span>
                      <span style={{ flex: 1, fontWeight: 500 }}>{d.title}</span>
                      <span style={{ fontWeight: 700, color: '#059669' }}>${fmt(d.amount)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function fmt(n) { return new Intl.NumberFormat('es-MX').format(Math.round(n)) }

const S = {
  filters: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  search: { flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' },
  count: { fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' },
  layout: { display: 'flex', gap: 20 },
  grid: { flex: 1, display: 'flex', flexDirection: 'column', gap: 8 },
  card: {
    display: 'flex', alignItems: 'center', gap: 14, padding: 16,
    background: '#fff', borderRadius: 12, cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.15s',
  },
  cardSelected: { background: '#f1f5f9', boxShadow: '0 0 0 2px #6366f1' },
  avatar: {
    width: 40, height: 40, borderRadius: '50%', background: '#6366f1',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 16, flexShrink: 0,
  },
  cardBody: { flex: 1 },
  name: { fontWeight: 600, fontSize: 14 },
  position: { fontSize: 12, color: '#64748b' },
  company: { fontSize: 12, color: '#94a3b8' },
  cardRight: { textAlign: 'right', fontSize: 12, color: '#64748b' },
  email: {},
  phone: { marginTop: 2 },
  detail: { width: 360, background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexShrink: 0 },
  detailHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 },
  detailAvatar: {
    width: 56, height: 56, borderRadius: '50%', background: '#6366f1',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 24, flexShrink: 0,
  },
  detailName: { margin: 0, fontSize: 18, fontWeight: 700 },
  detailPos: { fontSize: 13, color: '#64748b' },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8', marginLeft: 'auto' },
  detailSection: { marginTop: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#1e293b' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', fontSize: 14 },
  label: { color: '#64748b', fontWeight: 500 },
  dealRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 },
  badge: { padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
}
