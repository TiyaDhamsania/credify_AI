import { useState } from 'react'
import { Loader2, RefreshCw, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'

const SLIDERS = [
  { name: 'income',           label: 'Annual Income',    prefix: '₹', step: 10000,  min: 10000,  max: 2000000 },
  { name: 'loan_amount',      label: 'Loan Amount',      prefix: '₹', step: 10000,  min: 10000,  max: 5000000 },
  { name: 'debt_to_income',   label: 'DTI Ratio',        prefix: '',  step: 0.01,   min: 0,      max: 3       },
  { name: 'cibil_score',      label: 'CIBIL Score',      prefix: '',  step: 10,     min: 300,    max: 900     },
  { name: 'savings_balance',  label: 'Savings Balance',  prefix: '₹', step: 5000,   min: 0,      max: 1000000 },
  { name: 'collateral_value', label: 'Collateral Value', prefix: '₹', step: 50000,  min: 0,      max: 5000000 },
]

export default function WhatIfSimulator({ baseInput, baseScore }) {
  const [vals, setVals]     = useState({
    income:           Number(baseInput.income)           || 0,
    loan_amount:      Number(baseInput.loan_amount)      || 0,
    debt_to_income:   Number(baseInput.debt_to_income)   || 0,
    cibil_score:      Number(baseInput.cibil_score)      || 600,
    savings_balance:  Number(baseInput.savings_balance)  || 0,
    collateral_value: Number(baseInput.collateral_value) || 0,
  })
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSlider = (e) => {
    const { name, value } = e.target
    setVals(prev => ({ ...prev, [name]: Number(value) }))
    setResult(null)
  }

  const simulate = async () => {
    setLoading(true)
    try {
      const payload = {
        loan_amount:      vals.loan_amount,
        income:           vals.income,
        monthly_expenses: Number(baseInput.monthly_expenses) || 0,
        collateral_value: vals.collateral_value,
        debt_to_income:   vals.debt_to_income,
        savings_balance:  vals.savings_balance,
        cibil_score:      vals.cibil_score,
      }
      const res  = await fetch('/api/whatif', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      setResult(data)
    } catch { /* silent fail */ }
    finally  { setLoading(false) }
  }

  const delta    = result ? result.risk_score - baseScore : 0
  const improved = delta >= 0

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-2">
        <RefreshCw size={16} className="text-sky" />
        <h3 className="font-semibold text-text-primary">What-If Simulator</h3>
      </div>
      <p className="text-xs text-text-secondary mb-6">
        Drag the sliders to instantly see how changing your financials would affect your score.
      </p>

      <div className="space-y-5 mb-6">
        {SLIDERS.map(({ name, label, prefix, step, min, max }) => {
          const val = vals[name]
          const display = prefix === '₹'
            ? `₹${Number(val).toLocaleString('en-IN')}`
            : name === 'debt_to_income' ? Number(val).toFixed(2) : val

          return (
            <div key={name}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  {label}
                </label>
                <span className="font-mono text-sm text-lime font-semibold">{display}</span>
              </div>
              <input
                type="range"
                name={name}
                min={min}
                max={max}
                step={step}
                value={val}
                onChange={handleSlider}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-lime"
                style={{
                  background: `linear-gradient(to right, #C8F04D ${((val - min) / (max - min)) * 100}%, rgba(255,255,255,0.08) 0%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-1">
                <span>{prefix}{min.toLocaleString()}</span>
                <span>{prefix}{max.toLocaleString()}</span>
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={simulate}
        disabled={loading}
        className="btn-primary w-full justify-center mb-4"
      >
        {loading
          ? <><Loader2 size={14} className="animate-spin" /> Simulating…</>
          : <><ArrowRight size={14} /> Run Simulation</>
        }
      </button>

      {result && (
        <div className={`rounded-2xl p-4 border ${improved ? 'bg-lime/5 border-lime/20' : 'bg-coral/5 border-coral/20'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {improved
                ? <TrendingUp size={16} className="text-lime" />
                : <TrendingDown size={16} className="text-coral" />
              }
              <span className="text-sm font-semibold text-text-primary">Simulated Outcome</span>
            </div>
            <span className={`chip text-xs ${result.decision === 'approve' ? 'bg-lime/15 text-lime border border-lime/20' : 'bg-coral/15 text-coral border border-coral/20'}`}>
              {result.decision === 'approve' ? '✓ Approved' : '✗ Declined'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3">
            {[
              { label: 'New Score',     value: result.risk_score,    unit: '' },
              { label: 'Change',        value: (delta >= 0 ? '+' : '') + delta, unit: ' pts', highlight: true },
              { label: 'Rate',          value: result.decision === 'approve' ? result.interest_rate + '%' : 'N/A', unit: '' },
            ].map(({ label, value, unit, highlight }) => (
              <div key={label} className="text-center">
                <p className="text-[10px] text-text-muted uppercase tracking-wide mb-0.5">{label}</p>
                <p className={`font-bold text-lg ${highlight ? (improved ? 'text-lime' : 'text-coral') : 'text-text-primary'}`}>
                  {value}{unit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
