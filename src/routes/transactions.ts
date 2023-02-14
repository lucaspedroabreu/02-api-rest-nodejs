import type { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

import { knex } from '../database'
import { checkSessionIdCookie } from '../middlewares/check-session-id-cookie'

export async function transactionsRoutes(app: FastifyInstance) {
  //
  // Listing route

  app.get('/', { preHandler: [checkSessionIdCookie] }, async (req, res) => {
    const transactions = await knex('transactions')
      .where('session_id', req.cookies.sessionId)
      .select()

    return res.status(200).send({ transactions })
  })

  //
  // list one specific transaction route

  app.get('/:id', { preHandler: [checkSessionIdCookie] }, async (req, res) => {
    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const safeParams = getTransactionsParamsSchema.safeParse(req.params)
    if (!safeParams.success) return

    const { id } = safeParams.data

    const transaction = await knex('transactions')
      .where('id', id)
      .andWhere('session_id', req.cookies.sessionId)
      .first()

    return res.status(200).send({ transaction })
  })

  //
  // creation route

  app.post('/', async (req, res) => {
    const createTransactionRequestSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const safeRequest = createTransactionRequestSchema.safeParse(req.body)

    if (safeRequest.success === false) {
      return res
        .code(400)
        .send('Request made does not follow transaction schema')
    }

    const { title, amount, type } = safeRequest.data

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      res.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return res.code(201).send('Succesfully created a new transaction')
  })

  //
  // Transactions Summary Route

  app.get(
    '/summary',
    { preHandler: [checkSessionIdCookie] },
    async (req, res) => {
      const summary = await knex('transactions')
        .where('session_id', req.cookies.sessionId)
        .sum('amount', {
          as: 'Account Balance',
        })
        .first()

      return res.code(200).send({ summary })
    },
  )
}
