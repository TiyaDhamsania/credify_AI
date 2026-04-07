import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, Eye, TrendingUp, CheckCircle2, Lock } from 'lucide-react'

const fadeUp = (delay = 0) => ({
  initial:   { opacity: 0, y: 32 },
  animate:   { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

const STATS = [
  { value: '< 2s',   label: 'Decision time' },
  { value: '97.3%',  label: 'Model accuracy' },
  { value: '50K+',   label: 'Applications processed' },
  { value: 'ISO 27001', label: 'Certified' },
]

const FEATURES = [
  {
    icon: <Zap size={20} />,
    title: 'Instant AI Assessment',
    desc:  'Get a credit decision in under 2 seconds powered by a Random Forest model trained on real lending data.',
  },
  {
    icon: <Eye size={20} />,
    title: 'Explainable Decisions',
    desc:  'Every decision comes with plain-English SHAP explanations — no black-box outcomes.',
  },
  {
    icon: <Shield size={20} />,
    title: 'Risk-Calibrated Rates',
    desc:  'Interest rates are dynamically mapped to your risk score, not one-size-fits-all.',
  },
  {
    icon: <TrendingUp size={20} />,
    title: 'Improve Your Score',
    desc:  'Personalised tips show exactly what to change to get a better outcome next time.',
  },
]

const TRUST = [
  'Bank-grade 256-bit encryption',
  'No hard credit pull',
  'DPDP Act compliant',
  'Zero data sold to third parties',
]

export default function Landing() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-lime/5 blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-sky/5 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          {/* Pill badge */}
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 mb-8">
            <span className="chip bg-lime/10 text-lime border border-lime/20">
              <Zap size={10} /> Powered by Explainable AI
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="font-display font-bold text-5xl md:text-7xl text-text-primary leading-[1.05] tracking-tight mb-6"
          >
            Credit decisions
            <br />
            <span className="text-lime">you can understand.</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="max-w-xl mx-auto text-text-secondary text-lg leading-relaxed mb-10"
          >
            Credify AI combines machine learning with SHAP explainability to deliver
            instant, fair, and transparent loan assessments — not a black box.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/apply" className="btn-primary text-base px-8 py-3.5 shadow-glow animate-pulse-lime">
              Check My Eligibility <ArrowRight size={16} />
            </Link>
            <Link to="/apply?demo=good" className="btn-ghost text-base px-8 py-3.5">
              Try Demo Data
            </Link>
          </motion.div>

          {/* Trust chips */}
          <motion.div {...fadeUp(0.4)} className="flex flex-wrap gap-3 justify-center mt-8">
            {TRUST.map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-text-muted">
                <CheckCircle2 size={12} className="text-lime" /> {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-edge/60 bg-slate/30">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="font-display font-bold text-3xl text-lime mb-1">{s.value}</div>
              <div className="text-xs text-text-secondary uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-text-primary mb-3">
            Built for transparency
          </h2>
          <p className="text-text-secondary max-w-md mx-auto">
            Every component of Credify AI is designed with borrowers — not just lenders — in mind.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.55 }}
              className="card group hover:border-lime/20 transition-all duration-300 hover:shadow-glow flex gap-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-lime/10 text-lime flex items-center justify-center shrink-0 group-hover:bg-lime/20 transition-colors">
                {f.icon}
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="card relative overflow-hidden text-center py-14"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-lime/5 via-transparent to-sky/5 pointer-events-none" />
          <Lock size={32} className="text-lime mx-auto mb-4" />
          <h2 className="font-display font-bold text-3xl text-text-primary mb-3">
            Ready to get your decision?
          </h2>
          <p className="text-text-secondary mb-8 max-w-sm mx-auto">
            Takes 60 seconds. No credit pull. No hidden fees. Just an honest AI assessment.
          </p>
          <Link to="/apply" className="btn-primary px-10 py-4 text-base shadow-glow">
            Start Application <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>
    </motion.main>
  )
}
