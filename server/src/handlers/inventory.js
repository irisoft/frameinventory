const ROOT_PATH = '/organization/:organizationId/inventory'

function Inventory(server, db) {
  server.get({
    name: 'getInventory',
    path: `${ROOT_PATH}`
  }, async function(req, res, next) {

    const { organizationId } = req.params
    const { status } = req.query

    try {
      res.send(await db.select({
        name: 'getInventory',
        text: `
          SELECT
          	i.id,
          	i.start_date,
          	(SELECT count(*) FROM inventory_count WHERE inventory_id = i.id AND manual_qty > report_qty) over_count,
          	(SELECT count(*) FROM inventory_count WHERE inventory_id = i.id AND manual_qty < report_qty) under_count,
          	(SELECT count(*) FROM inventory_count WHERE inventory_id = i.id AND manual_qty = report_qty) even_count
          FROM
          	inventory i
          WHERE
          	i.organization_id = $1
            ${status ? ' AND status=$2' : ''}
        `,
        values: status ? [ organizationId, status ] : [ organizationId ]
      }))
      return next()
    } catch (err) {
      console.log(err.stack)
      return next(err)
    }
  })

  server.post({
    name: 'createInventory',
    path: `${ROOT_PATH}`
  }, async function(req, res, next) {

    const { organizationId } = req.params

    try {
      res.send(await db.insert({
        name: 'createInventory',
        text: `
          INSERT INTO
            inventory(organization_id)
          VALUES
            ($1)
          RETURNING
            id
        `,
        values: [ organizationId ]
      }))
      return next()
    } catch(err) {
      return next(err)
    }
  })

  server.get({
    name: 'getProductAndCountByUPC',
    path: `${ROOT_PATH}/:inventoryId/getProductAndCountByUPC/:upc`
  }, async function(req, res, next) {

    const {
      organizationId,
      inventoryId,
      upc
    } = req.params

    try {
      res.send(await db.select({
        name: 'getInventoryProductAndCountByUPC',
        text: `
          SELECT
          	c.*,
          	p.*
          FROM
          	inventory_count c INNER JOIN
          	product p ON c.product_id = p.id
          WHERE
          	c.inventory_id = $1 AND
          	p.upc = $2
        `,
        value: [ inventory_id, upc ]
      }))
      return next()
    } catch (err) {
      return next(err)
    }
  })

  server.get({
    name: 'getInventoryProductsAndCounts',
    path: `${ROOT_PATH}/:inventoryId/getInventoryProductsAndCounts`
  }, async function(req, res, next) {

    const {
      organizationId,
      inventoryId
    } = req.params

    try {
      res.send(await db.select({
        name: 'getInventoryProductsAndCounts',
        text: `
          SELECT
          	c.*,
          	p.*
          FROM
          	inventory_count c INNER JOIN
          	product p ON c.product_id = p.id
          WHERE
          	c.inventory_id = $1
        `,
        value: [ inventory_id ]
      }))
      return next()
    } catch (err) {
      return next(err)
    }
  })
}

module.exports = Inventory
