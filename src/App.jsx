import { useState, useEffect, useCallback } from 'react'
import ProjectCard from './components/ProjectCard'
import DeploymentList from './components/DeploymentList'

const POLL_INTERVAL = 30000

export default function App() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchProjects = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true)
    try {
      const res = await fetch('/api/projects')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setProjects(data.projects || [])
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const readyCount = projects.filter(
    (p) => p.latestDeployment?.state === 'READY'
  ).length
  const buildingCount = projects.filter(
    (p) => ['BUILDING', 'INITIALIZING', 'QUEUED'].includes(p.latestDeployment?.state)
  ).length
  const errorCount = projects.filter(
    (p) => p.latestDeployment?.state === 'ERROR'
  ).length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L24 22H0L12 1Z" />
                </svg>
                Vercel Dashboard
              </h1>
              <p className="text-gray-500 text-sm mt-1">프로젝트 배포 현황</p>
            </div>
            <button
              onClick={() => fetchProjects(true)}
              disabled={isRefreshing}
              className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all disabled:opacity-50"
              title="새로고침"
            >
              <svg
                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-5 flex gap-4 text-sm">
            <span className="text-gray-400">
              전체 <span className="text-white font-medium">{projects.length}</span>
            </span>
            <span className="text-gray-400">
              <span className="text-emerald-400 font-medium">{readyCount}</span> 정상
            </span>
            {buildingCount > 0 && (
              <span className="text-gray-400">
                <span className="text-amber-400 font-medium">{buildingCount}</span> 빌드중
              </span>
            )}
            {errorCount > 0 && (
              <span className="text-gray-400">
                <span className="text-red-400 font-medium">{errorCount}</span> 에러
              </span>
            )}
            {lastUpdated && (
              <span className="text-gray-600 ml-auto">
                {lastUpdated.toLocaleTimeString('ko-KR')} 업데이트
              </span>
            )}
          </div>
        </header>

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="text-red-400 text-sm">API 연결 오류: {error}</p>
            <p className="text-gray-500 text-xs mt-2">.env에 VERCEL_TOKEN이 설정되어 있는지 확인하세요</p>
            <button
              onClick={() => fetchProjects(true)}
              className="mt-3 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">프로젝트가 없습니다</p>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={setSelectedProject}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        {!loading && (
          <footer className="mt-12 text-center text-gray-700 text-xs">
            마지막 업데이트: {lastUpdated?.toLocaleTimeString('ko-KR')}
          </footer>
        )}
      </div>

      {/* Deployment Modal */}
      {selectedProject && (
        <DeploymentList
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  )
}
