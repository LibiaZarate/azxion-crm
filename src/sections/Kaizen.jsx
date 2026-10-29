import { useState } from 'react'

const DEMO_CYCLES = [
  {
    id: 1, variable: 'Tiempo de primera respuesta', status: 'verificado',
    target: '< 5 min', current: '43 min promedio', source: 'Timeline CRM oct-2026',
    phases: [
      { phase: 'Definir', done: true, note: 'Variable: minutos entre primer mensaje del lead y primera respuesta del equipo' },
      { phase: 'Medir', done: true, note: 'Promedio actual: 43 min. Solo 2 de 8 deals respondidos en < 5 min.' },
      { phase: 'Analizar', done: true, note: 'Causa raíz: WhatsApp lo maneja una sola persona. Leads de noche se acumulan.' },
      { phase: 'Mejorar', done: true, note: 'Implementar: auto-respuesta en < 1 min + alerta a segundo operador si no hay respuesta en 3 min.' },
      { phase: 'Controlar', done: true, note: 'Dashboard muestra tiempo real. Alerta semanal si promedio sube de 10 min.' },
    ],
    evidence: '2 de 8 deals en < 5 min → meta: 6 de 8',
    created_at: '2026-10-15',
  },
  {
    id: 2, variable: 'Tasa de conversión Propuesta → Negociación', status: 'implementado',
    target: '> 60%', current: '50%', source: 'Funnel CRM oct-2026',
    phases: [
      { phase: 'Definir', done: true, note: 'Variable: % de deals que avanzan de Propuesta a Negociación sin caerse' },
      { phase: 'Medir', done: true, note: 'Actual: 50% (2 de 4 propuestas avanzan). 1 perdida por presupuesto, 1 estancada.' },
      { phase: 'Analizar', done: true, note: 'Hipótesis: la propuesta no muestra ROI cuantificado. El lead no puede justificar internamente.' },
      { phase: 'Mejorar', done: false, note: 'Agregar slide de ROI calculado + caso de éxito similar en cada propuesta.' },
      { phase: 'Controlar', done: false, note: '' },
    ],
    evidence: 'Pendiente: medir después de 5 propuestas con nuevo formato',
    created_at: '2026-10-20',
  },
  {
    id: 3, variable: 'Retención post-cierre (30 días)', status: 'propuesto',
    target: '100% activo a 30 días', current: 'Sin medición', source: 'Observación directa',
    phases: [
      { phase: 'Definir', done: true, note: 'Variable: % de clientes ganados que siguen activos (responden, usan el producto) a 30 días del cierre' },
      { phase: 'Medir', done: false, note: '' },
      { phase: 'Analizar', done: false, note: '' },
      { phase: 'Mejorar', done: false, note: '' },
      { phase: 'Controlar', done: false, note: '' },
    ],
    evidence: '',
    created_at: '2026-10-25',
  },
]

const DEMO_REVIEWS = [
  { id: 1, date: '2026-10-25', type: 'semanal', entries: [
    { task: 'Seguimiento a Boutique Lina', advanced: 'Pasó a Negociación, pidió contrato', corrected: 'Tardé 2 días en enviar contrato', reused: 'Template de contrato estándar', next: 'Enviar contrato en < 24h post-solicitud' },
    { task: 'Discovery call Distribuidora Norte', advanced: 'Identifiqué dolor cuantificable', corrected: 'No pregunté presupuesto en la llamada', reused: 'Guión de discovery con pregunta de dolor', next: 'Agregar pregunta de presupuesto al guión' },
  ]},
  { id: 2, date: '2026-10-18', type: 'semanal', entries: [
    { task: 'Propuesta App de Delivery', advanced: 'Demo programada', corrected: 'Propuesta genérica, sin ROI', reused: 'Nada reutilizable aún', next: 'Crear template de propuesta con ROI' },
  ]},
]

const DEMO_CLOSURES = [
  { id: 1, decision: 'Implementar auto-respuesta WhatsApp', status: 'verificado', source: 'Análisis de tiempos oct-2026', result: 'Tiempo promedio bajó de 43 min a 8 min en prueba', evidence: 'Dashboard de tiempos', failures: '', next: 'Escalar a todos los canales' },
  { id: 2, decision: 'Agregar slide de ROI a propuestas', status: 'implementado', source: 'Pérdida de Eventos GDL por presupuesto', result: 'Pendiente: medir en próximas 5 propuestas', evidence: '', failures: '', next: 'Registrar si mencionan el ROI en la negociación' },
  { id: 3, decision: 'Secuencia de onboarding post-cierre', status: 'propuesto', source: 'Sin dato de retención a 30 días', result: '', evidence: '', failures: '', next: 'Definir los 5 touchpoints del primer mes' },
]

