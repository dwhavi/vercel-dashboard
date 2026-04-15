const STATES = {
  READY: { label: 'Ready', color: 'bg-emerald-500', textColor: 'text-emerald-400', dot: 'bg-emerald-400' },
  BUILDING: { label: 'Building', color: 'bg-amber-500', textColor: 'text-amber-400', dot: 'bg-amber-400' },
  ERROR: { label: 'Error', color: 'bg-red-500', textColor: 'text-red-400', dot: 'bg-red-400' },
  CANCELED: { label: 'Canceled', color: 'bg-gray-500', textColor: 'text-gray-400', dot: 'bg-gray-400' },
  QUEUED: { label: 'Queued', color: 'bg-blue-500', textColor: 'text-blue-400', dot: 'bg-blue-400' },
  INITIALIZING: { label: 'Initializing', color: 'bg-blue-500', textColor: 'text-blue-400', dot: 'bg-blue-400' },
  NONE: { label: 'No Deploy', color: 'bg-gray-600', textColor: 'text-gray-500', dot: 'bg-gray-600' },
}

export function getStatusInfo(state) {
  if (!state) return STATES.NONE
  const key = state.toUpperCase()
  return STATES[key] || STATES.NONE
}

export default function StatusBadge({ state }) {
  const info = getStatusInfo(state)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${info.color}/15 ${info.textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${info.dot} ${state === 'BUILDING' || state === 'INITIALIZING' ? 'animate-pulse' : ''}`} />
      {info.label}
    </span>
  )
}
