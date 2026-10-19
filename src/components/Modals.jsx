import { useState } from 'react'
import Modal from './Modal.jsx'
import { PLANS, useStore } from '../store.jsx'
import { navigate } from '../router.jsx'

export function LoginModal() {
  const { setUser, setModal, toast } = useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter your name and a valid email address.')
    setUser({ name: name.trim(), email })
    setModal(null)
    toast('Signed in. Your account details are stored in this browser.', 'ok')
    navigate('/app/image')
  }
  return (
    <Modal title="Sign in to Pixpect" onClose={() => setModal(null)}>
      <p className="sub">Your sign-in details stay in this browser.</p>
      <form onSubmit={submit} className="form">
        <label htmlFor="lg-name">Name</label>
        <input id="lg-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        <label htmlFor="lg-email">Email</label>
        <input id="lg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        {err && <p className="err">{err}</p>}
        <button className="btn btn-primary" type="submit">Continue</button>
      </form>
    </Modal>
  )
}

export function UpgradeModal() {
  const { plan, setPlan, setModal, toast, usage } = useStore()
  const pick = (k) => {
    if (k === 'enterprise') {
      setModal(null)
      toast('Enterprise is custom. Contact sales to set it up.', 'info')
      return
    }
    setPlan(k)
    setModal(null)
    toast(`Switched to ${PLANS[k].name}. No payment was taken.`, 'ok')
  }
  return (
    <Modal title="You've used today's scans" onClose={() => setModal(null)}>
      <p className="sub">The {PLANS[plan].name} plan includes {PLANS[plan].limit} scans a day and you have used {usage.count}. Pick a plan to keep going.</p>
      <div className="plan-pick">
        {['pro', 'business', 'enterprise'].map((k) => (
          <button key={k} className="btn btn-outline" onClick={() => pick(k)}>
            <b>{PLANS[k].name}</b>
            <span>{k === 'enterprise' ? 'Custom' : `$${PLANS[k].price}/mo · ${PLANS[k].limit} scans a day`}</span>
          </button>
        ))}
      </div>
    </Modal>
  )
}
