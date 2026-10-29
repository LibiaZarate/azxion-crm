import { useState } from 'react'

const STEPS = [
  { id: 'negocio', label: 'Tu negocio', icon: '🏢' },
  { id: 'comercial', label: 'Proceso comercial', icon: '💰' },
  { id: 'icp', label: 'Cliente ideal', icon: '🎯' },
  { id: 'canales', label: 'Canales y tono', icon: '💬' },
  { id: 'metricas', label: 'Métricas de éxito', icon: '📊' },
  { id: 'reglas', label: 'Reglas y límites', icon: '🚫' },
  { id: 'resumen', label: 'Segundo Cerebro', icon: '🧠' },
]

const INDUSTRIES = ['Servicios profesionales', 'E-commerce / Retail', 'Salud / Clínicas', 'Inmobiliaria', 'Restaurantes / Alimentos', 'Tecnología / Software', 'Educación', 'Consultoría', 'Manufactura', 'Otro']
const CHANNELS = ['WhatsApp', 'Email', 'Llamada telefónica', 'Instagram DM', 'Facebook Messenger', 'LinkedIn', 'Formulario web', 'Referidos', 'Eventos presenciales']
const TONES = [
  { id: 'profesional', label: 'Profesional formal', desc: 'Usted, sin emojis, corporativo' },
  { id: 'cercano', label: 'Cercano pero profesional', desc: 'Tú, algunos emojis, cálido' },
  { id: 'casual', label: 'Casual y directo', desc: 'Tú, emojis, como amigo experto' },
  { id: 'tecnico', label: 'Técnico-consultivo', desc: 'Datos primero, autoridad, sin adornos' },
]

function empty() {
  return {
    nombre_negocio: '', industria: '', tamano_equipo: '', ciudad: '',
    descripcion_servicio: '', precio_promedio: '', ciclo_venta_dias: '',
    etapas: [
      { nombre: 'Nuevo', color: '#6366f1' },
      { nombre: 'Calificado', color: '#8b5cf6' },
      { nombre: 'Propuesta', color: '#a855f7' },
      { nombre: 'Negociación', color: '#d946ef' },
      { nombre: 'Ganado', color: '#22c55e' },
      { nombre: 'Perdido', color: '#ef4444' },
    ],
    criterios_calificacion: '',
    como_llegan_leads: '',
    seguimiento_actual: '',
    icp_cargo: '', icp_industria: '', icp_tamano: '', icp_dolor_principal: '',
    icp_presupuesto_min: '', icp_senales_compra: '', icp_descalificadores: '',
    canales_activos: [],
    tono: 'cercano',
    mensaje_bienvenida: '',
    palabras_prohibidas: '',
    frecuencia_followup: '48',
    max_followups: '5',
    meta_cierre_mensual: '', meta_pipeline: '', meta_tiempo_respuesta: '5',
    meta_conversion: '', meta_ticket_promedio: '',
    kpi_norte: '',
    reglas_no_hacer: '',
    horario_contacto: '',
    reglas_descuento: '',
    proceso_escalacion: '',
    notas_cultura: '',
  }
}

