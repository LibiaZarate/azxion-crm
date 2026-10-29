import { useState, useRef } from 'react'

export default function Pipeline({ crm }) {
  const { stages, deals, moveDeal, addDeal } = crm
  const [dragId, setDragId] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [showAdd, setShowAdd] = useState(null)
  const formRef = useRef(null)

  const visibleStages = stages.filter(s => !s.is_lost).sort((a, b) => a.position - b.position)

  function handleDragStart(e, dealId) {
    setDragId(dealId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(e, stageId) {
    e.preventDefault()
    if (dragId != null) moveDeal(dragId, stageId)
    setDragId(null)
    setDragOver(null)
  }

  function handleAddDeal(stageId) {
    const form = formRef.current
    if (!form) return
    const fd = new FormData(form)
    const title = fd.get('title')?.toString().trim()
    if (!title) return
    addDeal({
      title,
      company_name: fd.get('company') || '',
      contact_name: fd.get('contact') || '',
      amount: parseFloat(fd.get('amount')) || 0,
      currency: 'MXN',
      stage_id: stageId,
      probability: stages.find(s => s.id === stageId)?.probability || 10,
      source: 'manual',
      tags: [],
    })
    setShowAdd(null)
  }

  return (
    <div style={S.board}>
      {visibleStages.map(stage => {
        const stageDeals = deals.filter(d => d.stage_id === stage.id)
        const total = stageDeals.reduce((s, d) => s + (d.amount || 0), 0)
        const isOver = dragOver === stage.id

        return (
          <div
            key={stage.id}
            style={{ ...S.column, ...(isOver ? S.columnOver : {}) }}
            onDragOver={e => { e.preventDefault(); setDragOver(stage.id) }}
            onDragLeave={() => setDragOver(null)}
            onDrop={e => handleDrop(e, stage.id)}
          >
            <div style={S.colHeader}>
              <div style={S.colHeaderTop}>
                <span style={{ ...S.colDot, background: stage.color }} />
                <span style={S.colName}>{stage.name}</span>
                <span style={S.colCount}>{stageDeals.length}</span>
              </div>
              <div style={S.colTotal}>${fmt(total)}</div>
            </div>

            <div style={S.cards}>
              {stageDeals.map(deal => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={e => handleDragStart(e, deal.id)}
                  style={{ ...S.card, opacity: dragId === deal.id ? 0.5 : 1 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={S.cardTitle}>{deal.title}</div>
                    {deal.score != null && (
                      <span style={{ background: deal.score >= 70 ? '#dcfce7' : deal.score >= 40 ? '#fef9c3' : '#fef2f2', color: deal.score >= 70 ? '#16a34a' : deal.score >= 40 ? '#ca8a04' : '#dc2626', padding: '2px 6px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{deal.score}</span>
                    )}
                  </div>
                  <div style={S.cardCompany}>{deal.company_name}</div>
                  <div style={S.cardBottom}>
                    <span style={S.cardAmount}>${fmt(deal.amount)}</span>
                    {deal.expected_close && (
                      <span style={S.cardDate}>{new Date(deal.expected_close).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                    )}
                  </div>
                  {deal.tags?.length > 0 && (
                    <div style={S.cardTags}>
                      {deal.tags.map(t => <span key={t} style={S.tag}>{t}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {showAdd === stage.id ? (
              <form ref={formRef} style={S.addForm} onSubmit={e => { e.preventDefault(); handleAddDeal(stage.id) }}>
                <input name="title" placeholder="Título del deal" style={S.input} autoFocus />
                <input name="company" placeholder="Empresa" style={S.input} />
                <input name="contact" placeholder="Contacto" style={S.input} />
                <input name="amount" placeholder="Monto" type="number" style={S.input} />
                <div style={S.addFormBtns}>
                  <button type="submit" style={S.btnPrimary}>Agregar</button>
                  <button type="button" onClick={() => setShowAdd(null)} style={S.btnGhost}>Cancelar</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowAdd(stage.id)} style={S.addBtn}>+ Agregar</button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function fmt(n) { return new Intl.NumberFormat('es-MX').format(Math.round(n)) }

const S = {
  board: {
    display: 'flex', gap: 16, overflowX: 'auto',
    paddingBottom: 16, minHeight: 'calc(100vh - 120px)',
  },
  column: {
    flex: '0 0 280px', background: '#f1f5f9', borderRadius: 12,
    padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
    transition: 'background 0.15s',
  },
  columnOver: { background: '#e0e7ff' },
  colHeader: { marginBottom: 4 },
  colHeaderTop: { display: 'flex', alignItems: 'center', gap: 8 },
  colDot: { width: 10, height: 10, borderRadius: '50%' },
  colName: { fontWeight: 700, fontSize: 14 },
  colCount: {
    background: '#e2e8f0', borderRadius: 10, padding: '1px 8px',
    fontSize: 12, fontWeight: 600, color: '#64748b',
  },
  colTotal: { fontSize: 13, color: '#64748b', marginTop: 2 },
  cards: { display: 'flex', flexDirection: 'column', gap: 8, flex: 1 },
  card: {
    background: '#fff', borderRadius: 10, padding: 14,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    cursor: 'grab', transition: 'box-shadow 0.15s',
  },
  cardTitle: { fontWeight: 600, fontSize: 14, marginBottom: 4 },
  cardCompany: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardAmount: { fontWeight: 700, fontSize: 15, color: '#059669' },
  cardDate: { fontSize: 12, color: '#94a3b8' },
  cardTags: { display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' },
  tag: {
    background: '#ede9fe', color: '#6d28d9', padding: '2px 8px',
    borderRadius: 4, fontSize: 11, fontWeight: 500,
  },
  addBtn: {
    border: '2px dashed #cbd5e1', borderRadius: 10, padding: 10,
    background: 'transparent', color: '#94a3b8', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, marginTop: 4,
  },
  addForm: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 },
  input: {
    padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0',
    fontSize: 13, outline: 'none',
  },
  addFormBtns: { display: 'flex', gap: 6 },
  btnPrimary: {
    flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none',
    background: '#6366f1', color: '#fff', fontWeight: 600,
    cursor: 'pointer', fontSize: 13,
  },
  btnGhost: {
    padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 13,
  },
}
