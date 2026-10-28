export default function Dashboard({ crm }) {
  const { stats, deals, stages, activities } = crm

  const byStage = stages
    .filter(s => !s.is_lost)
    .sort((a, b) => a.position - b.position)
    .map(s => ({
      ...s,
      count: deals.filter(d => d.stage_id === s.id).length,
      value: deals.filter(d => d.stage_id === s.id).reduce((sum, d) => sum + (d.amount || 0), 0),
    }))

  const maxValue = Math.max(...byStage.map(s => s.value), 1)

  const bySource = ['web', 'referral', 'cold', 'ad', 'event', 'manual'].map(src => ({
    source: src,
    count: deals.filter(d => d.source === src).length,
    value: deals.filter(d => d.source === src).reduce((s, d) => s + (d.amount || 0), 0),
  })).filter(s => s.count > 0)

  const conversionRate = stats.totalDeals > 0
    ? Math.round(stats.won.length / stats.totalDeals * 100) : 0

  return (
    <div>
      {/* KPI cards */}
      <div style={S.kpis}>
        <div style={S.kpi}>
          <div style={S.kpiLabel}>Pipeline abierto</div>
          <div style={S.kpiValue}>${fmt(stats.pipelineValue)}</div>
        </div>
        <div style={S.kpi}>
          <div style={S.kpiLabel}>Forecast ponderado</div>
          <div style={S.kpiValue}>${fmt(stats.weightedValue)}</div>
        </div>
        <div style={S.kpi}>
          <div style={S.kpiLabel}>Ganados</div>
          <div style={{ ...S.kpiValue, color: '#16a34a' }}>${fmt(stats.wonValue)}</div>
          <div style={S.kpiSub}>{stats.won.length} deals</div>
        </div>
        <div style={S.kpi}>
          <div style={S.kpiLabel}>Tasa de conversión</div>
          <div style={S.kpiValue}>{conversionRate}%</div>
          <div style={S.kpiSub}>{stats.won.length} de {stats.totalDeals}</div>
        </div>
        <div style={S.kpi}>
          <div style={S.kpiLabel}>Actividades vencidas</div>
          <div style={{ ...S.kpiValue, color: stats.overdueActivities.length > 0 ? '#dc2626' : '#1e293b' }}>
            {stats.overdueActivities.length}
          </div>
        </div>
      </div>

      <div style={S.charts}>
        {/* Pipeline funnel */}
        <div style={S.chart}>
          <h3 style={S.chartTitle}>Pipeline por etapa</h3>
          <div style={S.bars}>
            {byStage.map(s => (
              <div key={s.id} style={S.barRow}>
                <div style={S.barLabel}>
                  <span style={{ ...S.dot, background: s.color }} />
                  {s.name}
                </div>
                <div style={S.barTrack}>
                  <div style={{ ...S.barFill, width: `${(s.value / maxValue) * 100}%`, background: s.color }} />
                </div>
                <div style={S.barValue}>${fmt(s.value)}</div>
                <div style={S.barCount}>{s.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* By source */}
        <div style={S.chart}>
          <h3 style={S.chartTitle}>Por fuente</h3>
          <div style={S.sourceList}>
            {bySource.map(s => (
              <div key={s.source} style={S.sourceRow}>
                <div style={S.sourceLabel}>{s.source}</div>
                <div style={S.sourceCount}>{s.count} deals</div>
                <div style={S.sourceValue}>${fmt(s.value)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div style={S.chart}>
          <h3 style={S.chartTitle}>Próximas actividades</h3>
          <div style={S.actList}>
            {activities
              .filter(a => !a.done)
              .sort((a, b) => new Date(a.due_date || '2099') - new Date(b.due_date || '2099'))
              .slice(0, 8)
              .map(a => {
                const deal = deals.find(d => d.id === a.deal_id)
                const isOverdue = a.due_date && new Date(a.due_date) < new Date()
                return (
                  <div key={a.id} style={S.actRow}>
                    <span style={S.actType}>{ICONS[a.type] || '📌'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{a.title}</div>
                      {deal && <div style={S.actDeal}>{deal.title}</div>}
                    </div>
                    {a.due_date && (
                      <span style={{ ...S.actDate, color: isOverdue ? '#dc2626' : '#64748b' }}>
                        {new Date(a.due_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}

const ICONS = { call: '📞', email: '📧', meeting: '🤝', task: '✅', note: '📝', whatsapp: '💬' }
function fmt(n) { return new Intl.NumberFormat('es-MX').format(Math.round(n)) }

const S = {
  kpis: { display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  kpi: { flex: '1 1 180px', background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  kpiLabel: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  kpiValue: { fontSize: 28, fontWeight: 700, color: '#1e293b' },
  kpiSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  charts: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 },
  chart: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  chartTitle: { fontSize: 15, fontWeight: 700, marginBottom: 16, margin: '0 0 16px 0' },
  bars: { display: 'flex', flexDirection: 'column', gap: 10 },
  barRow: { display: 'flex', alignItems: 'center', gap: 10 },
  barLabel: { width: 110, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  barTrack: { flex: 1, height: 24, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6, transition: 'width 0.3s' },
  barValue: { width: 80, textAlign: 'right', fontSize: 13, fontWeight: 600 },
  barCount: { width: 30, textAlign: 'right', fontSize: 12, color: '#94a3b8' },
  sourceList: { display: 'flex', flexDirection: 'column', gap: 8 },
  sourceRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 },
  sourceLabel: { flex: 1, fontWeight: 500, textTransform: 'capitalize' },
  sourceCount: { color: '#64748b', fontSize: 13 },
  sourceValue: { fontWeight: 700, color: '#059669' },
  actList: { display: 'flex', flexDirection: 'column', gap: 6 },
  actRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 },
  actType: { fontSize: 16 },
  actDeal: { fontSize: 12, color: '#94a3b8' },
  actDate: { fontSize: 12, whiteSpace: 'nowrap' },
}
