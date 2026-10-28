import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = url ? createClient(url, key) : null

export const DEMO_MODE = !url

// ── Demo data for running without Supabase ──────────────────────────────────
export const DEMO_STAGES = [
  { id: 1, name: 'Nuevo',       position: 0, probability: 10, color: '#6366f1', is_won: false, is_lost: false },
  { id: 2, name: 'Calificado',  position: 1, probability: 30, color: '#8b5cf6', is_won: false, is_lost: false },
  { id: 3, name: 'Propuesta',   position: 2, probability: 60, color: '#a855f7', is_won: false, is_lost: false },
  { id: 4, name: 'Negociación', position: 3, probability: 80, color: '#d946ef', is_won: false, is_lost: false },
  { id: 5, name: 'Ganado',      position: 4, probability: 100, color: '#22c55e', is_won: true,  is_lost: false },
  { id: 6, name: 'Perdido',     position: 5, probability: 0,   color: '#ef4444', is_won: false, is_lost: true  },
]

export const DEMO_DEALS = [
  { id: 1, title: 'Rediseño web corporativo', company_name: 'Grupo Torres', contact_name: 'María Torres', stage_id: 1, amount: 45000, currency: 'MXN', probability: 10, expected_close: '2026-11-15', source: 'referral', tags: ['web'], created_at: '2026-10-20T10:00:00Z' },
  { id: 2, title: 'Sistema de inventarios', company_name: 'Distribuidora Norte', contact_name: 'Carlos Ruiz', stage_id: 2, amount: 120000, currency: 'MXN', probability: 30, expected_close: '2026-11-30', source: 'cold', tags: ['software'], created_at: '2026-10-15T10:00:00Z' },
  { id: 3, title: 'App de delivery', company_name: 'Restaurantes MX', contact_name: 'Ana Vega', stage_id: 3, amount: 85000, currency: 'MXN', probability: 60, expected_close: '2026-12-01', source: 'web', tags: ['app', 'mobile'], created_at: '2026-10-10T10:00:00Z' },
  { id: 4, title: 'CRM personalizado', company_name: 'Inmobiliaria del Pacífico', contact_name: 'Roberto Paz', stage_id: 3, amount: 200000, currency: 'MXN', probability: 60, expected_close: '2026-12-15', source: 'event', tags: ['crm'], created_at: '2026-10-05T10:00:00Z' },
  { id: 5, title: 'E-commerce premium', company_name: 'Boutique Lina', contact_name: 'Lina Morales', stage_id: 4, amount: 95000, currency: 'MXN', probability: 80, expected_close: '2026-11-10', source: 'referral', tags: ['ecommerce'], created_at: '2026-09-28T10:00:00Z' },
  { id: 6, title: 'Automatización WhatsApp', company_name: 'Clínica Salud+', contact_name: 'Dr. Méndez', stage_id: 5, amount: 35000, currency: 'MXN', probability: 100, expected_close: '2026-10-25', source: 'web', tags: ['automation'], created_at: '2026-09-20T10:00:00Z' },
  { id: 7, title: 'Landing de campaña', company_name: 'Eventos GDL', contact_name: 'Sofía Luna', stage_id: 6, amount: 18000, currency: 'MXN', probability: 0, expected_close: '2026-10-20', source: 'ad', lost_reason: 'Presupuesto', tags: ['landing'], created_at: '2026-09-15T10:00:00Z' },
  { id: 8, title: 'Dashboard analytics', company_name: 'Logística Express', contact_name: 'Juan Herrera', stage_id: 2, amount: 65000, currency: 'MXN', probability: 30, expected_close: '2026-12-20', source: 'cold', tags: ['dashboard', 'data'], created_at: '2026-10-22T10:00:00Z' },
]

export const DEMO_ACTIVITIES = [
  { id: 1, deal_id: 1, type: 'call', title: 'Llamada de discovery', due_date: '2026-10-29T15:00:00Z', done: false },
  { id: 2, deal_id: 2, type: 'email', title: 'Enviar propuesta técnica', due_date: '2026-10-28T10:00:00Z', done: false },
  { id: 3, deal_id: 3, type: 'meeting', title: 'Demo del prototipo', due_date: '2026-10-30T17:00:00Z', done: false },
  { id: 4, deal_id: 5, type: 'task', title: 'Preparar contrato', due_date: '2026-10-28T12:00:00Z', done: false },
  { id: 5, deal_id: 4, type: 'whatsapp', title: 'Seguimiento cotización', due_date: '2026-10-29T09:00:00Z', done: false },
  { id: 6, deal_id: 6, type: 'call', title: 'Onboarding kick-off', due_date: '2026-10-26T11:00:00Z', done: true, done_at: '2026-10-26T11:30:00Z' },
]

export const DEMO_CONTACTS = [
  { id: 1, company_id: 1, first_name: 'María', last_name: 'Torres', email: 'maria@grupotorres.mx', phone: '+52 33 1234 5678', position: 'Directora General', is_primary: true },
  { id: 2, company_id: 2, first_name: 'Carlos', last_name: 'Ruiz', email: 'carlos@distnorte.mx', phone: '+52 81 2345 6789', position: 'Gerente de Operaciones', is_primary: true },
  { id: 3, company_id: 3, first_name: 'Ana', last_name: 'Vega', email: 'ana@restaurantesmx.com', phone: '+52 55 3456 7890', position: 'CEO', is_primary: true },
  { id: 4, company_id: 4, first_name: 'Roberto', last_name: 'Paz', email: 'roberto@inmopacifico.mx', phone: '+52 669 456 7890', position: 'Director Comercial', is_primary: true },
  { id: 5, company_id: 5, first_name: 'Lina', last_name: 'Morales', email: 'lina@boutiquelina.com', phone: '+52 33 5678 1234', position: 'Fundadora', is_primary: true },
  { id: 6, company_id: 6, first_name: 'Dr. Héctor', last_name: 'Méndez', email: 'hector@clinicasalud.mx', phone: '+52 33 6789 2345', position: 'Director', is_primary: true },
]

export const DEMO_COMPANIES = [
  { id: 1, name: 'Grupo Torres', industry: 'Consultoría', size: 'medium', city: 'Guadalajara', state: 'Jalisco' },
  { id: 2, name: 'Distribuidora Norte', industry: 'Logística', size: 'large', city: 'Monterrey', state: 'Nuevo León' },
  { id: 3, name: 'Restaurantes MX', industry: 'Alimentos', size: 'medium', city: 'CDMX', state: 'CDMX' },
  { id: 4, name: 'Inmobiliaria del Pacífico', industry: 'Real Estate', size: 'medium', city: 'Mazatlán', state: 'Sinaloa' },
  { id: 5, name: 'Boutique Lina', industry: 'Retail', size: 'small', city: 'Guadalajara', state: 'Jalisco' },
  { id: 6, name: 'Clínica Salud+', industry: 'Salud', size: 'small', city: 'Guadalajara', state: 'Jalisco' },
  { id: 7, name: 'Eventos GDL', industry: 'Eventos', size: 'micro', city: 'Guadalajara', state: 'Jalisco' },
  { id: 8, name: 'Logística Express', industry: 'Logística', size: 'medium', city: 'Querétaro', state: 'Querétaro' },
]
