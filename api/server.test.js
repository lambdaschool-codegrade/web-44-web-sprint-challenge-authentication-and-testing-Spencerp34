const request = require('supertest')
const db = require('../data/dbConfig')
const server = require('./server')

test('sanity', () => {
  expect(true).not.toBe(false)
})


beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})


describe('[Register]', () => {
  test('should reject if username or password is missing', async() => {
    const res = await request(server).post('/api/auth/register').send({
      "username": "Bilbo"
    })
    expect(res.status).toBe(401)

  })
  test('should return new user if proper', async() => {
    const res = await request(server).post('/api/auth/register').send({
      "username": "Bilbo",
      "password": "Swaggins"
    })
    expect(res.body).toMatchObject({"username": "Bilbo", "id": 1})
  })
})

describe('[Login]', () => {
  test('should reject if username or password is wrong', async() => {
    const first = await request(server).post('/api/auth/register').send({
      "username": "Bilbo",
      "password": "Swaggins"
    })
    const res = await request(server).post('/api/auth/login').send({
      "username": "Bilb0",
      "password": "Swaggins"
    })
    expect(res.body).toMatchObject({message: 'invalid credentials'})
  })
  test('should provide token with right credentials', async() => {
    const first = await request(server).post('/api/auth/register').send({
      "username": "Bilbo",
      "password": "Swaggins"
    })
    const res = await request(server).post('/api/auth/login').send({
      "username": "Bilbo",
      "password": "Swaggins"
    })
    expect(res.body).toMatchObject({message: 'welcome, Bilbo!'})

  })
})

describe('[Jokes]', () => {
  test('should provide jokes with token', async() => {
    const first = await request(server).post('/api/auth/register').send({
      "username": "Bilbo",
      "password": "Swaggins"
    })
    const second = await request(server).post('/api/auth/login').send({
      "username": "Bilbo",
      "password": "Swaggins"
    })
    const res =await request(server).get('/api/jokes').set({ authorization: second.body.token})

    expect(res.body).toHaveLength(3)

  })

  test('should say token required if none exists', async() => {
    const res =await request(server).get('/api/jokes').set({})

    expect(res.body).toMatchObject({
      message: "token required"
    })

  })
})