import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  CheckCircle2, XCircle, ChevronDown, ChevronUp,
  TrendingUp, RotateCcw, Share2, ArrowRight,
} from 'lucide-react'
import ScoreRing      from '../components/ScoreRing'
import WhatIfSimulator from '../components/WhatIfSimulator'

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
})

function ImpactBar({ shap_val }) {
  const pct = Math.min(Math.abs(shap_val) * 800, 100)
  const pos  = shap_val <= 0
  return (
    <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${pos ? 'bg-lime' : 'bg-coral'}`}
        style={{ width: `${pct}%`, transition: 'width 1s ease' }}
      />
    </div>
  )
}

export default function Result() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const [showAdv, setShowAdv] = useState(false)
  const [showWhatIf, setShowWhatIf] = useState(false)

  // Guard: if no result, bounce back
  if (!state?.result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-text-secondary">No result found. Please complete the assessment first.</p>
        <Link to="/apply" className="btn-primary">Start Assessment <ArrowRight size={14} /></Link>
      </div>
    )
  }

  const { result, input } = state
  const approved  = result.decision === 'approve'
  const score     = result.risk_score
  const rate      = result.interest_rate
  const exps      = result.explanation   || []
  const imprv     = result.improvements  || []

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-5xl mx-auto px-4 py-10 w-full"
    >
      {/* ── Decision banner ── */}
      <motion.div {...fadeUp(0)} className={`card mb-6 relative overflow-hidden ${
        approved
          ? 'border-lime/25 bg-gradient-to-br from-lime/5 via-card to-card'
          : 'border-coral/25 bg-gradient-to-br from-coral/5 via-card to-card'
      }`}>
        <div className={`absolute inset-0 blur-3xl opacity-20 pointer-events-none ${
          approved ? 'bg-lime' : 'bg-coral'
        }`} style={{ borderRadius: 'inherit' }} />

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 ${
            approved ? 'bg-lime/15 text-lime' : 'bg-coral/15 text-coral'
          }`}>
            {approved
              ? <CheckCircle2 size={32} strokeWidth={1.8} />
              : <XCircle      size={32} strokeWidth={1.8} />
            }
          </div>

          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${approved ? 'text-lime' : 'text-coral'}`}>
              {approved ? 'Congratulations' : 'Application Declined'}
            </p>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-text-primary">
              {approved ? 'Loan Approved' : 'Not Approved'}
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              {approved
                ? `You qualify for this loan at a rate of ${rate}% p.a.`
                : 'Based on the information provided, we cannot approve this loan right now.'}
            </p>
          </div>

          {/* Rate badge */}
          {approved && (
            <div className="text-center shrink-0">
              <div className="font-display font-bold text-4xl text-lime">{rate}%</div>
              <div className="text-xs text-text-muted uppercase tracking-wide">p.a. Interest Rate</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Two-column layout ── */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Left: Score ring + key metrics */}
        <motion.div {...fadeUp(0.1)} className="card flex flex-col items-center gap-6">
          <ScoreRing score={score} />

          <div className="w-full grid grid-cols-2 gap-3">
            {[
              { label: 'Risk Probability', value: `${(result.probability * 100).toFixed(1)}%` },
              { label: 'Interest Rate',    value: approved ? `${rate}% p.a.` : 'N/A' },
              { label: 'Score Band',       value: score >= 750 ? 'Excellent' : score >= 650 ? 'Good' : score >= 550 ? 'Fair' : 'Poor' },
              { label: 'Decision',         value: approved ? 'Approved ✓' : 'Declined ✗' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate rounded-2xl px-3 py-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">{label}</p>
                <p className="font-semibold text-text-primary text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Retake */}
          <button
            onClick={() => navigate('/apply')}
            className="btn-ghost w-full justify-center text-sm"
          >
            <RotateCcw size={14} /> New Application
          </button>
        </motion.div>

        {/* Right: SHAP explanations */}
        <motion.div {...fadeUp(0.15)} className="card">
          <h2 className="font-semibold text-text-primary mb-1">Why this decision?</h2>
          <p className="text-xs text-text-secondary mb-5">
            These are the top factors our model considered, powered by SHAP explainability.
          </p>

          <div className="space-y-3">
            {exps.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.45 }}
                className={`flex items-start gap-3 p-3 rounded-2xl border ${
                  exp.direction === 'positive'
                    ? 'bg-lime/5 border-lime/15'
                    : 'bg-coral/5 border-coral/15'
                }`}
              >
                <span className="text-base shrink-0 mt-0.5">
                  {exp.direction === 'positive' ? '✅' : '⚠️'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary leading-snug">{exp.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <ImpactBar shap_val={exp.shap_val} />
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                      exp.impact === 'high' ? 'text-text-primary' : 'text-text-muted'
                    }`}>{exp.impact} impact</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Advanced details toggle */}
          <button
            onClick={() => setShowAdv(v => !v)}
            className="w-full flex items-center justify-between mt-4 pt-4 border-t border-edge text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Advanced Details {showAdv ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showAdv && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-1 font-mono text-xs text-text-muted">
                <p>Model: Random Forest (300 estimators)</p>
                <p>Default Probability: {(result.probability * 100).toFixed(2)}%</p>
                <p>Score Formula: 300 + (1 − p) × 600</p>
                <p>Explainability: SHAP TreeExplainer</p>
                {exps.map(e => (
                  <p key={e.text}>
                    {e.text.slice(0, 30)}… → SHAP: {e.shap_val > 0 ? '+' : ''}{e.shap_val}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Improvements ── */}
      {imprv.length > 0 && (
        <motion.div {...fadeUp(0.25)} className="card mt-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-sky" />
            <h2 className="font-semibold text-text-primary">Improve Your Score</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {imprv.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 bg-slate/60 rounded-2xl px-4 py-3">
                <p className="text-sm text-text-secondary leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── What-If Simulator ── */}
      <motion.div {...fadeUp(0.3)} className="mt-6">
        <button
          onClick={() => setShowWhatIf(v => !v)}
          className="btn-ghost w-full justify-center mb-4"
        >
          <Share2 size={14} />
          {showWhatIf ? 'Hide' : 'Open'} What-If Simulator
          {showWhatIf ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showWhatIf && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <WhatIfSimulator baseInput={input} baseScore={score} />
          </motion.div>
        )}
      </motion.div>
    </motion.main>
  )
}
