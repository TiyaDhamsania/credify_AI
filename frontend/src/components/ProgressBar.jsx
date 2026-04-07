export default function ProgressBar({ current, total, steps }) {
  const pct = Math.round(((current) / total) * 100)

  return (
    <div className="mb-8">
      {/* Step labels */}
      <div className="flex justify-between mb-3">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`flex flex-col items-center gap-1 flex-1 ${
              i < current ? 'opacity-100' : i === current ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                i < current
                  ? 'bg-lime border-lime text-ink'
                  : i === current
                  ? 'bg-transparent border-lime text-lime'
                  : 'bg-transparent border-edge text-text-muted'
              }`}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-wider text-text-secondary whitespace-nowrap">
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Bar */}
      <div className="progress-track h-1.5 rounded-full overflow-hidden">
        <div className="progress-fill h-full" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-text-muted">Step {current + 1} of {total}</span>
        <span className="text-xs font-mono text-lime">{pct}% complete</span>
      </div>
    </div>
  )
}
