import { useState } from 'react'

const ICONS = { call: '📞', email: '📧', meeting: '🤝', task: '✅', note: '📝', whatsapp: '💬' }
const TYPES = ['all', 'call', 'email', 'meeting', 'task', 'whatsapp', 'note']

export default function Activities({ crm }) {
  const { activities, deals, toggleActivity, addActivity } = crm
  const [filter, setFilter] = useState('all')
  const [showDone, setShowDone] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  const now = new Date()
  const filtered = activities
    .filter(a => filter === 'all' || a.type === filter)
    .filter(a => showDone || !a.done)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1
      return new Date(a.due_date || '2099') - new Date(b.due_date || '2099')
    })

  const overdue = activities.filter(a => !a.done && a.due_date && new Date(a.due_date) < now)
  const todayCount = activities.filter(a => !a.done && a.due_date && new Date(a.due_date).toDateString() === now.toDateString()).length

  function handleAdd(e) {
    e.preventDefault()
    const fd = new FormData(e.target)
    addActivity({
      deal_id: Number(fd.get('deal_id')) || null,
      type: fd.get('type') || 'task',
      title: fd.get('title'),
      due_date: fd.get('due_date') ? new Date(fd.get('due_date')).toISOString() : null,
      done: false,
    })
    setShowAdd(false)
  }

  return (
    <div>
      {/* Summary cards */}
      <div style={S.summary}>
        <div style={S.summaryCard}>
          <div style={S.summaryNum}>{overdue.length}</div>
          <div style={S.summaryLabel}>Vencidas</div>
        </div>
        <div style={S.summaryCard}>
          <div style={S.summaryNum}>{todayCount}</div>
          <div style={S.summaryLabel}>Hoy</div>
        </div>
        <div style={S.summaryCard}>
          <div style={S.summaryNum}>{activities.filter(a => !a.done).length}</div>
          <div style={S.summaryLabel}>Pendientes</div>
        </div>
        <div style={S.summaryCard}>
          <div style={S.summaryNum}>{activities.filter(a => a.done).length}</div>
          <div style={S.summaryLabel}>Completadas</div>
        </div>
      </div>

      {/* Filters */}
      <div style={S.filters}>
        <div style={S.typeTabs}>
          {TYPES.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{ ...S.typeTab, ...(filter === t ? S.typeTabActive : {}) }}>
              {t === 'all' ? 'Todas' : `${ICONS[t] || ''} ${t}`}
            </button>
          ))}
        </div>
        <label style={S.toggle}>
          <input type="checkbox" checked={showDone} onChange={e => setShowDone(e.target.checked)} />
          Mostrar completadas
        </label>
        <button onClick={() => setShowAdd(p => !p)} style={S.addBtn}>+ Nueva actividad</button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} style={S.addForm}>
          <input name="title" placeholder="Título" required style={S.input} autoFocus />
          <select name="type" style={S.input}>
            <option value="call">📞 Llamada</option>
            <option value="email">📧 Email</option>
            <option value="meeting">🤝 Reunión</option>
            <option value="task">✅ Tarea</option>
            <option value="whatsapp">💬 WhatsApp</option>
            <option value="note">📝 Nota</option>
          </select>
          <select name="deal_id" style={S.input}>
            <option value="">Sin oportunidad</option>
            {deals.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
          </select>
          <input name="due_date" type="datetime-local" style={S.input} />
          <div style={S.formBtns}>
            <button type="submit" style={S.btnPrimary}>Crear</button>
            <button type="button" onClick={() => setShowAdd(false)} style={S.btnGhost}>Cancelar</button>
          </div>
        </form>
      )}

      {/* List */}
      <div style={S.list}>
        {filtered.map(a => {
          const deal = deals.find(d => d.id === a.deal_id)
          const isOverdue = !a.done && a.due_date && new Date(a.due_date) < now
          return (
            <div key={a.id} style={{ ...S.row, ...(isOverdue ? S.rowOverdue : {}), opacity: a.done ? 0.5 : 1 }}>
              <button onClick={() => toggleActivity(a.id)} style={S.check}>
                {a.done ? '☑' : '☐'}
              </button>
              <span style={S.icon}>{ICONS[a.type] || '📌'}</span>
              <div style={S.rowBody}>
                <div style={{ fontWeight: 600, textDecoration: a.done ? 'line-through' : 'none' }}>{a.title}</div>
                {deal && <div style={S.dealName}>{deal.title}</div>}
              </div>
              {a.due_date && (
                <span style={{ ...S.date, color: isOverdue ? '#dc2626' : '#64748b' }}>
                  {new Date(a.due_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && <div style={S.empty}>No hay actividades</div>}
      </div>
    </div>
  )
}

const S = {
  summary: { display: 'flex', gap: 16, marginBottom: 20 },
  summaryCard: { flex: 1, background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', textAlign: 'center' },
  summaryNum: { fontSize: 28, fontWeight: 700, color: '#1e293b' },
  summaryLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  filters: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  typeTabs: { display: 'flex', gap: 4 },
  typeTab: {
    padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 500,
  },
  typeTabActive: { background: '#6366f1', color: '#fff', borderColor: '#6366f1' },
  toggle: { fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' },
  addBtn: {
    marginLeft: 'auto', padding: '8px 16px', borderRadius: 8,
    border: 'none', background: '#6366f1', color: '#fff',
    fontWeight: 600, fontSize: 13, cursor: 'pointer',
  },
  addForm: {
    display: 'flex', gap: 8, marginBottom: 16, background: '#fff',
    padding: 16, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexWrap: 'wrap',
  },
  input: { padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' },
  formBtns: { display: 'flex', gap: 6 },
  btnPrimary: { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 },
  btnGhost: { padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 13 },
  list: { display: 'flex', flexDirection: 'column', gap: 6 },
  row: {
    display: 'flex', alignItems: 'center', gap: 12, padding: 14,
    background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'all 0.1s',
  },
  rowOverdue: { borderLeft: '3px solid #dc2626' },
  check: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 0 },
  icon: { fontSize: 18 },
  rowBody: { flex: 1 },
  dealName: { fontSize: 12, color: '#94a3b8' },
  date: { fontSize: 12, whiteSpace: 'nowrap' },
  empty: { padding: 40, textAlign: 'center', color: '#94a3b8' },
}
