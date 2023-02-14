import type { FastifyRequest, FastifyReply } from 'fastify'

export async function checkSessionIdCookie(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const sessionId = req.cookies.sessionId

  if (!sessionId) {
    return res.status(401).send({
      error: 'Request made by unkown / unauthenticated user.',
    })
  }
}
