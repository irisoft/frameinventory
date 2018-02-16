var restify = require('restify')

var server = restify.createServer()

//require and init
function requireAndInit(handlers) {
  handlers.map((handler) => {
    require(handler).call(null, server)
  })
}

requireAndInit([
  'handlers/inventory',
  'handlers/inventoryCount',
  'handlers/product'
])

server.listen(8080, function() {
  // console.log('%s listening at %s', server.name, server.url)
})
