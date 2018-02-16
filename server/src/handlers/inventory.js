function Inventory(server) {
  server.get('/inventory', function (req, res, next) {
    res.send(req.params)
    return next()
  })
}

module.exports = Inventory
