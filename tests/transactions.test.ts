import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import supertest from 'supertest'
import { app } from '../src/app'

describe("Teste suite: '/transactions' routes", () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    const response = await supertest(app.server).post('/transactions').send({
      title: 'Test Transaction',
      amount: 5000,
      type: 'credit',
    })

    expect(response.statusCode).toBe(201)
  })

  it('should be able to list all transactions', async () => {
    const transactionOne = {
      title: 'Test Debit Transaction',
      amount: -5000,
      type: 'debit',
    }

    const transactionTwo = {
      title: 'Test Credit Transaction',
      amount: 5000,
      type: 'credit',
    }

    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send(transactionOne)

    const userCookie = createTransactionResponse.get('Set-Cookie')

    await supertest(app.server)
      .post('/transactions')
      .set('Cookie', userCookie)
      .send(transactionTwo)

    const listTransactionsResponse = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', userCookie)

    expect(listTransactionsResponse.statusCode).toEqual(200)
    expect(listTransactionsResponse.body.transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          amount: transactionOne.amount * -1,
          title: transactionOne.title,
        }),
        expect.objectContaining({
          amount: transactionTwo.amount,
          title: transactionTwo.title,
        }),
      ]),
    )
  })

  it('should be able to get a specific transaction', async () => {
    const transaction = {
      title: 'Test Debit Transaction',
      amount: 5000,
      type: 'debit',
    }

    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send(transaction)

    const cookie = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookie)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getSpecificTransactionResponse = await supertest(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookie)

    expect(getSpecificTransactionResponse.statusCode).toEqual(200)
    expect(getSpecificTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        amount: transaction.amount * -1,
        title: transaction.title,
      }),
    )
  })

  it('should be able to get a summary for all transactions', async () => {
    const transactionOne = {
      title: 'Test Debit Transaction',
      amount: 2000,
      type: 'debit',
    }

    const transactionTwo = {
      title: 'Test Credit Transaction',
      amount: 5000,
      type: 'credit',
    }

    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send(transactionOne)

    const userCookie = createTransactionResponse.get('Set-Cookie')

    await supertest(app.server)
      .post('/transactions')
      .set('Cookie', userCookie)
      .send(transactionTwo)

    const summaryResponse = await supertest(app.server)
      .get('/transactions/summary')
      .set('Cookie', userCookie)

    expect(summaryResponse.body.summary).toEqual(
      expect.objectContaining({
        'Account Balance': 3000,
      }),
    )
  })
})
