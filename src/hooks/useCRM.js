import { useState, useCallback, useMemo } from 'react'
import {
  DEMO_MODE, DEMO_STAGES, DEMO_DEALS, DEMO_ACTIVITIES,
  DEMO_CONTACTS, DEMO_COMPANIES, DEMO_TIMELINE, DEMO_BI_INSIGHTS
} from '../data/supabase.js'

export function useCRM() {
  const [clientConfig, setClientConfig] = useState(null)

  const stages = useMemo(() => {
    if (!clientConfig?.etapas?.length) return DEMO_STAGES
    return clientConfig.etapas.map((e, i) => ({
      id: i + 1, name: e.nombre, color: e.color, position: i,
      is_won: e.nombre.toLowerCase().includes('ganad'),
      is_lost: e.nombre.toLowerCase().includes('perdid'),
      probability: Math.round(((i + 1) / clientConfig.etapas.length) * 100),
    }))
  }, [clientConfig])

  const [deals, setDeals] = useState(DEMO_DEALS)
  const [activities, setActivities] = useState(DEMO_ACTIVITIES)
  const [contacts] = useState(DEMO_CONTACTS)
  const [companies] = useState(DEMO_COMPANIES)
  const [timeline, setTimeline] = useState(DEMO_TIMELINE)
  const [biInsights] = useState(DEMO_BI_INSIGHTS)

  const moveDeal = useCallback((dealId, newStageId) => {
    setDeals(prev => prev.map(d =>
      d.id === dealId
        ? { ...d, stage_id: newStageId, probability: stages.find(s => s.id === newStageId)?.probability || d.probability }
        : d
    ))
  }, [stages])

  const toggleActivity = useCallback((actId) => {
    setActivities(prev => prev.map(a =>
      a.id === actId ? { ...a, done: !a.done, done_at: !a.done ? new Date().toISOString() : null } : a
    ))
  }, [])

  const addDeal = useCallback((deal) => {
    setDeals(prev => [...prev, { ...deal, id: Math.max(0, ...prev.map(d => d.id)) + 1, created_at: new Date().toISOString() }])
  }, [])

  const addActivity = useCallback((activity) => {
    setActivities(prev => [...prev, { ...activity, id: Math.max(0, ...prev.map(a => a.id)) + 1 }])
  }, [])

  const addTimelineEntry = useCallback((entry) => {
    setTimeline(prev => [...prev, { ...entry, id: Math.max(0, ...prev.map(t => t.id)) + 1, created_at: new Date().toISOString() }])
  }, [])

  const stats = useMemo(() => {
    const open = deals.filter(d => {
      const st = stages.find(s => s.id === d.stage_id)
      return st && !st.is_won && !st.is_lost
    })
    const won = deals.filter(d => stages.find(s => s.id === d.stage_id)?.is_won)
    const lost = deals.filter(d => stages.find(s => s.id === d.stage_id)?.is_lost)
    const pipelineValue = open.reduce((s, d) => s + (d.amount || 0), 0)
    const wonValue = won.reduce((s, d) => s + (d.amount || 0), 0)
    const weightedValue = open.reduce((s, d) => s + (d.amount || 0) * (d.probability || 0) / 100, 0)
    const pendingActivities = activities.filter(a => !a.done)
    const overdueActivities = pendingActivities.filter(a => a.due_date && new Date(a.due_date) < new Date())
    return { open, won, lost, pipelineValue, wonValue, weightedValue, pendingActivities, overdueActivities, totalDeals: deals.length }
  }, [deals, activities, stages])

  return {
    stages, deals, activities, contacts, companies, timeline, biInsights,
    moveDeal, toggleActivity, addDeal, addActivity, addTimelineEntry,
    stats, demoMode: DEMO_MODE,
    clientConfig, setClientConfig
  }
}
