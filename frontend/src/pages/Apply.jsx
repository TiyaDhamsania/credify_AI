import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Sparkles, Loader2, AlertCircle, Zap } from 'lucide-react'
import ProgressBar from '../components/ProgressBar'

// ── Demo profiles ─────────────────────────────────────────────────────────────
const DEMO_GOOD = {
  AGE: '38', AMT_INCOME_TOTAL: '270000',
  YEARS_EMPLOYED: '9.5', EMPLOYMENT_TYPE: 'Salaried',
  CNT_FAM_MEMBERS: '3', CNT_CHILDREN: '1',
}
const DEMO_RISKY = {
  AGE: '24', AMT_INCOME_TOTAL: '67500',
  YEARS_EMPLOYED: '0.5', EMPLOYMENT_TYPE: 'Other',
  CNT_FAM_MEMBERS: '5', CNT_CHILDREN: '3',
}

const STEP_META = [
  { label: 'Personal',   icon: '👤' },
  { label: 'Employment', icon: '💼' },
  { label: 'Family',     icon: '👨‍👩‍👧' },
  { label: 'Review',     icon: '✅' },
]

const EMPLOYMENT_OPTIONS = ['Salaried', 'Self-Employed', 'Government', 'Pensioner', 'Student', 'Other']

// ── UI atoms ──────────────────────────────────────────────────────────────────
function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-xs text-coral flex items-center gap-1">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  )
}

function NumInput({ name, value, onChange, placeholder, min, max, step, prefix, suffix }) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-mono pointer-events-none select-none">{prefix}</span>
      )}
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step || 1}
        className={`input-field ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-14' : ''}`}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none select-none">{suffix}</span>
      )}
    </div>
  )
}

function SelectInput({ name, value, onChange, options }) {
  return (
    <div className="relative">
      <select name={name} value={value} onChange={onChange} className="select-field pr-10">
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-xs">▼</span>
    </div>
  )
}

// ── Step 1: Age + Income ──────────────────────────────────────────────────────
function Step1({ data, onChange, errors }) {
  return (
    <div className="space-y-6">
      <Field label="Your Age" hint="Age at time of application (18–70)" error={errors.AGE}>
        <NumInput
          name="AGE" value={data.AGE} onChange={onChange}
          placeholder="e.g. 35" min={18} max={70} suffix="yrs"
        />
      </Field>
      <Field label="Annual Income" hint="Your total yearly income from all sources, before tax" error={errors.AMT_INCOME_TOTAL}>
        <NumInput
          name="AMT_INCOME_TOTAL" value={data.AMT_INCOME_TOTAL} onChange={onChange}
          placeholder="e.g. 250000" min={0} prefix="₹"
        />
      </Field>
    </div>
  )
}

