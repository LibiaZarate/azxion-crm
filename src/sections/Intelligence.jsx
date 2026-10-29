export default function Intelligence({ crm }) {
  const { biInsights, deals, timeline, stages } = crm

  const pains = biInsights.filter(i => i.type === 'pain')
  const keywords = biInsights.filter(i => i.type === 'keyword')
  const objections = biInsights.filter(i => i.type === 'objection')
  const winReasons = biInsights.filter(i => i.type === 'win_reason')

  const lostDeals = deals.filter(d => stages.find(s => s.id === d.stage_id)?.is_lost)
  const wonDeals = deals.filter(d => stages.find(s => s.id === d.stage_id)?.is_won)

  const avgScore = deals.length > 0 ? Math.round(deals.reduce((s, d) => s + (d.score || 0), 0) / deals.length) : 0
  const avgResponseTime = deals.filter(d => d.first_response_min).length > 0
    ? Math.round(deals.filter(d => d.first_response_min).reduce((s, d) => s + d.first_response_min, 0) / deals.filter(d => d.first_response_min).length)
    : 0

  return (
    <div>
      {/* KPIs de inteligencia */}
      <div style={S.kpis}>
        <div style={S.kpi}>
          <div style={S.kpiLabel}>Score promedio</div>
          <div style={S.kpiValue}>{avgScore}</div>
          <div style={S.kpiSub}>de 100</div>
        </div>
        <div style={S.kpi}>
          <div style={S.kpiLabel}>Tiempo resp. promedio</div>
          <div style={S.kpiValue}>{avgResponseTime < 60 ? `${avgResponseTime}m` : `${Math.round(avgResponseTime/60)}h`}</div>
        </div>
        <div style={S.kpi}>
          <div style={S.kpiLabel}>Dolores detectados</div>
          <div style={S.kpiValue}>{pains.length}</div>
        </div>
        <div style={S.kpi}>
          <div style={S.kpiLabel}>Objeciones registradas</div>
          <div style={S.kpiValue}>{objections.length}</div>
        </div>
      </div>

      <div style={S.grid}>
        {/* Lead Scoring */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Lead Scoring</h3>
          <div style={S.scoreList}>
            {[...deals].sort((a, b) => (b.score || 0) - (a.score || 0)).map(d => {
              const st = stages.find(s => s.id === d.stage_id)
              const scoreColor = d.score >= 70 ? '#16a34a' : d.score >= 40 ? '#f59e0b' : '#dc2626'
              return (
                <div key={d.id} style={S.scoreRow}>
                  <div style={S.scoreBar}>
                    <div style={{ ...S.scoreFill, width: `${d.score || 0}%`, background: scoreColor }} />
                  </div>
                  <span style={{ ...S.scoreNum, color: scoreColor }}>{d.score}</span>
                  <span style={S.scoreName}>{d.title}</span>
                  <span style={{ ...S.badge, background: st?.color + '20', color: st?.color }}>{st?.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dolores detectados */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Dolores detectados en conversaciones</h3>
          {pains.map(p => (
            <div key={p.id} style={S.insightRow}>
              <span style={S.insightIcon}>🔴</span>
              <span style={{ flex: 1 }}>{p.text}</span>
              <span style={S.freq}>{p.frequency}x</span>
            </div>
          ))}
          <h3 style={{ ...S.cardTitle, marginTop: 20 }}>Razones de cierre</h3>
          {winReasons.map(w => (
            <div key={w.id} style={S.insightRow}>
              <span style={S.insightIcon}>🟢</span>
              <span style={{ flex: 1 }}>{w.text}</span>
              <span style={S.freq}>{w.frequency}x</span>
            </div>
          ))}
        </div>

        {/* Palabras clave */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Palabras clave frecuentes</h3>
          <div style={S.tagCloud}>
            {keywords.map(k => (
              <span key={k.id} style={{ ...S.kwTag, fontSize: 12 + k.frequency * 3 }}>
                {k.text} ({k.frequency})
              </span>
            ))}
          </div>
          <h3 style={{ ...S.cardTitle, marginTop: 20 }}>Objeciones</h3>
          {objections.map(o => (
            <div key={o.id} style={S.insightRow}>
              <span style={S.insightIcon}>⚠️</span>
              <span style={{ flex: 1 }}>{o.text}</span>
              <span style={S.freq}>{o.frequency}x</span>
            </div>
          ))}
        </div>

        {/* Tiempos de respuesta por deal */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Tiempo de primera respuesta</h3>
          {[...deals].sort((a, b) => (a.first_response_min || 999) - (b.first_response_min || 999)).map(d => {
            const mins = d.first_response_min || 0
            const color = mins <= 5 ? '#16a34a' : mins <= 30 ? '#f59e0b' : '#dc2626'
            const label = mins < 60 ? `${mins} min` : `${Math.round(mins/60)}h ${mins%60}m`
            return (
              <div key={d.id} style={S.timeRow}>
                <span style={{ ...S.timeDot, background: color }} />
                <span style={{ flex: 1, fontSize: 13 }}>{d.title}</span>
                <span style={{ fontWeight: 700, color, fontSize: 13 }}>{label}</span>
              </div>
            )
          })}
          <div style={S.timeLegend}>
            <span><span style={{ ...S.timeDot, background: '#16a34a' }} /> {'<'}5 min</span>
            <span><span style={{ ...S.timeDot, background: '#f59e0b' }} /> 5-30 min</span>
            <span><span style={{ ...S.timeDot, background: '#dc2626' }} /> {'>'}30 min</span>
          </div>
        </div>

        {/* Timeline reciente */}
        <div style={{ ...S.card, gridColumn: '1 / -1' }}>
          <h3 style={S.cardTitle}>Timeline de interacciones recientes</h3>
          <div style={S.timeline}>
            {[...timeline].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 12).map(t => {
              const deal = deals.find(d => d.id === t.deal_id)
              return (
                <div key={t.id} style={S.tlRow}>
                  <div style={S.tlDot}>
                    <span>{TL_ICONS[t.type] || '📌'}</span>
                  </div>
                  <div style={S.tlContent}>
                    <div style={S.tlHeader}>
                      <span style={S.tlDeal}>{deal?.title || '—'}</span>
                      <span style={S.tlAuthor}>{t.author}</span>
                      <span style={S.tlDate}>{new Date(t.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={S.tlText}>{t.content}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const TL_ICONS = { note: '📝', stage_change: '🔄', whatsapp: '💬', call: '📞', email: '📧', system: '⚙️' }

const S = {
  kpis: { display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  kpi: { flex: '1 1 180px', background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  kpiLabel: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  kpiValue: { fontSize: 28, fontWeight: 700, color: '#1e293b' },
  kpiSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 },
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: 15, fontWeight: 700, margin: '0 0 14px 0' },
  scoreList: { display: 'flex', flexDirection: 'column', gap: 8 },
  scoreRow: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 },
  scoreBar: { width: 60, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  scoreNum: { fontWeight: 700, width: 28, textAlign: 'right' },
  scoreName: { flex: 1, fontWeight: 500 },
  badge: { padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
  insightRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 },
  insightIcon: { fontSize: 14 },
  freq: { background: '#f1f5f9', padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#64748b' },
  tagCloud: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  kwTag: { background: '#ede9fe', color: '#6d28d9', padding: '4px 12px', borderRadius: 8, fontWeight: 600 },
  timeRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #f1f5f9' },
  timeDot: { width: 10, height: 10, borderRadius: '50%', display: 'inline-block' },
  timeLegend: { display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: '#64748b' },
  timeline: { display: 'flex', flexDirection: 'column', gap: 2 },
  tlRow: { display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f8fafc' },
  tlDot: { width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  tlContent: { flex: 1 },
  tlHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 },
  tlDeal: { fontWeight: 600, fontSize: 13 },
  tlAuthor: { fontSize: 12, color: '#6366f1', fontWeight: 500 },
  tlDate: { fontSize: 12, color: '#94a3b8', marginLeft: 'auto' },
  tlText: { fontSize: 13, color: '#475569', lineHeight: 1.5 },
}
