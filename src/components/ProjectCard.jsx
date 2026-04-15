import { useState, useEffect } from 'react'
import StatusBadge from './StatusBadge'

function timeAgo(dateString) {
  if (!dateString) return '-'
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)
  if (seconds < 60) return '방금 전'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
  return `${Math.floor(seconds / 86400)}일 전`
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function shortenSha(sha) {
  if (!sha || sha.length < 8) return sha || ''
  return sha.slice(0, 7)
}

export default function ProjectCard({ project, onClick }) {
  const [time, setTime] = useState(timeAgo(project.summary?.lastDeployAt))
  const meta = project.meta || {}
  const summary = project.summary || {}

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(timeAgo(project.summary?.lastDeployAt))
    }, 60000)
    return () => clearInterval(interval)
  }, [project.summary?.lastDeployAt])

  const isBuilding = project.latestDeployment?.state === 'BUILDING' ||
                     project.latestDeployment?.state === 'INITIALIZING' ||
                     project.latestDeployment?.state === 'QUEUED'

  const productionUrl = summary.aliases?.[0] || project.link?.origin

  return (
    <div
      onClick={() => onClick(project)}
      className="group relative bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 hover:bg-gray-800/80 transition-all duration-200 cursor-pointer"
    >
      {isBuilding && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-amber-500 to-blue-500 animate-pulse rounded-t-xl" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-base truncate">{project.name}</h3>
            {project.framework && (
              <span className="shrink-0 px-1.5 py-0.5 bg-gray-700/50 text-gray-400 text-[10px] font-medium rounded">
                {project.framework}
              </span>
            )}
          </div>
        </div>
        <StatusBadge state={project.latestDeployment?.state} />
      </div>

      {/* Summary */}
      <div className="space-y-2 text-sm">
        {/* Readme Summary - 프로젝트 설명 */}
        {summary.readmeSummary ? (
          <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
            {summary.readmeSummary}
          </p>
        ) : meta.commitMessage ? (
          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
            {meta.commitMessage}
          </p>
        ) : (
          <p className="text-gray-600 text-xs">프로젝트 설명이 없습니다</p>
        )}

        {/* Commit info row */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {meta.branch && (
            <span className="inline-flex items-center gap-1 text-gray-500">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {meta.branch}
            </span>
          )}
          {meta.commitSha && (
            <span className="font-mono text-gray-600">{shortenSha(meta.commitSha)}</span>
          )}
          {meta.commitAuthor && (
            <span className="text-gray-600">{meta.commitAuthor}</span>
          )}
        </div>

        {/* GitHub repo */}
        {meta.githubOrg && meta.githubRepo && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>{meta.githubOrg}/{meta.githubRepo}</span>
          </div>
        )}

        {/* URL + Build time */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-700/30">
          {productionUrl && (
            <a
              href={`https://${productionUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors truncate text-xs"
            >
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
              </svg>
              <span className="truncate">{productionUrl}</span>
            </a>
          )}
          <div className="flex items-center gap-2 shrink-0">
            {summary.buildTime != null && (
              <span className="text-gray-600 text-[11px]">
                ⚡ {summary.buildTime < 1 ? '<1s' : `${Math.round(summary.buildTime)}s`}
              </span>
            )}
            {summary.lastDeployAt && (
              <span className="text-gray-600 text-[11px]">{time}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
