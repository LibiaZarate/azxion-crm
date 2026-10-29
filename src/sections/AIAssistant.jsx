import { useState } from 'react'

const SUGGESTED_QUESTIONS = [
  '¿Cuáles son los dolores más frecuentes de mis leads?',
  '¿Dónde se están cayendo más leads en el funnel?',
  '¿Cuál es mi tiempo promedio de respuesta?',
  '¿Qué objeciones aparecen más seguido?',
  '¿Qué deal tiene mejor score y por qué?',
  '¿Qué mejoré esta semana según los cierres?',
]

const DEMO_CONVERSATIONS = [
  {
    q: '¿Cuáles son los dolores más frecuentes de mis leads?',
    a: 'Según el análisis de BI de tu CRM (octubre 2026), los dolores más frecuentes son:\n\n1. **Información repartida en Excel/WhatsApp/cabeza** — detectado en 5 conversaciones (Distribuidora Norte, Inmobiliaria del Pacífico, Grupo Torres)\n2. **Pierden pedidos/clientes por no contestar a tiempo** — detectado en 3 conversaciones (Restaurantes MX, Inmobiliaria del Pacífico)\n3. **No saben cuánto están perdiendo** — detectado en 2 conversaciones (Distribuidora Norte, Restaurantes MX)\n\n📌 *Fuente: Timeline CRM, entradas tipo "note" de IA, oct 10-25 2026*\n\n**Recomendación:** El dolor #1 es tu mejor ángulo de venta. Aparece en el 62% de tus deals activos. Considera usarlo como gancho principal en tu loom de prospección.',
    sources: ['Timeline CRM oct-2026', 'BI Insights - Pains', 'Deals: 1, 2, 3, 4'],
  },
  {
    q: '¿Dónde se están cayendo más leads en el funnel?',
    a: 'Según tu embudo de conversión actual:\n\n- **Calificado → Propuesta**: 33% de caída (la mayor del funnel)\n- **Negociación → Ganado**: 50% de caída\n- **Nuevo → Calificado**: 14% de caída (relativamente sano)\n\n📌 *Fuente: Funnel CRM, corte oct 28 2026, 7 deals activos + 1 perdido*\n\n**Análisis:** La caída más preocupante es Calificado → Propuesta. Hipótesis del ciclo Kaizen #2: las propuestas no muestran ROI cuantificado, el lead no puede justificar internamente.\n\n**Siguiente paso:** El ciclo DMAIC de "Tasa de conversión Propuesta → Negociación" ya está en fase de Mejora. Agregar slide de ROI calculado a cada propuesta.',
    sources: ['Funnel CRM oct-2026', 'Kaizen Ciclo #2', 'Pipeline stages'],
  },
]

