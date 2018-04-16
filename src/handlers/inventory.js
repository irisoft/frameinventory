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
        values: [ inventoryId, upc ]
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
        text: `
          select
            (select start_date from inventory where inventory.id = $1) start_date,
          	sum(sq.manual_style_count) manual_style_count,
          	sum(sq.report_style_count) report_style_count,
          	sum(sq.manual_frame_count) manual_frame_count,
          	sum(sq.report_frame_count) report_frame_count,
          	sum(sq.manual_value) manual_value,
          	sum(sq.report_value) report_value,
          	(sum(sq.report_style_count) - sum(sq.manual_style_count)) style_diff,
          	(sum(sq.report_frame_count) - sum(sq.manual_frame_count)) frame_diff,
          	(sum(sq.report_value) - sum(sq.manual_value)) value_diff
          from (
          	select
          		case when c.manual_qty > 0 then 1 else 0 end as manual_style_count,
          		case when c.report_qty > 0 then 1 else 0 end as report_style_count,
          		case when c.manual_qty > 0 then c.manual_qty else 0 end as manual_frame_count,
          		case when c.report_qty > 0 then c.report_qty else 0 end as report_frame_count,
          		p.sell_in_price,
          		(case when c.manual_qty > 0 then (c.manual_qty * p.sell_in_price::money::numeric::float8) else 0 end)::float8::numeric::money as manual_value,
          		(case when c.report_qty > 0 then (c.report_qty * p.sell_in_price::money::numeric::float8) else 0 end)::float8::numeric::money as report_value
          	from
          		inventory_count c inner join
          		inventory i on i.id = c.inventory_id inner join
          		product p on p.id = c.product_id
            where
              c.inventory_id = $1
          	order by
          		report_frame_count desc
          ) sq
        `,
        values: [ inventoryId ]
      }, true))
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
