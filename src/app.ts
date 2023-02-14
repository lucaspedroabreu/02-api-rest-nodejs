import fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import { transactionsRoutes } from './routes/transactions'
import { logger } from './middlewares/logger'

export const app = fastify()

app.register(fastifyCookie)

app.addHook('preHandler', logger)

app.register(transactionsRoutes, {
  prefix: 'transactions',
})
