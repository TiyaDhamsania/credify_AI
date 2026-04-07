import { useEffect, useState } from 'react'

const SCORE_MIN = 300
const SCORE_MAX = 900
const RADIUS    = 72
const CIRC      = 2 * Math.PI * RADIUS
const ARC_PCT   = 0.75  // 270° arc

function scoreToColor(score) {
  if (score >= 750) return '#C8F04D'   // lime — great
  if (score >= 650) return '#5EBBF0'   // sky — ok
  if (score >= 550) return '#FFBB33'   // amber — caution
  return '#FF6B6B'                      // coral — poor
}

function scoreLabel(score) {
  if (score >= 750) return 'Excellent'
  if (score >= 650) return 'Good'
  if (score >= 550) return 'Fair'
  return 'Poor'
}

export default function ScoreRing({ score }) {
  const [animated, setAnimated] = useState(SCORE_MIN)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 100)
    return () => clearTimeout(t)
  }, [score])

  const pct    = (animated - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)
  const arcLen = CIRC * ARC_PCT
  const offset = arcLen - pct * arcLen
  const color  = scoreToColor(score)
  const label  = scoreLabel(score)

  // SVG rotation: start at -225deg (bottom-left) sweep to bottom-right
  const rotate = -225

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>

        <g transform={`rotate(${rotate}, 100, 100)`}>
          {/* Track */}
          <circle
            cx="100" cy="100" r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="12"
            strokeDasharray={`${arcLen} ${CIRC}`}
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle
            cx="100" cy="100" r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${arcLen} ${CIRC}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${color}60)` }}
          />
        </g>

        {/* Score value */}
        <text x="100" y="92" textAnchor="middle" fill="#F2F3F7" fontSize="36" fontWeight="700" fontFamily="Sora, sans-serif">
          {Math.round(animated)}
        </text>
        <text x="100" y="114" textAnchor="middle" fill={color} fontSize="13" fontWeight="600" fontFamily="Sora, sans-serif">
          {label}
        </text>
        <text x="100" y="132" textAnchor="middle" fill="rgba(148,153,176,0.8)" fontSize="11" fontFamily="Sora, sans-serif">
          Credit Score
        </text>
      </svg>

      {/* Range labels */}
      <div className="flex justify-between w-44 text-[10px] text-text-muted font-mono">
        <span>300</span><span>600</span><span>900</span>
      </div>
    </div>
  )
}
