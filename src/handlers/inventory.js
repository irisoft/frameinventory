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
      }, true))
      return next()
    } catch (err) {
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

    let productId

    const {
      organizationId,
      inventoryId,
      upc
    } = req.params


    /* 1. Check for the UPC in the inventory_count table */
    const getResultFromInventory = async (i_inventoryId, i_upc) => (
      await db.select({
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
            p.upc LIKE $2
          LIMIT 1
        `,
        values: [ i_inventoryId, `%${i_upc}` ]
      }, false, true)
    )

    try {
      const resultFromInventory = await getResultFromInventory(inventoryId, upc)

      /* 2. If it's present, return the data */
      if (resultFromInventory && 'upc' in resultFromInventory) {
        res.send(resultFromInventory)
        return next()


      /* 3. If it's not present, we have to check for UPC in product table */
      } else {
        const resultFromProducts = await db.select({
          name: 'getProductByUPC',
          text: `
            select
            	*
            from
            	product p
            where
            	p.upc LIKE $2 and
            	p.organization_id = $1
            LIMIT 1
          `,
          values: [ organizationId, `%${upc}` ]
        }, false, true)


        /* 4. Product exists already, use the existing product_id */
        if (resultFromProducts && 'id' in resultFromProducts && resultFromProducts.id) {
          productId = inventoryCountResult.id


        /* 5. If there's no product with that UPC, insert it into the product table leaving all fields blank except UPC */
        } else {
          productInsertResult = await db.insert({
            name: 'insertEmptyProductFromUPC',
            text: `
              insert into
              product
                (upc, organization_id)
              values
                ($1, $2)
              returning id
            `,
            values: [ upc, organizationId ]
          })

          if (productInsertResult && 'id' in productInsertResult && productInsertResult.id) {
            productId = productInsertResult.id
          }
        }


        if (!productId) throw new Error('Unable to SELECT or INSERT product_id')

        /* 6. Then, insert into inventory_count table using the id just inserted into product table and a report_qty of 0 and manual_qty of 1. */
        const productCountInsertResult = await db.insert({
          name: 'insertEmptyProductCountFromUPC',
          text: `
            insert into
            inventory_count
              (inventory_id, product_id, manual_qty, report_qty)
            values
              ($1, $2, 0, 0)
            returning id
          `,
          values: [ inventoryId, productId ]
        })

        /* 7. Finally, return the new data to the calling function */
        if (productCountInsertResult && 'id' in productCountInsertResult && productCountInsertResult.id) {
          const newResultFromInventory = await getResultFromInventory(inventoryId, upc)
          if (newResultFromInventory && 'upc' in newResultFromInventory) {
            res.send(newResultFromInventory)
            return next()
          } else {
            throw new Error('Unable insert new inventory_count')
          }
        }
      }
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

    const { filter } = req.query

    let filterClause = ''
    if (filter === 'over') {
      filterClause = 'AND c.manual_qty > c.report_qty'
    } else if (filter === 'under') {
      filterClause = 'AND c.manual_qty < c.report_qty'
    } else if (filter === 'even') {
      filterClause = 'AND c.manual_qty = c.report_qty'
    }

    try {
      res.send(await db.select({
        name: 'getInventoryProductsAndCounts',
        text: `
          SELECT
          	c.*,
          	p.*,
            (c.manual_qty - c.report_qty) as over_under
          FROM
          	inventory_count c INNER JOIN
          	product p ON c.product_id = p.id
          WHERE
          	c.inventory_id = $1
            ${filterClause}
          ORDER BY
            p.upc
        `,
        values: [ inventoryId ]
      }, true))
      return next()
    } catch (err) {
      return next(err)
    }
  })

  server.get({
    name: 'getInventorySummary',
    path: `${ROOT_PATH}/:inventoryId/getInventorySummary`
  }, async function(req, res, next) {

    const {
      organizationId,
      inventoryId
    } = req.params

    try {
      res.send(await db.select({
        name: 'getInventorySummary',
        text: 'SELECT * FROM inventory_summary($1)',
        values: [ inventoryId ]
      }, true))
      return next()
    } catch (err) {
      return next(err)
    }
  })

  server.get({
    name: 'getInventoryStylesDiff',
    path: `${ROOT_PATH}/:inventoryId/getInventoryStylesDiff`
  }, async function(req, res, next) {

    const {
      organizationId,
      inventoryId
    } = req.params

    try {
      res.send(await db.select({
        name: 'getInventoryStylesDiff',
        text: `
          select
          	p.upc upc
          from
          	inventory_count c inner join
          	product p on p.id = c.product_id
          where
            c.inventory_id = $1 and
          	c.manual_qty = 0 and
          	c.report_qty > 0
          order by
          	p.upc
        `,
        values: [ inventoryId ]
      }, true))
      return next()
    } catch (err) {
      return next(err)
    }
  })

  server.get({
    name: 'getInventoryFramesDiff',
    path: `${ROOT_PATH}/:inventoryId/getInventoryFramesDiff`
  }, async function(req, res, next) {

    const {
      organizationId,
      inventoryId
    } = req.params

    try {
      res.send([
        await db.select({
          name: 'getInventoryFramesOver',
          text: 'select * from inventory_frames_over($1)',
          values: [ inventoryId ]
        }, true),
        await db.select({
          name: 'getInventoryFramesUnder',
          text: 'select * from inventory_frames_under($1)',
          values: [ inventoryId ]
        }, true)
      ])
      return next()
    } catch (err) {
      return next(err)
    }
  })

  server.post({
    name: 'uploadProductsAndCounts',
    path: `${ROOT_PATH}/:inventoryId/uploadProductsAndCounts`
  }, async function(req, res, next) {
    const {
      organizationId,
      inventoryId,
      products
    } = req.params

    if (Array.isArray(products)) {
      const ids = await Promise.all(products.map(function(product) {
        return new Promise(async (resolve, reject) => {
          const {
            upc,
            brand,
            description,
            salesPrice,
            sellinPrice,
            type,
            reportQty,
            manualQty
          } = product

          let productResult, inventoryCountResult

          try {
            productResult = await db.insert({
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
                VALUES ( $1, $2, $3, $4, $5, $6, $7 )
                ON CONFLICT
                  (upc, organization_id)
                DO UPDATE SET
                  brand = $3,
                  description = $4,
                  sales_price = $5,
                  sell_in_price = $6,
                  type = $7
                RETURNING
                  id
              `,
              values: [ organizationId, upc, brand, description, salesPrice, sellinPrice, type ]
            })
          } catch(err) {
            reject(err)
          }

          try {
            inventoryCountResult = await db.insert({
              name: 'insertInventoryCount',
              text: `
                INSERT INTO
                  inventory_count (
                    inventory_id,
                    product_id,
                    manual_qty,
                    report_qty
                  )
                VALUES (
                    $1,
                    (SELECT id FROM product WHERE organization_id = $2 AND upc = $3 LIMIT 1),
                    $4,
                    $5
                  )
                RETURNING
                  id
              `,
              values: [ inventoryId, organizationId, upc, manualQty, reportQty ]
            })
          } catch(err) {
            reject(err)
          }

          const { id: inventoryCountId } = inventoryCountResult
          const { id: productId } =  productResult

          resolve({ productId, inventoryCountId })
        })
      }))
      res.send({ ids })
      return next()
    } else {
      return next(new Error('Parameter [products] must be an array.'))
    }
  })
}

module.exports = Inventory

/*





*/
