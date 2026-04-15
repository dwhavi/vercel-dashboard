import matter from 'gray-matter'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = process.env.VERCEL_TOKEN
  if (!token) {
    return res.status(500).json({ error: 'VERCEL_TOKEN not configured' })
  }

  const normalizeDate = (val) => {
    if (!val) return null
    if (typeof val === 'number') return new Date(val).toISOString()
    return val
  }

  const extractMeta = (meta) => {
    const m = meta || {}
    return {
      commitMessage: m.githubCommitMessage || m.gitCommitMessage || null,
      commitAuthor: m.githubCommitAuthorName || m.gitCommitAuthorName || null,
      branch: m.githubCommitRef || m.gitCommitRef || null,
      commitSha: m.githubCommitSha || m.gitCommitSha || null,
      githubRepo: m.githubRepo || null,
      githubOrg: m.githubOrg || null,
    }
  }

  // GitHub에서 packageinfo.md를 가져오는 함수
  const getPackageInfo = async (owner, repo) => {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/packageinfo.md`, {
        headers: {
          'Accept': 'application/vnd.github.v3.raw',
        },
      })
      
      if (!response.ok) return null
      
      const content = await response.text()
      const { data, content: mdContent } = matter(content)
      
      return {
        summary: data.summary || null,
        icon: data.icon || null,
        tags: data.tags || [],
        markdown: mdContent.trim(),
      }
    } catch {
      return null
    }
  }

  // GitHub에서 Readme.md를 가져와서 요약하는 함수
  const getReadmeSummary = async (owner, repo) => {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: {
          'Accept': 'application/vnd.github.v3.raw',
        },
      })
      
      if (!response.ok) return null
      
      const content = await response.text()
      
      // 첫 번째 헤더 또는 첫 번째 단락 추출
      let summary = content
      
      // # 헤더 제거
      summary = summary.replace(/^#+\s+[^\n]+\n/gm, '')
      
      // 마크다운 문법 제거
      summary = summary
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      
      // 첫 번째 문장 추출
      const firstSentence = summary.split(/[.!?。！？\n]/)[0]?.trim()
      
      if (!firstSentence) return null
      
      // 너무 길면 자르기
      return firstSentence.length > 100 ? firstSentence.slice(0, 100) + '...' : firstSentence
    } catch {
      return null
    }
  }

  try {
    const response = await fetch('https://api.vercel.com/v9/projects', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const text = await response.text()
      return res.status(response.status).json({ error: text })
    }

    const data = await response.json()

    const projects = await Promise.all(
      (data.projects || []).map(async (project) => {
        try {
          const meta = extractMeta(project.targets?.production?.meta || {})
          
          // GitHub packageinfo.md 가져오기
          const packageInfo = meta.githubOrg && meta.githubRepo 
            ? await getPackageInfo(meta.githubOrg, meta.githubRepo)
            : null
          
          // packageinfo.md가 없으면 Readme 요약 가져오기
          const readmeSummary = !packageInfo && meta.githubOrg && meta.githubRepo
            ? await getReadmeSummary(meta.githubOrg, meta.githubRepo)
            : null

          // Get latest deployment
          const depRes = await fetch(
            `https://api.vercel.com/v2/now/deployments?projectId=${project.id}&limit=1`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          const depData = await depRes.json()
          const dep = (depData.deployments || [])[0] || null

          const prodTarget = project.targets?.production || {}

          return {
            id: project.id,
            name: project.name,
            framework: project.framework,
            link: {
              domain: prodTarget.alias?.[0] || project.link?.domain,
              origin: project.link?.origin,
            },
            meta,
            packageInfo,  // packageinfo.md 정보
            summary: {
              aliases: prodTarget.alias || [],
              buildTime: prodTarget.buildingAt && prodTarget.readyAt
                ? (prodTarget.readyAt - prodTarget.buildingAt) / 1000
                : null,
              region: prodTarget.createdIn || null,
              lastDeployAt: normalizeDate(prodTarget.createdAt),
              readmeSummary,  // packageinfo.md가 없을 때만 사용
            },
            latestDeployment: dep
              ? {
                  id: dep.uid || dep.id,
                  state: dep.state || (dep.readyState === 'READY' ? 'READY' : dep.readyState || 'UNKNOWN'),
                  createdAt: normalizeDate(dep.created || dep.createdAt),
                  url: dep.url,
                  production: dep.production || dep.isProduction || false,
                  meta: extractMeta(dep.meta),
                }
              : null,
          }
        } catch {
          return {
            id: project.id,
            name: project.name,
            framework: project.framework,
            link: project.link,
            meta: {},
            packageInfo: null,
            summary: {},
            latestDeployment: null,
          }
        }
      })
    )

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
    return res.status(200).json({ projects })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
