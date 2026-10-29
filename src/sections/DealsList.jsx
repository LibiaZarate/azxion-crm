import { useState } from 'react'

export default function DealsList({ crm }) {
  const { deals, stages, activities, timeline } = crm
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [selected, setSelected] = useState(null)

  const filtered = deals
    .filter(d => filterStage === 'all' || d.stage_id === Number(filterStage))
    .filter(d => {
      const q = search.toLowerCase()
      return !q || d.title.toLowerCase().includes(q) || (d.company_name || '').toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sortBy === 'amount') return (b.amount || 0) - (a.amount || 0)
      if (sortBy === 'expected_close') return new Date(a.expected_close || '2099') - new Date(b.expected_close || '2099')
      return new Date(b.created_at) - new Date(a.created_at)
    })

  const detail = selected ? deals.find(d => d.id === selected) : null
  const detailStage = detail ? stages.find(s => s.id === detail.stage_id) : null
  const detailActivities = detail ? activities.filter(a => a.deal_id === detail.id) : []
  const detailTimeline = detail ? timeline.filter(t => t.deal_id === detail.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : []

  return (
    <div style={S.wrap}>
      {/* Filters */}
      <div style={S.filters}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por título o empresa..."
          style={S.search}
        />
        <select value={filterStage} onChange={e => setFilterStage(e.target.value)} style={S.select}>
          <option value="all">Todas las etapas</option>
          {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={S.select}>
          <option value="created_at">Más recientes</option>
          <option value="amount">Mayor monto</option>
          <option value="expected_close">Cierre próximo</option>
        </select>
      </div>

      <div style={S.layout}>
        {/* Table */}
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Oportunidad</th>
                <th style={S.th}>Empresa</th>
                <th style={S.th}>Etapa</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Monto</th>
                <th style={S.th}>Score</th>
                <th style={S.th}>Prob.</th>
                <th style={S.th}>Cierre</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const st = stages.find(s => s.id === d.stage_id)
                return (
                  <tr
                    key={d.id}
                    onClick={() => setSelected(d.id === selected ? null : d.id)}
                    style={{ ...S.tr, ...(selected === d.id ? S.trSelected : {}) }}
                  >
                    <td style={S.td}>
                      <div style={S.dealTitle}>{d.title}</div>
                      {d.contact_name && <div style={S.dealSub}>{d.contact_name}</div>}
                    </td>
                    <td style={S.td}>{d.company_name || '—'}</td>
                    <td style={S.td}>
                      <span style={{ ...S.badge, background: st?.color + '20', color: st?.color }}>
                        {st?.name}
                      </span>
                    </td>
                    <td style={{ ...S.td, textAlign: 'right', fontWeight: 600 }}>${fmt(d.amount)}</td>
                    <td style={S.td}>
                      {d.score != null && (
                        <span style={{ background: d.score >= 70 ? '#dcfce7' : d.score >= 40 ? '#fef9c3' : '#fef2f2', color: d.score >= 70 ? '#16a34a' : d.score >= 40 ? '#ca8a04' : '#dc2626', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{d.score}</span>
                      )}
                    </td>
                    <td style={S.td}>{d.probability}%</td>
                    <td style={S.td}>{d.expected_close ? new Date(d.expected_close).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={S.empty}>No hay oportunidades que coincidan</div>}
        </div>

        {/* Detail panel */}
        {detail && (
          <div style={S.detail}>
            <div style={S.detailHeader}>
              <h2 style={S.detailTitle}>{detail.title}</h2>
              <button onClick={() => setSelected(null)} style={S.closeBtn}>✕</button>
            </div>
            <div style={S.detailGrid}>
              <div style={S.detailLabel}>Empresa</div>
              <div>{detail.company_name || '—'}</div>
              <div style={S.detailLabel}>Contacto</div>
              <div>{detail.contact_name || '—'}</div>
              <div style={S.detailLabel}>Etapa</div>
              <div><span style={{ ...S.badge, background: detailStage?.color + '20', color: detailStage?.color }}>{detailStage?.name}</span></div>
              <div style={S.detailLabel}>Monto</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>${fmt(detail.amount)} {detail.currency}</div>
              <div style={S.detailLabel}>Probabilidad</div>
              <div>{detail.probability}%</div>
              <div style={S.detailLabel}>Cierre esperado</div>
              <div>{detail.expected_close || '—'}</div>
              <div style={S.detailLabel}>Fuente</div>
              <div>{detail.source || '—'}</div>
            </div>
            {detail.tags?.length > 0 && (
              <div style={S.detailTags}>
                {detail.tags.map(t => <span key={t} style={S.tag}>{t}</span>)}
              </div>
            )}
            {detail.score != null && (
              <div style={{ marginTop: 16 }}>
                <div style={S.detailLabel}>Lead Score</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${detail.score}%`, height: '100%', borderRadius: 4, background: detail.score >= 70 ? '#16a34a' : detail.score >= 40 ? '#f59e0b' : '#dc2626' }} />
                  </div>
                  <span style={{ fontWeight: 700, color: detail.score >= 70 ? '#16a34a' : detail.score >= 40 ? '#f59e0b' : '#dc2626' }}>{detail.score}</span>
                </div>
              </div>
            )}
            {detailActivities.length > 0 && (
              <div style={S.detailSection}>
                <h3 style={S.detailSectionTitle}>Actividades</h3>
                {detailActivities.map(a => (
                  <div key={a.id} style={S.actRow}>
                    <span style={{ ...S.actIcon, opacity: a.done ? 0.5 : 1 }}>{ICONS[a.type] || '📌'}</span>
                    <span style={{ flex: 1, textDecoration: a.done ? 'line-through' : 'none', opacity: a.done ? 0.5 : 1 }}>{a.title}</span>
                    {a.due_date && <span style={S.actDate}>{new Date(a.due_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                ))}
              </div>
            )}
            {detailTimeline.length > 0 && (
              <div style={S.detailSection}>
                <h3 style={S.detailSectionTitle}>Timeline</h3>
                {detailTimeline.map(t => (
                  <div key={t.id} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #f8fafc', fontSize: 13 }}>
                    <span>{TL_ICONS[t.type] || '📌'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#475569', lineHeight: 1.4 }}>{t.content}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{t.author} · {new Date(t.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const ICONS = { call: '📞', email: '📧', meeting: '🤝', task: '✅', note: '📝', whatsapp: '💬' }
const TL_ICONS = { note: '📝', stage_change: '🔄', whatsapp: '💬', call: '📞', email: '📧', system: '⚙️' }

function fmt(n) { return new Intl.NumberFormat('es-MX').format(Math.round(n)) }

const S = {
  wrap: {},
  filters: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  search: {
    flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10,
    border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
  },
  select: {
    padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0',
    fontSize: 14, background: '#fff', outline: 'none',
  },
  layout: { display: 'flex', gap: 20 },
  tableWrap: { flex: 1, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' },
  tr: { cursor: 'pointer', transition: 'background 0.1s' },
  trSelected: { background: '#f1f5f9' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14, verticalAlign: 'middle' },
  dealTitle: { fontWeight: 600 },
  dealSub: { fontSize: 12, color: '#94a3b8' },
  badge: { padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  empty: { padding: 40, textAlign: 'center', color: '#94a3b8' },
  detail: { width: 340, background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexShrink: 0 },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 },
  detailTitle: { fontSize: 18, fontWeight: 700, margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', fontSize: 14 },
  detailLabel: { color: '#64748b', fontWeight: 500 },
  detailTags: { display: 'flex', gap: 4, marginTop: 16, flexWrap: 'wrap' },
  tag: { background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 },
  detailSection: { marginTop: 20 },
  detailSectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: 8 },
  actRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13 },
  actIcon: { fontSize: 16 },
  actDate: { fontSize: 12, color: '#94a3b8' },
}
