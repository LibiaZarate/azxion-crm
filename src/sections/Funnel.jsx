export default function Funnel({ crm }) {
  const { deals, stages } = crm

  const funnelStages = stages
    .filter(s => !s.is_lost)
    .sort((a, b) => a.position - b.position)

  const funnelData = funnelStages.map((s, i) => {
    const count = deals.filter(d => {
      const ds = stages.find(st => st.id === d.stage_id)
      return ds && ds.position >= s.position && !ds.is_lost
    }).length
    return { ...s, count }
  })

  const maxCount = Math.max(...funnelData.map(d => d.count), 1)

  const dropoffs = funnelData.map((s, i) => {
    if (i === 0) return { ...s, dropPct: 0, prevCount: 0 }
    const prev = funnelData[i - 1]
    const drop = prev.count > 0 ? Math.round((1 - s.count / prev.count) * 100) : 0
    return { ...s, dropPct: drop, prevCount: prev.count }
  })

  const lostDeals = deals.filter(d => stages.find(s => s.id === d.stage_id)?.is_lost)
  const lostReasons = {}
  lostDeals.forEach(d => {
    const reason = d.lost_reason || 'Sin razón registrada'
    lostReasons[reason] = (lostReasons[reason] || 0) + 1
  })

  const avgTimeInStage = funnelStages.map(s => {
    const inStage = deals.filter(d => d.stage_id === s.id)
    if (inStage.length === 0) return { ...s, avgDays: 0 }
    const totalDays = inStage.reduce((sum, d) => {
      const created = new Date(d.created_at)
      const diff = (Date.now() - created) / (1000 * 60 * 60 * 24)
      return sum + diff
    }, 0)
    return { ...s, avgDays: Math.round(totalDays / inStage.length) }
  })

  const cfg = crm?.clientConfig

  return (
    <div>
      {cfg && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, padding: 16, background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>Metas de {cfg.nombre_negocio}:</span>
          {cfg.meta_conversion && <span style={{ background: '#dcfce7', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#166534' }}>Conversión meta: {cfg.meta_conversion}%</span>}
          {cfg.meta_cierre_mensual && <span style={{ background: '#dcfce7', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#166534' }}>Cierres/mes: {cfg.meta_cierre_mensual}</span>}
          {cfg.ciclo_venta_dias && <span style={{ background: '#dbeafe', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#1e40af' }}>Ciclo venta: {cfg.ciclo_venta_dias} días</span>}
        </div>
      )}
      {/* Visual funnel */}
      <div style={S.funnelWrap}>
        <h3 style={S.title}>Embudo de conversión</h3>
        <div style={S.funnel}>
          {funnelData.map((s, i) => {
            const widthPct = Math.max(20, (s.count / maxCount) * 100)
            const dropoff = dropoffs[i]
            return (
              <div key={s.id} style={S.funnelRow}>
                <div style={S.funnelLabel}>
                  <span style={{ ...S.dot, background: s.color }} />
                  <span style={S.stageName}>{s.name}</span>
                  <span style={S.stageCount}>{s.count}</span>
                </div>
                <div style={S.funnelBarWrap}>
                  <div style={{
                    ...S.funnelBar,
                    width: `${widthPct}%`,
                    background: `linear-gradient(90deg, ${s.color}, ${s.color}99)`,
                  }}>
                    <span style={S.funnelBarText}>{s.count} leads</span>
                  </div>
                </div>
                {i > 0 && dropoff.dropPct > 0 && (
                  <div style={S.dropBadge}>
                    <span style={S.dropArrow}>↓</span>
                    <span style={S.dropPct}>{dropoff.dropPct}% caída</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div style={S.grid}>
        {/* Conversion rates */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Tasas de conversión por etapa</h3>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Etapa</th>
                <th style={S.th}>Leads</th>
                <th style={S.th}>Conversión</th>
                <th style={S.th}>Caída</th>
              </tr>
            </thead>
            <tbody>
              {dropoffs.map((s, i) => (
                <tr key={s.id}>
                  <td style={S.td}>
                    <span style={{ ...S.dot, background: s.color }} />
                    {s.name}
                  </td>
                  <td style={S.td}>{s.count}</td>
                  <td style={S.td}>
                    {i === 0 ? '100%' : `${funnelData[0].count > 0 ? Math.round(s.count / funnelData[0].count * 100) : 0}%`}
                  </td>
                  <td style={S.td}>
                    {i === 0 ? '—' : (
                      <span style={{ color: s.dropPct > 50 ? '#dc2626' : s.dropPct > 30 ? '#f59e0b' : '#16a34a', fontWeight: 700 }}>
                        {s.dropPct}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lost reasons */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Razones de pérdida</h3>
          {Object.entries(lostReasons).length > 0 ? (
            Object.entries(lostReasons).sort((a, b) => b[1] - a[1]).map(([reason, count]) => (
              <div key={reason} style={S.lostRow}>
                <span style={S.lostReason}>{reason}</span>
                <span style={S.lostCount}>{count}</span>
              </div>
            ))
          ) : (
            <div style={S.empty}>No hay deals perdidos</div>
          )}

          <h3 style={{ ...S.cardTitle, marginTop: 24 }}>Tiempo promedio por etapa</h3>
          {avgTimeInStage.map(s => (
            <div key={s.id} style={S.timeRow}>
              <span style={{ ...S.dot, background: s.color }} />
              <span style={{ flex: 1, fontSize: 13 }}>{s.name}</span>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{s.avgDays} días</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const S = {
  funnelWrap: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 24 },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 20, margin: '0 0 20px 0' },
  funnel: { display: 'flex', flexDirection: 'column', gap: 4 },
  funnelRow: { display: 'flex', alignItems: 'center', gap: 16, position: 'relative' },
  funnelLabel: { width: 150, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 },
  dot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  stageName: { fontWeight: 600, flex: 1 },
  stageCount: { fontWeight: 700, color: '#64748b' },
  funnelBarWrap: { flex: 1, display: 'flex', justifyContent: 'center' },
  funnelBar: {
    height: 44, borderRadius: 8, display: 'flex', alignItems: 'center',
    justifyContent: 'center', transition: 'width 0.5s ease',
  },
  funnelBarText: { color: '#fff', fontWeight: 700, fontSize: 13, textShadow: '0 1px 2px rgba(0,0,0,0.2)' },
  dropBadge: {
    position: 'absolute', right: -10, top: -10,
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#fef2f2', borderRadius: 8, padding: '2px 8px',
    fontSize: 11, fontWeight: 600, color: '#dc2626',
  },
  dropArrow: { fontSize: 10 },
  dropPct: {},
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 },
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: 15, fontWeight: 700, margin: '0 0 14px 0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 14, display: 'flex' in {} ? undefined : undefined },
  lostRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' },
  lostReason: { fontSize: 14, flex: 1 },
  lostCount: { background: '#fef2f2', color: '#dc2626', padding: '2px 10px', borderRadius: 8, fontWeight: 700, fontSize: 13 },
  timeRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #f1f5f9' },
  empty: { color: '#94a3b8', textAlign: 'center', padding: 20 },
}