export default function AIAssistant({ crm }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  function handleAsk(question) {
    const q = question || input.trim()
    if (!q) return

    setMessages(prev => [...prev, { role: 'user', content: q }])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const match = DEMO_CONVERSATIONS.find(c => c.q.toLowerCase().includes(q.toLowerCase().slice(0, 20)))
      const cfg = crm.clientConfig
      const cfgContext = cfg ? `\n\n**Contexto del Segundo Cerebro (${cfg.nombre_negocio}):**\n- KPI norte: ${cfg.kpi_norte || 'No definido'}\n- Meta cierres: ${cfg.meta_cierre_mensual || '—'}/mes\n- Meta conversión: ${cfg.meta_conversion || '—'}%\n- Tiempo respuesta meta: < ${cfg.meta_tiempo_respuesta || '—'} min\n- Tono: ${cfg.tono || '—'}\n- Canales: ${cfg.canales_activos?.join(', ') || 'No definidos'}` : ''
      const response = match || {
        a: `Basándome en la data de tu CRM, aquí va mi análisis:\n\nTu pipeline tiene ${crm.stats.open.length} oportunidades abiertas por un valor total de $${fmt(crm.stats.pipelineValue)} MXN. ${crm.stats.won.length} deals ganados ($${fmt(crm.stats.wonValue)}) y ${crm.stats.lost.length} perdidos.\n\nEl deal con mejor score es "${[...crm.deals].sort((a, b) => (b.score || 0) - (a.score || 0))[0]?.title}" con score de ${[...crm.deals].sort((a, b) => (b.score || 0) - (a.score || 0))[0]?.score}.${cfgContext}\n\n📌 *Fuente: Dashboard CRM, datos en tiempo real*\n\n¿Quieres que profundice en algún deal o métrica específica?`,
        sources: cfg ? ['Dashboard CRM', 'Pipeline en tiempo real', 'Segundo Cerebro'] : ['Dashboard CRM', 'Pipeline en tiempo real'],
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response.a, sources: response.sources }])
      setLoading(false)
    }, 1200)
  }

  return (
    <div style={S.wrap}>
      <div style={S.layout}>
        {/* Chat area */}
        <div style={S.chatArea}>
          {messages.length === 0 ? (
            <div style={S.empty}>
              <div style={S.emptyIcon}>🧠</div>
              <h2 style={S.emptyTitle}>Asistente de Inteligencia Comercial</h2>
              <p style={S.emptyDesc}>
                Pregúntame sobre tu pipeline, leads, métricas, dolores detectados, objeciones, tiempos de respuesta o mejoras del Kaizen. Respondo con datos y cito la fuente.
              </p>
              <div style={S.connectInfo}>
                <div style={S.connectCard}>
                  <span style={S.connectIcon}>◆</span>
                  <div>
                    <div style={S.connectTitle}>Claude / ChatGPT</div>
                    <div style={S.connectDesc}>Conecta tu cuenta y la IA tendrá acceso a todos tus frameworks, trazabilidad y reportes del CRM.</div>
                  </div>
                  <span style={S.connectBadge}>Próximamente</span>
                </div>
              </div>
              <div style={S.suggestions}>
                <div style={S.sugLabel}>Preguntas sugeridas</div>
                <div style={S.sugGrid}>
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button key={i} onClick={() => handleAsk(q)} style={S.sugBtn}>{q}</button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={S.messages}>
              {messages.map((m, i) => (
                <div key={i} style={m.role === 'user' ? S.userMsg : S.assistantMsg}>
                  {m.role === 'assistant' && <div style={S.aiAvatar}>🧠</div>}
                  <div style={m.role === 'user' ? S.userBubble : S.aiBubble}>
                    {m.content.split('\n').map((line, j) => {
                      if (line.startsWith('**') && line.endsWith('**')) return <p key={j} style={{ fontWeight: 700, margin: '6px 0' }}>{line.replace(/\*\*/g, '')}</p>
                      if (line.startsWith('📌')) return <p key={j} style={{ fontSize: 12, color: '#6366f1', fontStyle: 'italic', margin: '8px 0 4px' }}>{line}</p>
                      if (line.match(/^\d\./)) return <p key={j} style={{ margin: '4px 0', paddingLeft: 8 }}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                      if (line.startsWith('- **')) return <p key={j} style={{ margin: '4px 0', paddingLeft: 8 }}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                      return <p key={j} style={{ margin: '4px 0' }}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                    })}
                    {m.sources && (
                      <div style={S.sourcesBox}>
                        <span style={S.sourcesLabel}>Fuentes:</span>
                        {m.sources.map((s, j) => <span key={j} style={S.sourceTag}>{s}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={S.assistantMsg}>
                  <div style={S.aiAvatar}>🧠</div>
                  <div style={S.aiBubble}>
                    <div style={S.typing}>Analizando tu data comercial...</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div style={S.inputArea}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              placeholder="Pregunta sobre tu pipeline, leads, métricas..."
              style={S.input}
            />
            <button onClick={() => handleAsk()} style={S.sendBtn} disabled={loading || !input.trim()}>
              Enviar
            </button>
          </div>
        </div>

        {/* Sidebar: quick stats */}
        <div style={S.sidebar}>
          <h3 style={S.sideTitle}>Contexto activo</h3>
          <div style={S.contextItem}>
            <span style={S.contextLabel}>Deals abiertos</span>
            <span style={S.contextValue}>{crm.stats.open.length}</span>
          </div>
          <div style={S.contextItem}>
            <span style={S.contextLabel}>Pipeline</span>
            <span style={S.contextValue}>${fmt(crm.stats.pipelineValue)}</span>
          </div>
          <div style={S.contextItem}>
            <span style={S.contextLabel}>Ganados</span>
            <span style={{ ...S.contextValue, color: '#16a34a' }}>{crm.stats.won.length}</span>
          </div>
          <div style={S.contextItem}>
            <span style={S.contextLabel}>Actividades vencidas</span>
            <span style={{ ...S.contextValue, color: '#dc2626' }}>{crm.stats.overdueActivities.length}</span>
          </div>
          <div style={S.contextItem}>
            <span style={S.contextLabel}>Timeline entries</span>
            <span style={S.contextValue}>{crm.timeline.length}</span>
          </div>
          <div style={S.contextItem}>
            <span style={S.contextLabel}>BI insights</span>
            <span style={S.contextValue}>{crm.biInsights.length}</span>
          </div>

          {crm.clientConfig && (
            <div style={{ marginTop: 16, padding: 14, background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px', color: '#16a34a' }}>Segundo Cerebro: {crm.clientConfig.nombre_negocio}</h4>
              {crm.clientConfig.icp_dolor_principal && <div style={{ fontSize: 12, color: '#166534', marginBottom: 4 }}>Dolor ICP: {crm.clientConfig.icp_dolor_principal.slice(0, 60)}</div>}
              {crm.clientConfig.kpi_norte && <div style={{ fontSize: 12, color: '#166534', marginBottom: 4 }}>KPI norte: {crm.clientConfig.kpi_norte.slice(0, 60)}</div>}
              {crm.clientConfig.tono && <div style={{ fontSize: 12, color: '#166534' }}>Tono: {crm.clientConfig.tono}</div>}
            </div>
          )}

          <div style={S.frameworkBox}>
            <h4 style={S.frameworkTitle}>Frameworks cargados</h4>
            <div style={S.fwItem}><span>🧠</span> Segundo Cerebro Comercial</div>
            <div style={S.fwItem}><span>🔄</span> DMAIC / Kaizen</div>
            <div style={S.fwItem}><span>📊</span> Trazabilidad completa</div>
            <div style={S.fwItem}><span>🎯</span> Lead Scoring</div>
            <div style={S.fwItem}><span>📈</span> Análisis de conversión</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function fmt(n) { return new Intl.NumberFormat('es-MX').format(Math.round(n)) }

const S = {
  wrap: {},
  layout: { display: 'flex', gap: 20, minHeight: 'calc(100vh - 140px)' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: 700, margin: '0 0 8px 0' },
  emptyDesc: { fontSize: 15, color: '#64748b', textAlign: 'center', maxWidth: 520, margin: '0 0 24px 0', lineHeight: 1.5 },
  connectInfo: { width: '100%', maxWidth: 520, marginBottom: 24 },
  connectCard: { display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' },
  connectIcon: { fontSize: 24, color: '#818cf8' },
  connectTitle: { fontWeight: 600, fontSize: 14 },
  connectDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  connectBadge: { background: '#ede9fe', color: '#6d28d9', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' },
  suggestions: { width: '100%', maxWidth: 520 },
  sugLabel: { fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 10 },
  sugGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  sugBtn: { padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, textAlign: 'left', color: '#475569', transition: 'all 0.15s' },
  messages: { flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 16 },
  userMsg: { display: 'flex', justifyContent: 'flex-end' },
  assistantMsg: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  aiAvatar: { width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  userBubble: { background: '#1e293b', color: '#fff', padding: '12px 16px', borderRadius: '16px 16px 4px 16px', maxWidth: '70%', fontSize: 14, lineHeight: 1.5 },
  aiBubble: { background: '#fff', padding: '16px 20px', borderRadius: '16px 16px 16px 4px', maxWidth: '80%', fontSize: 14, lineHeight: 1.5, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  typing: { color: '#94a3b8', fontStyle: 'italic' },
  sourcesBox: { marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  sourcesLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 600 },
  sourceTag: { background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 11, color: '#6366f1', fontWeight: 500 },
  inputArea: { display: 'flex', gap: 8, padding: '16px 0' },
  input: { flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' },
  sendBtn: { padding: '12px 24px', borderRadius: 12, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  sidebar: { width: 260, flexShrink: 0, background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', alignSelf: 'flex-start', position: 'sticky', top: 80 },
  sideTitle: { fontSize: 14, fontWeight: 700, marginBottom: 12, margin: '0 0 12px 0' },
  contextItem: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8fafc', fontSize: 13 },
  contextLabel: { color: '#64748b' },
  contextValue: { fontWeight: 600 },
  frameworkBox: { marginTop: 20, padding: 14, background: '#f8fafc', borderRadius: 10 },
  frameworkTitle: { fontSize: 13, fontWeight: 700, margin: '0 0 10px 0' },
  fwItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13, color: '#475569' },
}
