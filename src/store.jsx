import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const PLANS = {
  free: { name: 'Free', limit: 5, price: 0 },
  pro: { name: 'Pro', limit: 100, price: 19 },
  business: { name: 'Business', limit: 1000, price: 99 },
  enterprise: { name: 'Enterprise', limit: Infinity, price: null },
}

const load = (k, d) => {
  try {
    const v = localStorage.getItem(k)
    return v ? JSON.parse(v) : d
  } catch {
    return d
  }
}
const save = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
    return true
  } catch {
    return false
  }
}
const today = () => new Date().toISOString().slice(0, 10)

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [theme, setTheme] = useState(() => load('dv.theme.v2', 'light'))
  const [user, setUser] = useState(() => load('dv.user', null))
  const [plan, setPlan] = useState(() => load('dv.plan', 'free'))
  const [usage, setUsage] = useState(() => {
    const u = load('dv.usage', null)
    return u && u.date === today() ? u : { date: today(), count: 0 }
  })
  const [history, setHistory] = useState(() => load('dv.history', []))
  const [modal, setModal] = useState(null) // 'login' | 'upgrade' | null
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    save('dv.theme.v2', theme)
  }, [theme])
  useEffect(() => void save('dv.user', user), [user])
  useEffect(() => void save('dv.plan', plan), [plan])
  useEffect(() => void save('dv.usage', usage), [usage])

  const toast = useCallback((msg, tone = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, msg, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }, [])

  const limit = PLANS[plan].limit
  const remaining = Math.max(0, limit - usage.count)

  const consume = useCallback(
    (n = 1) => {
      if (limit - usage.count < n) {
        setModal('upgrade')
        return false
      }
      setUsage((u) => ({ date: today(), count: (u.date === today() ? u.count : 0) + n }))
      return true
    },
    [limit, usage.count]
  )

  const refund = useCallback((n = 1) => setUsage((u) => ({ ...u, count: Math.max(0, u.count - n) })), [])

  const addReport = useCallback((r) => {
    setHistory((h) => {
      let next = [r, ...h.filter((x) => x.id !== r.id)].slice(0, 12)
      if (!save('dv.history', next)) {
        // storage full: keep the newest entries without heavy previews
        next = next.map((x, i) => (i < 3 ? x : { ...x, preview: null, frames: x.frames?.map((f) => ({ ...f, thumb: null })) }))
        if (!save('dv.history', next)) save('dv.history', next.slice(0, 3))
      }
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    save('dv.history', [])
  }, [])

  const value = useMemo(
    () => ({
      theme, setTheme, user, setUser, plan, setPlan, usage, limit, remaining, consume, refund,
      history, addReport, clearHistory, modal, setModal, toast,
    }),
    [theme, user, plan, usage, limit, remaining, consume, refund, history, addReport, clearHistory, modal, toast]
  )

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={'toast ' + t.tone}>{t.msg}</div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
