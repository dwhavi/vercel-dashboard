export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  const token = process.env.VERCEL_TOKEN
  if (!token) {
    return res.status(500).json({ error: 'VERCEL_TOKEN not configured' })
  }

  try {
    const page = parseInt(req.query.page) || 1
    const limit = Math.min(parseInt(req.query.limit) || 10, 20)
    const skip = (page - 1) * limit

    const response = await fetch(
      `https://api.vercel.com/v2/now/deployments?projectId=${id}&limit=${limit}&skip=${skip}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const text = await response.text()
      return res.status(response.status).json({ error: text })
    }

    const depData = await response.json()

    const normalizeDate = (val) => {
      if (!val) return null
      if (typeof val === 'number') return new Date(val).toISOString()
      return val
    }

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30')
    return res.status(200).json({
      deployments: (depData.deployments || []).map((d) => ({
        id: d.uid || d.id,
        state: d.state || (d.readyState === 'READY' ? 'READY' : d.readyState || 'UNKNOWN'),
        createdAt: normalizeDate(d.created || d.createdAt),
        updatedAt: normalizeDate(d.updatedAt || d.created),
        url: d.url,
        production: d.production || d.isProduction || false,
        meta: d.meta || {},
        alias: d.alias || [],
        inspectorUrl: d.inspectorUrl,
      })),
      pagination: {
        page,
        limit,
        total: depData.pagination?.count || 0,
      },
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
