import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import StatusBadge, { ServiceStatusBadge } from './StatusBadge'

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ProjectSummary({ project, onClose }) {
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`/api/deployments/${project.id}?limit=5`)
      .then((res) => res.json())
      .then((data) => {
        setDeployments(data.deployments || [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [project.id])

  const packageInfo = project.packageInfo || {}
  
  // 배포 타입에 따른 URL 결정
  const vercelUrl = project.summary?.aliases?.[0] || project.link?.origin
  let mainUrl = vercelUrl
  let showBoth = false
  
  if (packageInfo.deployType === 'local' && packageInfo.serviceUrl) {
    mainUrl = packageInfo.serviceUrl
  } else if (packageInfo.deployType === 'both' && packageInfo.serviceUrl) {
    mainUrl = packageInfo.serviceUrl
    showBoth = true
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            {packageInfo.icon && (
              <span className="text-2xl">{packageInfo.icon}</span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-semibold text-lg">{project.name}</h2>
                <ServiceStatusBadge status={packageInfo.serviceStatus} />
              </div>
              <div className="flex items-center gap-3 mt-1">
                {mainUrl && (
                  <a
                    href={`https://${mainUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {mainUrl}
                  </a>
                )}
                {showBoth && vercelUrl && vercelUrl !== mainUrl && (
                  <a
                    href={`https://${vercelUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    Vercel: {vercelUrl}
                  </a>
                )}
              </div>
            </div>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* PackageInfo 내용 */}
          {packageInfo.markdown ? (
            <div className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-5">
              <ReactMarkdown
                className="prose prose-invert prose-sm max-w-none"
                components={{
                  h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold text-white mb-3 mt-6">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-semibold text-white mb-2 mt-4">{children}</h3>,
                  p: ({ children }) => <p className="text-gray-300 leading-relaxed mb-3">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 space-y-1 mb-3">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 space-y-1 mb-3">{children}</ol>,
                  li: ({ children }) => <li className="text-gray-300">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-gray-700/50 px-1.5 py-0.5 rounded text-gray-200 text-sm">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-700/50 p-4 rounded-lg overflow-x-auto mb-4">
                      {children}
                    </pre>
                  ),
                  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                }}
              >
                {packageInfo.markdown}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              packageinfo.md 파일이 없습니다
            </div>
          )}

          {/* 최근 배포 히스토리 */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">최근 배포</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-400 text-sm">{error}</div>
            ) : deployments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">배포 기록이 없습니다</div>
            ) : (
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
    </div>
  )
}
