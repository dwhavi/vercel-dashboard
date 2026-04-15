import { useState } from 'react'
import StatusBadge from './StatusBadge'

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function DeploymentList({ project, onClose }) {
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useState(() => {
    fetch(`/api/deployments/${project.id}?limit=15`)
      .then((res) => res.json())
      .then((data) => {
        setDeployments(data.deployments || [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  })

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-white font-semibold text-lg">{project.name}</h2>
            {project.link?.origin && (
              <a
                href={project.link.origin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {project.link.origin}
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-red-400 text-sm">{error}</div>
          )}

          {!loading && !error && deployments.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">배포 기록이 없습니다</div>
          )}

          {!loading && !error && deployments.length > 0 && (
            <div className="space-y-2">
              {deployments.map((dep) => (
                <div
                  key={dep.id}
                  className="flex items-center justify-between p-3 bg-gray-800/40 border border-gray-700/30 rounded-lg hover:bg-gray-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusBadge state={dep.state} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-mono truncate">{dep.id.slice(0, 8)}</span>
                        {dep.production && (
                          <span className="px-1 py-0.5 bg-blue-500/15 text-blue-400 text-[10px] rounded">PROD</span>
                        )}
                      </div>
                      {dep.meta?.branch && (
                        <span className="text-gray-500 text-xs">{dep.meta.branch}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-gray-500 text-xs">{formatDate(dep.createdAt)}</span>
                    {dep.url && (
                      <a
                        href={`https://${dep.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-500 hover:text-white transition-colors"
                        title="배포 미리보기"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
