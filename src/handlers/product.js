const ROOT_PATH = '/organization/:organizationId/product'

function Product(server, db) {

  server.post({
    name: 'insertProduct',
    path: `${ROOT_PATH}`
  }, async function(req, res, next) {
    const {
      organizationId,
      upc,
      brand,
      description,
      sales_price,
      sell_in_price,
      type
    } = req.params

    try {
      res.send(await db.insert({
        name: 'insertProduct',
        text: `
          INSERT INTO
            product (
              organization_id,
              upc,
              brand,
              description,
              sales_price,
              sell_in_price,
              type
            )
          VALUES (
              '${organizationId}',
              '${upc}',
              '${brand}',
              '${description}',
              '${sales_price}',
              '${sell_in_price}',
              '${type}'
            )
          RETURNING
            id
        `
      }))
      return next()
    } catch(err) {
      return next(err)
    }
  })
}

module.exports = Product
