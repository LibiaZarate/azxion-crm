import { useState } from 'react'

const DEMO_QUOTES = [
  { id: 1, number: 'COT-0001', deal_title: 'E-commerce premium', contact_name: 'Lina Morales', status: 'sent', total: 95000, valid_until: '2026-11-15', created_at: '2026-10-20' },
  { id: 2, number: 'COT-0002', deal_title: 'CRM personalizado', contact_name: 'Roberto Paz', status: 'draft', total: 200000, valid_until: '2026-12-01', created_at: '2026-10-25' },
  { id: 3, number: 'COT-0003', deal_title: 'Automatización WhatsApp', contact_name: 'Dr. Méndez', status: 'accepted', total: 35000, valid_until: '2026-10-30', created_at: '2026-10-10' },
]

const STATUS_COLORS = {
  draft: { bg: '#f1f5f9', color: '#64748b', label: 'Borrador' },
  sent: { bg: '#dbeafe', color: '#2563eb', label: 'Enviada' },
  accepted: { bg: '#dcfce7', color: '#16a34a', label: 'Aceptada' },
  rejected: { bg: '#fef2f2', color: '#dc2626', label: 'Rechazada' },
}

export default function Quotes() {
  const [quotes] = useState(DEMO_QUOTES)
  const [selected, setSelected] = useState(null)

  const detail = selected ? quotes.find(q => q.id === selected) : null
  const totalAccepted = quotes.filter(q => q.status === 'accepted').reduce((s, q) => s + q.total, 0)
  const totalPending = quotes.filter(q => q.status === 'sent').reduce((s, q) => s + q.total, 0)

  return (
    <div>
      <div style={S.summary}>
        <div style={S.summaryCard}>
          <div style={S.summaryNum}>{quotes.length}</div>
          <div style={S.summaryLabel}>Total</div>
        </div>
        <div style={S.summaryCard}>
          <div style={{ ...S.summaryNum, color: '#2563eb' }}>${fmt(totalPending)}</div>
          <div style={S.summaryLabel}>Pendientes</div>
        </div>
        <div style={S.summaryCard}>
          <div style={{ ...S.summaryNum, color: '#16a34a' }}>${fmt(totalAccepted)}</div>
          <div style={S.summaryLabel}>Aceptadas</div>
        </div>
      </div>

      <div style={S.layout}>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Número</th>
                <th style={S.th}>Oportunidad</th>
                <th style={S.th}>Contacto</th>
                <th style={S.th}>Estado</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Total</th>
                <th style={S.th}>Válida hasta</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => {
                const st = STATUS_COLORS[q.status] || STATUS_COLORS.draft
                return (
                  <tr key={q.id} onClick={() => setSelected(q.id === selected ? null : q.id)} style={{ ...S.tr, ...(selected === q.id ? S.trSel : {}) }}>
                    <td style={S.td}><span style={S.qNum}>{q.number}</span></td>
                    <td style={S.td}>{q.deal_title}</td>
                    <td style={S.td}>{q.contact_name}</td>
                    <td style={S.td}><span style={{ ...S.badge, background: st.bg, color: st.color }}>{st.label}</span></td>
                    <td style={{ ...S.td, textAlign: 'right', fontWeight: 700 }}>${fmt(q.total)}</td>
                    <td style={S.td}>{q.valid_until}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {detail && (
          <div style={S.detail}>
            <div style={S.detailHeader}>
              <h2 style={S.detailTitle}>{detail.number}</h2>
              <button onClick={() => setSelected(null)} style={S.closeBtn}>✕</button>
            </div>
            <div style={S.detailGrid}>
              <div style={S.label}>Oportunidad</div><div>{detail.deal_title}</div>
              <div style={S.label}>Contacto</div><div>{detail.contact_name}</div>
              <div style={S.label}>Estado</div>
              <div><span style={{ ...S.badge, background: STATUS_COLORS[detail.status].bg, color: STATUS_COLORS[detail.status].color }}>{STATUS_COLORS[detail.status].label}</span></div>
              <div style={S.label}>Total</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>${fmt(detail.total)} MXN</div>
              <div style={S.label}>Válida hasta</div><div>{detail.valid_until}</div>
              <div style={S.label}>Creada</div><div>{detail.created_at}</div>
            </div>
            <div style={S.actions}>
              <button style={S.btnPrimary}>📧 Enviar</button>
              <button style={S.btnGhost}>📄 PDF</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function fmt(n) { return new Intl.NumberFormat('es-MX').format(Math.round(n)) }

const S = {
  summary: { display: 'flex', gap: 16, marginBottom: 20 },
  summaryCard: { flex: 1, background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', textAlign: 'center' },
  summaryNum: { fontSize: 28, fontWeight: 700, color: '#1e293b' },
  summaryLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  layout: { display: 'flex', gap: 20 },
  tableWrap: { flex: 1, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' },
  tr: { cursor: 'pointer', transition: 'background 0.1s' },
  trSel: { background: '#f1f5f9' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 },
  qNum: { fontWeight: 700, color: '#6366f1' },
  badge: { padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  detail: { width: 360, background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexShrink: 0 },
  detailHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 16 },
  detailTitle: { margin: 0, fontSize: 20, fontWeight: 700, color: '#6366f1' },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 16px', fontSize: 14 },
  label: { color: '#64748b', fontWeight: 500 },
  actions: { display: 'flex', gap: 8, marginTop: 20 },
  btnPrimary: { flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 },
  btnGhost: { flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 13 },
}
