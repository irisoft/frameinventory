const restify = require('restify')
const errors = require('restify-errors')
const { Pool } = require('pg')
const corsMiddleware = require('restify-cors-middleware')

const cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: [ 'http://localhost:3000' ],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
})

const server = restify.createServer()
const pool = new Pool()

async function queryDB({ text, values, name }, expectRows = true) {
  const { rows, rowCount } = await pool.query({
    text,
    values
  })

  if (rows.length === 1) {
    return rows[0]
    return next()
  } else if (rows.length > 1) {
    return rows
  } else if (!expectRows) {
    return { rowCount }
  } else {
    throw new errors.NotFoundError(`Query [${name}] failed with params [${values.join(', ')}]`)
  }
}

const db = {
  select: async (params) => {
    return await queryDB(params)
  },
  insert: async (params) => {
    return await queryDB(params)
  },
  update: async (params) => {
    return await queryDB(params, false)
  }
}

server.pre(cors.preflight)
server.use(cors.actual)
server.use(restify.plugins.bodyParser({ mapParams: true }))
server.use(restify.plugins.queryParser())

// require and init
function requireAndInit(handlers) {
  handlers.map((handler) => {
    require(handler).call(null, server, db)
  })
}

requireAndInit([
  './handlers/organization',
  './handlers/inventory',
  './handlers/inventoryCount',
  './handlers/product'
])

server.listen(8080, function() {
  // console.log('%s listening at %s', server.name, server.url)
})