// ── Step 2: Employment ────────────────────────────────────────────────────────
function Step2({ data, onChange, errors }) {
  return (
    <div className="space-y-6">
      <Field label="Employment Type" hint="Choose what best describes your work situation" error={errors.EMPLOYMENT_TYPE}>
        <SelectInput
          name="EMPLOYMENT_TYPE" value={data.EMPLOYMENT_TYPE}
          onChange={onChange} options={EMPLOYMENT_OPTIONS}
        />
      </Field>

      {/* Employment type explainer */}
      <div className="bg-slate/50 border border-edge/40 rounded-2xl px-4 py-3">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">What do these mean?</p>
        <div className="space-y-1">
          {[
            ['Salaried',     'Fixed monthly salary from a private company'],
            ['Government',   'Central / state government or PSU employee'],
            ['Self-Employed','Business owner, freelancer, or contractor'],
            ['Pensioner',    'Receiving pension after retirement'],
            ['Student',      'Currently enrolled in education'],
            ['Other',        'Casual work, daily wages, or part-time'],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs">
              <span className="text-lime font-semibold w-28 shrink-0">{k}</span>
              <span className="text-text-muted">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <Field label="Years Employed" hint="How long you have been working in your current job or profession" error={errors.YEARS_EMPLOYED}>
        <NumInput
          name="YEARS_EMPLOYED" value={data.YEARS_EMPLOYED} onChange={onChange}
          placeholder="e.g. 5.5" min={0} max={50} step="0.5" suffix="yrs"
        />
      </Field>
    </div>
  )
}

// ── Step 3: Family ────────────────────────────────────────────────────────────
function Step3({ data, onChange, errors }) {
  const famMembers = parseInt(data.CNT_FAM_MEMBERS) || 0
  const children   = parseInt(data.CNT_CHILDREN)    || 0
  const mismatch   = children > famMembers && famMembers > 0

  return (
    <div className="space-y-6">
      <Field
        label="Total Family Members"
        hint="Everyone living in your household including yourself, spouse, children, parents"
        error={errors.CNT_FAM_MEMBERS}
      >
        <NumInput
          name="CNT_FAM_MEMBERS" value={data.CNT_FAM_MEMBERS} onChange={onChange}
          placeholder="e.g. 4" min={1} max={20} suffix="people"
        />
      </Field>

      <Field
        label="Number of Dependent Children"
        hint="Children who are financially dependent on you. Enter 0 if none."
        error={errors.CNT_CHILDREN}
      >
        <NumInput
          name="CNT_CHILDREN" value={data.CNT_CHILDREN} onChange={onChange}
          placeholder="e.g. 2" min={0} max={15}
        />
      </Field>

      {mismatch && (
        <p className="text-xs text-amber-400 flex items-center gap-1">
          <AlertCircle size={11} /> Children ({children}) cannot exceed total family members ({famMembers})
        </p>
      )}

      {/* Why this matters */}
      <div className="bg-slate/50 border border-edge/40 rounded-2xl px-4 py-3">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">💡 Why does this matter?</p>
        <p className="text-xs text-text-secondary leading-relaxed">
          Banks use family size and dependants to estimate your monthly obligations.
          A larger household relative to your income signals higher financial pressure
          and reduces disposable income available for EMI repayment.
        </p>
      </div>
    </div>
  )
}

// ── Step 4: Review ────────────────────────────────────────────────────────────
function Step4({ data }) {
  const LABELS = {
    AGE:              ['Your Age',            v => `${v} years`],
    AMT_INCOME_TOTAL: ['Annual Income',       v => `₹${Number(v).toLocaleString('en-IN')}`],
    EMPLOYMENT_TYPE:  ['Employment Type',     v => v],
    YEARS_EMPLOYED:   ['Years Employed',      v => `${v} years`],
    CNT_FAM_MEMBERS:  ['Family Members',      v => `${v} people`],
    CNT_CHILDREN:     ['Dependent Children',  v => v === '0' || v === 0 ? 'None' : v],
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Please review your details before submitting. Our AI will analyse these against
        real credit behaviour data from thousands of bank applicants.
      </p>

      <div className="card bg-slate/60 border-edge/50">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Your Application Summary
        </p>
        <div className="space-y-3">
          {Object.entries(LABELS).map(([key, [label, fmt]]) => (
            <div key={key} className="flex items-center justify-between border-b border-edge/30 pb-2 last:border-0 last:pb-0">
              <span className="text-sm text-text-muted">{label}</span>
              <span className="text-sm font-semibold text-text-primary">
                {data[key] !== '' && data[key] !== undefined ? fmt(data[key]) : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-lime/5 border border-lime/20 rounded-2xl px-4 py-3">
        <p className="text-xs text-lime font-semibold mb-1">🔍 How your score is calculated</p>
        <p className="text-xs text-text-secondary leading-relaxed">
          Our Random Forest model analyses your profile against real credit repayment patterns.
          SHAP explainability shows exactly which factor helped or hurt your application.
        </p>
      </div>
    </div>
  )
}

// ── Validation ────────────────────────────────────────────────────────────────
const VALIDATORS = [
  (d) => ({
    AGE:             (!d.AGE || Number(d.AGE) < 18 || Number(d.AGE) > 70) ? 'Age must be between 18 and 70'      : '',
    AMT_INCOME_TOTAL: (!d.AMT_INCOME_TOTAL || Number(d.AMT_INCOME_TOTAL) <= 0) ? 'Please enter your annual income' : '',
  }),
  (d) => ({
    EMPLOYMENT_TYPE: !d.EMPLOYMENT_TYPE    ? 'Please select your employment type'                : '',
    YEARS_EMPLOYED:  d.YEARS_EMPLOYED === '' ? 'Please enter years employed (enter 0 if new job)' : '',
  }),
  (d) => ({
    CNT_FAM_MEMBERS: (!d.CNT_FAM_MEMBERS || Number(d.CNT_FAM_MEMBERS) < 1) ? 'Please enter total family members (minimum 1 — yourself)' : '',
    CNT_CHILDREN:    d.CNT_CHILDREN === '' ? 'Please enter number of children (enter 0 if none)'                                         : '',
  }),
  () => ({}),   // review step — no validation needed
]

const INITIAL = {
  AGE: '', AMT_INCOME_TOTAL: '',
  EMPLOYMENT_TYPE: '', YEARS_EMPLOYED: '',
  CNT_FAM_MEMBERS: '', CNT_CHILDREN: '',
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Apply() {
  const navigate        = useNavigate()
  const [step, setStep]       = useState(0)
  const [data, setData]       = useState(INITIAL)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [direction, setDirection] = useState(1)

  const handleChange = (e) => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const fillDemo = (profile) => {
    setData(profile === 'good' ? DEMO_GOOD : DEMO_RISKY)
    setErrors({})
  }

  const validate = () => {
    const errs   = VALIDATORS[step](data)
    const hasErr = Object.values(errs).some(Boolean)
    setErrors(errs)
    return !hasErr
  }

  const goNext = () => { if (validate()) { setDirection(1);  setStep(s => s + 1) } }
  const goPrev = () => {                   setDirection(-1); setStep(s => s - 1)  }

  const submit = async () => {
    setLoading(true)
    setApiError('')

    const payload = {
      AGE:             Number(data.AGE),
      AMT_INCOME_TOTAL: Number(data.AMT_INCOME_TOTAL),
      YEARS_EMPLOYED:  Number(data.YEARS_EMPLOYED),
      EMPLOYMENT_TYPE: data.EMPLOYMENT_TYPE,
      CNT_FAM_MEMBERS: Number(data.CNT_FAM_MEMBERS),
      CNT_CHILDREN:    Number(data.CNT_CHILDREN),
    }

    try {
      const res  = await fetch('/api/predict', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Something went wrong')
      navigate('/result', { state: { result: json, input: data } })
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const STEPS = [
    <Step1 data={data} onChange={handleChange} errors={errors} />,
    <Step2 data={data} onChange={handleChange} errors={errors} />,
    <Step3 data={data} onChange={handleChange} errors={errors} />,
    <Step4 data={data} />,
  ]

  const slideV = {
    enter:  { x: direction * 60, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit:   { x: direction * -60, opacity: 0 },
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 max-w-2xl mx-auto w-full px-4 py-10"
    >
      <div className="text-center mb-10">
        <p className="text-xs font-bold text-lime uppercase tracking-widest mb-2">Loan Assessment</p>
        <h1 className="font-display font-bold text-3xl text-text-primary">
          {STEP_META[step].icon}&nbsp; {STEP_META[step].label}
        </h1>
        <p className="text-text-secondary text-sm mt-2 max-w-sm mx-auto">
          {step === 0 && 'Basic personal details to start your credit assessment.'}
          {step === 1 && 'Employment stability is the strongest predictor of repayment.'}
          {step === 2 && 'Family size helps us assess your monthly financial obligations.'}
          {step === 3 && 'Review and submit. Your AI-powered decision arrives instantly.'}
        </p>
      </div>

      <ProgressBar current={step} total={STEP_META.length} steps={STEP_META.map(s => s.label)} />

      <div className="flex items-center gap-2 mb-5 justify-end">
        <span className="text-xs text-text-muted">Quick fill:</span>
        <button
          onClick={() => fillDemo('good')}
          className="chip bg-lime/10 text-lime border border-lime/20 cursor-pointer hover:bg-lime/20 transition-colors py-1"
        >
          <Zap size={10} /> Strong Profile
        </button>
        <button
          onClick={() => fillDemo('risky')}
          className="chip bg-coral/10 text-coral border border-coral/20 cursor-pointer hover:bg-coral/20 transition-colors py-1"
        >
          ⚠ Risky Profile
        </button>
      </div>

      <div className="card overflow-hidden min-h-[300px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideV}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {STEPS[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {apiError && (
        <div className="mt-4 flex items-center gap-2 text-coral text-sm bg-coral/10 border border-coral/20 rounded-2xl px-4 py-3">
          <AlertCircle size={14} className="shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <div className="flex gap-3 mt-5">
        {step > 0 && (
          <button onClick={goPrev} className="btn-ghost flex-1">
            <ChevronLeft size={16} /> Back
          </button>
        )}
        {step < STEP_META.length - 1 ? (
          <button onClick={goNext} className="btn-primary flex-1">
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={submit} disabled={loading} className="btn-primary flex-1 justify-center">
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Analysing with AI…</>
              : <><Sparkles size={15} /> Get My Decision</>
            }
          </button>
        )}
      </div>

      <p className="text-center text-xs text-text-muted mt-4">
        🔒 Encrypted end-to-end. Based on real bank credit data. No bureau pull.
      </p>
    </motion.main>
  )
}
