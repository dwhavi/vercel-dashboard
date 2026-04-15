export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.WEBHOOK_SECRET
  if (secret && req.headers['x-webhook-secret'] !== secret) {
    return res.status(401).json({ error: 'Invalid secret' })
  }

  const body = req.body

  // Vercel webhook event types we care about
  const eventTypes = [
    'deployment.created',
    'deployment.succeeded',
    'deployment.failed',
    'deployment.ready',
    'deployment.canceled',
  ]

  if (!eventTypes.includes(body.type)) {
    return res.status(200).json({ received: true, ignored: true })
  }

  // In a real app, store this in a database or KV store
  // For now, we just acknowledge receipt
  // The client will pick up changes via polling
  console.log(`[Webhook] ${body.type}: ${body.payload?.deployment?.url || body.payload?.id}`)

  return res.status(200).json({ received: true, type: body.type })
}
