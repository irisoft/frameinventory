function InventoryCount(server) {
  server.get('/inventoryCount', function (req, res, next) {
    res.send(req.params)
    return next()
  })
}

module.exports = InventoryCount
