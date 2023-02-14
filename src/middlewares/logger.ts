import type { FastifyRequest, FastifyReply } from 'fastify'

export const logger = async (req: FastifyRequest, res: FastifyReply) => {
  console.log(`[${req.method}]: ${req.url}`)
}
