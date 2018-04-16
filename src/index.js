const restify = require('restify')
const errors = require('restify-errors')
const { Pool } = require('pg')
const corsMiddleware = require('restify-cors-middleware')
const OktaJwtVerifier = require('@okta/jwt-verifier')

const PORT = process.env.PORT || 8080

const cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: [ `http://localhost:${PORT}`, 'https://irisoft-inventory.herokuapp.com/' ],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
})

const server = restify.createServer()
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
})

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: 'https://dev-924982.oktapreview.com/oauth2/default',
  assertClaims: {
    aud: "api://default",
    cid: "0oaecgijbzWW1fNFC0h7"
  }
})

const noAuthRequired = [
  'createOrganization'
]

async function queryDB({ text, values, name }, expectRows = true, forceArray = false) {
  const { rows, rowCount } = await pool.query({
    text,
    values
  })

  if (!forceArray && rows.length === 1) {
    return rows[0]
  } else if (forceArray || rows.length > 1) {
    return rows
  } else if (!expectRows) {
    return { rowCount }
  } else {
    throw new errors.NotFoundError(`Query [${name}] failed with params [${values.join(', ')}]`)
  }
}

const db = {
  select: async (params, forceArray = false) => {
    return await queryDB(params, true, forceArray)
  },
  insert: async (params, forceArray = false) => {
    return await queryDB(params, true, forceArray)
  },
  update: async (params, forceArray = false) => {
    return await queryDB(params, false, forceArray)
  }
}

server.pre(cors.preflight)
server.use(cors.actual)
server.use(restify.plugins.gzipResponse())
server.use(restify.plugins.bodyParser({ mapParams: true }))
server.use(restify.plugins.queryParser())

// serve client as static files
server.get(/\/?.*\//, restify.plugins.serveStatic({
  directory: './client/build',
  default: 'index.html',
  appendRequestPath: true
}))

server.use((req, res, next) => {
  const { name: routeName } = req.getRoute()

  if (noAuthRequired.indexOf(routeName) > -1) return next()

  const authHeader = req.headers.authorization || ''
  const match = authHeader.match(/Bearer (.+)/)

  if (!match) {
    return next(new errors.UnauthorizedError())
  }

  const accessToken = match[1]

  return oktaJwtVerifier.verifyAccessToken(accessToken)
    .then((jwt) => {
      req.jwt = jwt
      return next()
    })
    .catch((err) => {
      return next(new errors.UnauthorizedError())
    })
})


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

server.listen(PORT, function() {
  console.log('%s listening at %s', server.name, server.url)
})
