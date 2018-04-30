const ROOT_PATH = '/organization/:organizationId/inventory/:inventoryId/count'

function InventoryCount(server, db) {

  server.put({
    name: 'updateInventoryCount',
    path: `${ROOT_PATH}/:upc`
  }, async function(req, res, next) {
    const {
      organizationId,
      inventoryId,
      upc,
      manualQty
    } = req.params

    try {
      res.send(await db.update({
        name: 'updateInventoryCount',
        text: `
          UPDATE
            inventory_count
          SET
            manual_qty = $4
          WHERE
            inventory_id = $1 AND
            product_id = (
              SELECT
                id
              FROM
                product
              WHERE
                organization_id = $2 AND
                upc LIKE $3
              LIMIT 1
            )
        `,
        values: [ inventoryId, organizationId, `%${upc}`, manualQty ]
      }))
      return next()
    } catch (err) {
      return next(err)
    }
  })

  server.post({
    name: 'insertInventoryCount',
    path: `${ROOT_PATH}/:upc`
  }, async function(req, res, next) {
    const {
      organizationId,
      inventoryId,
      upc,
      manualQty,
      reportQty
    } = req.params

    try {
      res.send(await db.insert({
        name: 'insertInventoryCounts',
        text: `
          INSERT INTO
            product (
              inventory_id,
              product_id,
              manual_qty,
              report_qty
            )
          VALUES (
              '${inventoryId}',
              (SELECT id FROM product WHERE organization_id = $1 AND upc = $2 LIMIT 1),
              '${manualQty}',
              '${reportQty}'
            )
          RETURNING
            id
        `,
        values: [ organizationId, upc ]
      }))
      return next()
    } catch(err) {
      return next(err)
    }
  })
}

module.exports = InventoryCount
