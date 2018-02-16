function Product(server) {
  server.get('/product', function (req, res, next) {
    res.send(req.params)
    return next()
  })
}

module.exports = Product