const STATUS_COLORS = {
  propuesto: { bg: '#f1f5f9', color: '#64748b' },
  decidido: { bg: '#dbeafe', color: '#2563eb' },
  implementado: { bg: '#fef9c3', color: '#ca8a04' },
  verificado: { bg: '#dcfce7', color: '#16a34a' },
  bloqueado: { bg: '#fef2f2', color: '#dc2626' },
}

export default function Kaizen({ crm }) {
  const cfg = crm?.clientConfig
  const [tab, setTab] = useState('cycles')
  const [expandedCycle, setExpandedCycle] = useState(null)

  return (
    <div>
      {/* Tabs */}
      <div style={S.tabs}>
        {[
          { id: 'cycles', label: 'Ciclos DMAIC', icon: '🔄' },
          { id: 'reviews', label: 'Revisiones', icon: '📋' },
          { id: 'closures', label: 'Cierres', icon: '✅' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ ...S.tab, ...(tab === t.id ? S.tabActive : {}) }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {cfg && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, padding: 16, background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', width: '100%' }}>Métricas del Segundo Cerebro de {cfg.nombre_negocio}</div>
          {cfg.meta_cierre_mensual && <span style={{ background: '#dcfce7', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#166534' }}>Meta cierres: {cfg.meta_cierre_mensual}/mes</span>}
          {cfg.meta_tiempo_respuesta && <span style={{ background: '#dcfce7', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#166534' }}>Resp: &lt;{cfg.meta_tiempo_respuesta} min</span>}
          {cfg.meta_conversion && <span style={{ background: '#dcfce7', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#166534' }}>Conversión: {cfg.meta_conversion}%</span>}
          {cfg.kpi_norte && <span style={{ background: '#dbeafe', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#1e40af' }}>KPI norte: {cfg.kpi_norte}</span>}
        </div>
      )}

      {tab === 'cycles' && (
        <div>
          <div style={S.kpis}>
            <div style={S.kpi}>
              <div style={S.kpiLabel}>Ciclos activos</div>
              <div style={S.kpiValue}>{DEMO_CYCLES.length}</div>
            </div>
            <div style={S.kpi}>
              <div style={S.kpiLabel}>Verificados</div>
              <div style={{ ...S.kpiValue, color: '#16a34a' }}>{DEMO_CYCLES.filter(c => c.status === 'verificado').length}</div>
            </div>
            <div style={S.kpi}>
              <div style={S.kpiLabel}>En progreso</div>
              <div style={{ ...S.kpiValue, color: '#f59e0b' }}>{DEMO_CYCLES.filter(c => c.status === 'implementado').length}</div>
            </div>
            <div style={S.kpi}>
              <div style={S.kpiLabel}>Propuestos</div>
              <div style={{ ...S.kpiValue, color: '#64748b' }}>{DEMO_CYCLES.filter(c => c.status === 'propuesto').length}</div>
            </div>
          </div>

          {DEMO_CYCLES.map(cycle => {
            const expanded = expandedCycle === cycle.id
            const sc = STATUS_COLORS[cycle.status] || STATUS_COLORS.propuesto
            const donePhases = cycle.phases.filter(p => p.done).length
            return (
              <div key={cycle.id} style={S.cycleCard} onClick={() => setExpandedCycle(expanded ? null : cycle.id)}>
                <div style={S.cycleHeader}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{cycle.variable}</span>
                      <span style={{ ...S.statusBadge, background: sc.bg, color: sc.color }}>{cycle.status}</span>
                    </div>
                    <div style={S.cycleMeta}>
                      Meta: {cycle.target} · Actual: {cycle.current} · Fuente: {cycle.source}
                    </div>
                  </div>
                  <div style={S.phaseProgress}>
                    {cycle.phases.map((p, i) => (
                      <div key={i} style={{ ...S.phaseDot, background: p.done ? '#16a34a' : '#e2e8f0' }} title={p.phase} />
                    ))}
                    <span style={S.phaseCount}>{donePhases}/5</span>
                  </div>
                </div>

                {expanded && (
                  <div style={S.cycleBody}>
                    {cycle.phases.map((p, i) => (
                      <div key={i} style={S.phaseRow}>
                        <div style={{ ...S.phaseLabel, color: p.done ? '#16a34a' : '#94a3b8' }}>
                          {p.done ? '✓' : '○'} {p.phase}
                        </div>
                        <div style={S.phaseNote}>{p.note || 'Pendiente'}</div>
                      </div>
                    ))}
                    {cycle.evidence && (
                      <div style={S.evidenceBox}>
                        <strong>Evidencia:</strong> {cycle.evidence}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'reviews' && (
        <div>
          {DEMO_REVIEWS.map(review => (
            <div key={review.id} style={S.reviewCard}>
              <div style={S.reviewHeader}>
                <span style={S.reviewDate}>{new Date(review.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span style={S.reviewType}>{review.type}</span>
              </div>
              <table style={S.reviewTable}>
                <thead>
                  <tr>
                    <th style={S.rth}>Tarea</th>
                    <th style={S.rth}>Qué avanzó</th>
                    <th style={S.rth}>Qué corregí</th>
                    <th style={S.rth}>Qué reutilicé</th>
                    <th style={S.rth}>Siguiente mejora</th>
                  </tr>
                </thead>
                <tbody>
                  {review.entries.map((e, i) => (
                    <tr key={i}>
                      <td style={S.rtd}>{e.task}</td>
                      <td style={{ ...S.rtd, color: '#16a34a' }}>{e.advanced}</td>
                      <td style={{ ...S.rtd, color: '#dc2626' }}>{e.corrected}</td>
                      <td style={{ ...S.rtd, color: '#6366f1' }}>{e.reused}</td>
                      <td style={{ ...S.rtd, fontWeight: 600 }}>{e.next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {tab === 'closures' && (
        <div style={S.closuresGrid}>
          {DEMO_CLOSURES.map(c => {
            const sc = STATUS_COLORS[c.status] || STATUS_COLORS.propuesto
            return (
              <div key={c.id} style={S.closureCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{c.decision}</span>
                  <span style={{ ...S.statusBadge, background: sc.bg, color: sc.color }}>{c.status}</span>
                </div>
                <div style={S.closureRow}><span style={S.closureLabel}>Fuente</span><span>{c.source}</span></div>
                <div style={S.closureRow}><span style={S.closureLabel}>Resultado</span><span>{c.result || 'Pendiente'}</span></div>
                {c.evidence && <div style={S.closureRow}><span style={S.closureLabel}>Evidencia</span><span>{c.evidence}</span></div>}
                {c.failures && <div style={S.closureRow}><span style={S.closureLabel}>Fallos</span><span style={{ color: '#dc2626' }}>{c.failures}</span></div>}
                <div style={{ ...S.closureRow, borderBottom: 'none' }}><span style={S.closureLabel}>Siguiente paso</span><span style={{ fontWeight: 600 }}>{c.next}</span></div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const S = {
  tabs: { display: 'flex', gap: 8, marginBottom: 24 },
  tab: { padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 },
  tabActive: { background: '#1e293b', color: '#fff', borderColor: '#1e293b' },
  kpis: { display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  kpi: { flex: '1 1 140px', background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  kpiLabel: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  kpiValue: { fontSize: 28, fontWeight: 700, color: '#1e293b' },
  cycleCard: { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'box-shadow 0.15s' },
  cycleHeader: { display: 'flex', alignItems: 'center', gap: 16 },
  cycleMeta: { fontSize: 13, color: '#64748b', marginTop: 4 },
  statusBadge: { padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  phaseProgress: { display: 'flex', alignItems: 'center', gap: 4 },
  phaseDot: { width: 12, height: 12, borderRadius: '50%' },
  phaseCount: { fontSize: 12, fontWeight: 600, color: '#64748b', marginLeft: 4 },
  cycleBody: { marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 16 },
  phaseRow: { display: 'flex', gap: 16, padding: '8px 0', borderBottom: '1px solid #f8fafc' },
  phaseLabel: { width: 100, fontWeight: 600, fontSize: 13 },
  phaseNote: { flex: 1, fontSize: 13, color: '#475569' },
  evidenceBox: { marginTop: 12, padding: 12, background: '#f0fdf4', borderRadius: 8, fontSize: 13, color: '#166534' },
  reviewCard: { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  reviewDate: { fontWeight: 700, fontSize: 16 },
  reviewType: { background: '#ede9fe', color: '#6d28d9', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  reviewTable: { width: '100%', borderCollapse: 'collapse' },
  rth: { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' },
  rtd: { padding: '10px', borderBottom: '1px solid #f1f5f9', fontSize: 13, verticalAlign: 'top' },
  closuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 },
  closureCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  closureRow: { display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid #f8fafc', fontSize: 13 },
  closureLabel: { width: 100, color: '#64748b', fontWeight: 500, flexShrink: 0 },
}