export default function Onboarding({ crm }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState(empty())
  const [submitted, setSubmitted] = useState(false)

  const set = (key, val) => setData(prev => ({ ...prev, [key]: val }))
  const toggleChannel = ch => {
    set('canales_activos', data.canales_activos.includes(ch)
      ? data.canales_activos.filter(c => c !== ch)
      : [...data.canales_activos, ch])
  }

  const updateEtapa = (i, field, val) => {
    const etapas = [...data.etapas]
    etapas[i] = { ...etapas[i], [field]: val }
    set('etapas', etapas)
  }
  const addEtapa = () => set('etapas', [...data.etapas, { nombre: '', color: '#94a3b8' }])
  const removeEtapa = i => set('etapas', data.etapas.filter((_, j) => j !== i))

  const handleSubmit = () => {
    if (crm?.setClientConfig) crm.setClientConfig(data)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={S.wrap}>
        <div style={S.successCard}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Segundo Cerebro Comercial generado</h2>
          <p style={{ color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>
            La configuración de <strong>{data.nombre_negocio}</strong> está lista.
            El CRM se personalizó con {data.etapas.length} etapas, {data.canales_activos.length} canales activos,
            y las métricas de éxito definidas.
          </p>
          <div style={S.summaryGrid}>
            <SummaryCard title="Pipeline" items={data.etapas.map(e => e.nombre).filter(Boolean)} />
            <SummaryCard title="Canales activos" items={data.canales_activos} />
            <SummaryCard title="ICP" items={[
              data.icp_cargo && `Cargo: ${data.icp_cargo}`,
              data.icp_industria && `Industria: ${data.icp_industria}`,
              data.icp_dolor_principal && `Dolor: ${data.icp_dolor_principal}`,
            ].filter(Boolean)} />
            <SummaryCard title="Métricas norte" items={[
              data.meta_cierre_mensual && `Cierres/mes: ${data.meta_cierre_mensual}`,
              data.meta_pipeline && `Pipeline: $${data.meta_pipeline}`,
              data.meta_tiempo_respuesta && `Resp: < ${data.meta_tiempo_respuesta} min`,
              data.meta_conversion && `Conversión: ${data.meta_conversion}%`,
            ].filter(Boolean)} />
            <SummaryCard title="Reglas del agente" items={[
              data.tono && `Tono: ${TONES.find(t => t.id === data.tono)?.label}`,
              data.reglas_no_hacer && `No hacer: ${data.reglas_no_hacer.slice(0, 60)}...`,
              data.horario_contacto && `Horario: ${data.horario_contacto}`,
            ].filter(Boolean)} />
            <SummaryCard title="Kaizen automático" items={[
              'Tiempo de respuesta → medir semanalmente',
              'Conversión por etapa → revisión quincenal',
              data.kpi_norte && `KPI norte: ${data.kpi_norte}`,
            ].filter(Boolean)} />
          </div>
          <div style={S.configJson}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>config.json generado</span>
              <button onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))} style={S.copyBtn}>Copiar</button>
            </div>
            <pre style={S.pre}>{JSON.stringify(data, null, 2).slice(0, 800)}...</pre>
          </div>
          <button onClick={() => { setSubmitted(false); setStep(0); setData(empty()) }} style={S.resetBtn}>Nuevo onboarding</button>
        </div>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      {/* Progress */}
      <div style={S.progress}>
        {STEPS.map((s, i) => (
          <button key={s.id} onClick={() => setStep(i)} style={{ ...S.stepBtn, ...(i === step ? S.stepActive : i < step ? S.stepDone : {}) }}>
            <span style={S.stepIcon}>{i < step ? '✓' : s.icon}</span>
            <span style={S.stepLabel}>{s.label}</span>
          </button>
        ))}
      </div>

      <div style={S.form}>
        {step === 0 && (
          <div>
            <h2 style={S.title}>Cuéntanos sobre tu negocio</h2>
            <p style={S.subtitle}>Esta información configura tu instancia del CRM.</p>
            <div style={S.fields}>
              <Field label="Nombre del negocio" value={data.nombre_negocio} onChange={v => set('nombre_negocio', v)} placeholder="Ej: Restaurantes MX" />
              <div>
                <label style={S.label}>Industria</label>
                <select value={data.industria} onChange={e => set('industria', e.target.value)} style={S.select}>
                  <option value="">Selecciona...</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <Field label="Tamaño del equipo comercial" value={data.tamano_equipo} onChange={v => set('tamano_equipo', v)} placeholder="Ej: 3 personas" />
              <Field label="Ciudad / Zona" value={data.ciudad} onChange={v => set('ciudad', v)} placeholder="Ej: Guadalajara, Jalisco" />
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>¿Qué servicio o producto vendes? (en 2-3 líneas)</label>
                <textarea value={data.descripcion_servicio} onChange={e => set('descripcion_servicio', e.target.value)} style={S.textarea} rows={3} placeholder="Describe tu oferta principal..." />
              </div>
              <Field label="Precio/ticket promedio (MXN)" value={data.precio_promedio} onChange={v => set('precio_promedio', v)} placeholder="Ej: 45,000" type="number" />
              <Field label="Ciclo de venta promedio (días)" value={data.ciclo_venta_dias} onChange={v => set('ciclo_venta_dias', v)} placeholder="Ej: 30" type="number" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={S.title}>Tu proceso comercial</h2>
            <p style={S.subtitle}>Define las etapas por las que pasa un lead desde que llega hasta que cierra (o se pierde).</p>
            <div style={S.etapasWrap}>
              {data.etapas.map((e, i) => (
                <div key={i} style={S.etapaRow}>
                  <span style={S.etapaNum}>{i + 1}</span>
                  <input value={e.nombre} onChange={ev => updateEtapa(i, 'nombre', ev.target.value)} style={S.etapaInput} placeholder="Nombre de la etapa" />
                  <input type="color" value={e.color} onChange={ev => updateEtapa(i, 'color', ev.target.value)} style={S.colorInput} />
                  {data.etapas.length > 3 && <button onClick={() => removeEtapa(i)} style={S.removeBtn}>✕</button>}
                </div>
              ))}
              <button onClick={addEtapa} style={S.addEtapaBtn}>+ Agregar etapa</button>
            </div>
            <div style={{ ...S.fields, marginTop: 20 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>¿Cómo calificas que un lead es real? (criterios de calificación)</label>
                <textarea value={data.criterios_calificacion} onChange={e => set('criterios_calificacion', e.target.value)} style={S.textarea} rows={3} placeholder="Ej: Tiene presupuesto definido, tiene necesidad urgente, es el decisor..." />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>¿Cómo llegan tus leads hoy?</label>
                <textarea value={data.como_llegan_leads} onChange={e => set('como_llegan_leads', e.target.value)} style={S.textarea} rows={2} placeholder="Ej: 60% referidos, 30% redes sociales, 10% sitio web..." />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>¿Cómo le das seguimiento hoy? (describe tu proceso actual)</label>
                <textarea value={data.seguimiento_actual} onChange={e => set('seguimiento_actual', e.target.value)} style={S.textarea} rows={3} placeholder="Ej: Le mando WhatsApp al día siguiente, si no responde espero una semana..." />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={S.title}>Tu cliente ideal (ICP)</h2>
            <p style={S.subtitle}>Esto entrena al agente para calificar leads automáticamente y priorizar los correctos.</p>
            <div style={S.fields}>
              <Field label="Cargo / rol del decisor" value={data.icp_cargo} onChange={v => set('icp_cargo', v)} placeholder="Ej: Director General, Gerente de Operaciones" />
              <Field label="Industria del cliente ideal" value={data.icp_industria} onChange={v => set('icp_industria', v)} placeholder="Ej: Restaurantes con +5 sucursales" />
              <Field label="Tamaño de empresa ideal" value={data.icp_tamano} onChange={v => set('icp_tamano', v)} placeholder="Ej: 10-50 empleados" />
              <Field label="Presupuesto mínimo viable (MXN)" value={data.icp_presupuesto_min} onChange={v => set('icp_presupuesto_min', v)} placeholder="Ej: 20,000" type="number" />
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>¿Cuál es el dolor principal que resuelves?</label>
                <textarea value={data.icp_dolor_principal} onChange={e => set('icp_dolor_principal', e.target.value)} style={S.textarea} rows={2} placeholder="Ej: Pierden clientes porque no contestan a tiempo en WhatsApp..." />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>Señales de que un lead va a comprar</label>
                <textarea value={data.icp_senales_compra} onChange={e => set('icp_senales_compra', e.target.value)} style={S.textarea} rows={2} placeholder="Ej: Pregunta por precios, menciona urgencia, pide demo..." />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>Descalificadores (qué tipo de lead NO atender)</label>
                <textarea value={data.icp_descalificadores} onChange={e => set('icp_descalificadores', e.target.value)} style={S.textarea} rows={2} placeholder="Ej: Busca solo precio, no es el decisor, empresa de 1 persona..." />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={S.title}>Canales y tono de comunicación</h2>
            <p style={S.subtitle}>Define por dónde hablas con tus leads y cómo debe sonar el agente.</p>
            <label style={S.label}>Canales activos</label>
            <div style={S.channelGrid}>
              {CHANNELS.map(ch => (
                <button key={ch} onClick={() => toggleChannel(ch)} style={{ ...S.channelBtn, ...(data.canales_activos.includes(ch) ? S.channelActive : {}) }}>
                  {ch}
                </button>
              ))}
            </div>
            <label style={{ ...S.label, marginTop: 20 }}>Tono del agente</label>
            <div style={S.toneGrid}>
              {TONES.map(t => (
                <button key={t.id} onClick={() => set('tono', t.id)} style={{ ...S.toneBtn, ...(data.tono === t.id ? S.toneActive : {}) }}>
                  <div style={{ fontWeight: 600 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{t.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ ...S.fields, marginTop: 20 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>Mensaje de bienvenida para leads nuevos</label>
                <textarea value={data.mensaje_bienvenida} onChange={e => set('mensaje_bienvenida', e.target.value)} style={S.textarea} rows={3} placeholder="Ej: ¡Hola! Soy [nombre], gracias por tu interés en [servicio]..." />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>Palabras o frases prohibidas</label>
                <textarea value={data.palabras_prohibidas} onChange={e => set('palabras_prohibidas', e.target.value)} style={S.textarea} rows={2} placeholder="Ej: barato, descuento, urgente, gratis..." />
              </div>
              <Field label="Frecuencia de follow-up (horas)" value={data.frecuencia_followup} onChange={v => set('frecuencia_followup', v)} type="number" />
              <Field label="Máximo de follow-ups antes de pausar" value={data.max_followups} onChange={v => set('max_followups', v)} type="number" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={S.title}>Métricas de éxito</h2>
            <p style={S.subtitle}>Estas metas configuran tus ciclos Kaizen y los dashboards de tu CRM.</p>
            <div style={S.fields}>
              <Field label="Meta de cierres por mes" value={data.meta_cierre_mensual} onChange={v => set('meta_cierre_mensual', v)} placeholder="Ej: 5" type="number" />
              <Field label="Meta de pipeline activo (MXN)" value={data.meta_pipeline} onChange={v => set('meta_pipeline', v)} placeholder="Ej: 500,000" type="number" />
              <Field label="Tiempo máximo de primera respuesta (min)" value={data.meta_tiempo_respuesta} onChange={v => set('meta_tiempo_respuesta', v)} type="number" />
              <Field label="Meta de tasa de conversión (%)" value={data.meta_conversion} onChange={v => set('meta_conversion', v)} placeholder="Ej: 25" type="number" />
              <Field label="Ticket promedio meta (MXN)" value={data.meta_ticket_promedio} onChange={v => set('meta_ticket_promedio', v)} placeholder="Ej: 50,000" type="number" />
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>KPI norte (la métrica #1 que define el éxito de este cliente)</label>
                <textarea value={data.kpi_norte} onChange={e => set('kpi_norte', e.target.value)} style={S.textarea} rows={2} placeholder="Ej: Revenue mensual recurrente, o número de clientes activos, o tasa de retención a 90 días..." />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 style={S.title}>Reglas y límites</h2>
            <p style={S.subtitle}>Qué NO debe hacer el sistema. Esto protege la relación con el cliente.</p>
            <div style={S.fields}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>Cosas que el agente NUNCA debe hacer</label>
                <textarea value={data.reglas_no_hacer} onChange={e => set('reglas_no_hacer', e.target.value)} style={S.textarea} rows={4} placeholder="Ej: Nunca dar precio sin antes hacer discovery. Nunca prometer fechas sin confirmar con el equipo. Nunca hablar mal de la competencia..." />
              </div>
              <Field label="Horario permitido de contacto" value={data.horario_contacto} onChange={v => set('horario_contacto', v)} placeholder="Ej: Lunes a viernes 9am-7pm" />
              <div>
                <label style={S.label}>Reglas de descuento</label>
                <textarea value={data.reglas_descuento} onChange={e => set('reglas_descuento', e.target.value)} style={S.textarea} rows={2} placeholder="Ej: Máximo 10% con aprobación del director. Nunca en primer contacto." />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>Proceso de escalación (cuándo escalar a humano)</label>
                <textarea value={data.proceso_escalacion} onChange={e => set('proceso_escalacion', e.target.value)} style={S.textarea} rows={3} placeholder="Ej: Si el lead pide hablar con alguien, si hay queja, si el deal es > $100k..." />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>Notas de cultura o contexto especial</label>
                <textarea value={data.notas_cultura} onChange={e => set('notas_cultura', e.target.value)} style={S.textarea} rows={2} placeholder="Ej: En esta industria se tutea, los cierres son en persona, el ciclo largo es normal..." />
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h2 style={S.title}>Resumen: tu Segundo Cerebro Comercial</h2>
            <p style={S.subtitle}>Revisa que todo esté correcto. Al confirmar, el CRM se personaliza automáticamente.</p>
            <div style={S.reviewGrid}>
              <ReviewBlock title="Negocio" items={{
                'Nombre': data.nombre_negocio, 'Industria': data.industria,
                'Equipo': data.tamano_equipo, 'Ciudad': data.ciudad,
                'Ticket promedio': data.precio_promedio ? `$${data.precio_promedio}` : '',
                'Ciclo venta': data.ciclo_venta_dias ? `${data.ciclo_venta_dias} días` : '',
              }} />
              <ReviewBlock title="Pipeline" items={Object.fromEntries(data.etapas.map((e, i) => [`Etapa ${i+1}`, e.nombre]))} />
              <ReviewBlock title="ICP" items={{
                'Cargo': data.icp_cargo, 'Industria': data.icp_industria,
                'Dolor': data.icp_dolor_principal, 'Presupuesto min': data.icp_presupuesto_min ? `$${data.icp_presupuesto_min}` : '',
              }} />
              <ReviewBlock title="Comunicación" items={{
                'Canales': data.canales_activos.join(', '),
                'Tono': TONES.find(t => t.id === data.tono)?.label,
                'Follow-up': `Cada ${data.frecuencia_followup}h, máx ${data.max_followups}`,
              }} />
              <ReviewBlock title="Metas" items={{
                'Cierres/mes': data.meta_cierre_mensual, 'Pipeline': data.meta_pipeline ? `$${data.meta_pipeline}` : '',
                'Resp. máx': data.meta_tiempo_respuesta ? `${data.meta_tiempo_respuesta} min` : '',
                'Conversión': data.meta_conversion ? `${data.meta_conversion}%` : '',
                'KPI norte': data.kpi_norte,
              }} />
              <ReviewBlock title="Reglas" items={{
                'No hacer': data.reglas_no_hacer?.slice(0, 80) || '', 'Horario': data.horario_contacto,
                'Escalación': data.proceso_escalacion?.slice(0, 80) || '',
              }} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={S.navBtns}>
          {step > 0 && <button onClick={() => setStep(step - 1)} style={S.backBtn}>← Anterior</button>}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} style={S.nextBtn}>Siguiente →</button>
          ) : (
            <button onClick={handleSubmit} style={S.submitBtn}>Generar Segundo Cerebro →</button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      <input type={type || 'text'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={S.input} />
    </div>
  )
}

function SummaryCard({ title, items }) {
  return (
    <div style={S.sumCard}>
      <h4 style={S.sumTitle}>{title}</h4>
      {items.map((item, i) => <div key={i} style={S.sumItem}>• {item}</div>)}
    </div>
  )
}

function ReviewBlock({ title, items }) {
  return (
    <div style={S.reviewBlock}>
      <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px', color: '#6366f1' }}>{title}</h4>
      {Object.entries(items).filter(([, v]) => v).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f8fafc', fontSize: 13 }}>
          <span style={{ color: '#64748b' }}>{k}</span>
          <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

const S = {
  wrap: { maxWidth: 900, margin: '0 auto' },
  progress: { display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 },
  stepBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap', transition: 'all 0.15s' },
  stepActive: { background: '#1e293b', color: '#fff', borderColor: '#1e293b' },
  stepDone: { background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' },
  stepIcon: { fontSize: 16 },
  stepLabel: { fontWeight: 500 },
  form: { background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  title: { fontSize: 22, fontWeight: 700, margin: '0 0 4px' },
  subtitle: { fontSize: 15, color: '#64748b', margin: '0 0 24px', lineHeight: 1.5 },
  fields: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 },
  input: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' },
  etapasWrap: { display: 'flex', flexDirection: 'column', gap: 8 },
  etapaRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 10 },
  etapaNum: { width: 24, height: 24, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#64748b', flexShrink: 0 },
  etapaInput: { flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' },
  colorInput: { width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 0 },
  removeBtn: { background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16, padding: 4 },
  addEtapaBtn: { padding: 10, border: '2px dashed #cbd5e1', borderRadius: 10, background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 13 },
  channelGrid: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  channelBtn: { padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#64748b', transition: 'all 0.15s' },
  channelActive: { background: '#1e293b', color: '#fff', borderColor: '#1e293b' },
  toneGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 },
  toneBtn: { padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' },
  toneActive: { borderColor: '#6366f1', background: '#f5f3ff' },
  navBtns: { display: 'flex', gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid #f1f5f9' },
  backBtn: { padding: '12px 24px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#64748b' },
  nextBtn: { padding: '12px 32px', borderRadius: 12, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  submitBtn: { padding: '12px 32px', borderRadius: 12, border: 'none', background: '#16a34a', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  successCard: { background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, textAlign: 'left', marginBottom: 24 },
  sumCard: { background: '#f8fafc', borderRadius: 10, padding: 14 },
  sumTitle: { fontSize: 13, fontWeight: 700, color: '#6366f1', margin: '0 0 8px' },
  sumItem: { fontSize: 13, color: '#475569', padding: '2px 0' },
  configJson: { textAlign: 'left', background: '#0f172a', borderRadius: 12, padding: 16, marginBottom: 20 },
  pre: { color: '#e2e8f0', fontSize: 11, margin: 0, overflow: 'auto', maxHeight: 200, fontFamily: 'monospace' },
  copyBtn: { background: '#334155', border: 'none', color: '#e2e8f0', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  resetBtn: { padding: '12px 24px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#64748b' },
  reviewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 },
  reviewBlock: { background: '#f8fafc', borderRadius: 10, padding: 14 },
}
