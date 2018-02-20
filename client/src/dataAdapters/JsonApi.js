import NRC from 'node-rest-client'

const ROOT_PATH = 'http://localhost:8080'
const client = new NRC.Client()

/* INVENTORY METHODS */

client.registerMethod(
  'getInventory',
  `${ROOT_PATH}/organization/\${organizationId}/inventory`,
  'GET'
)

client.registerMethod(
  'createInventory',
  `${ROOT_PATH}/organization/\${organizationId}/inventory`,
  'POST'
)

client.registerMethod(
  'getProductAndCountByUPC',
  `${ROOT_PATH}/organization/\${organizationId}/inventory/\${inventoryId}/getProductAndCountByUPC/\${upc}`,
  'GET'
)

client.registerMethod(
  'getInventoryProductsAndCounts',
  `${ROOT_PATH}/organization/\${organizationId}/inventory/\${inventoryId}/getInventoryProductsAndCounts`,
  'GET'
)


/* INVENTORY COUNT METHODS */

client.registerMethod(
  'updateInventoryCount',
  `${ROOT_PATH}/organization/\${organizationId}/inventory/\${inventoryId}/count/\${upc}`,
  'PUT'
)

client.registerMethod(
  'insertInventoryCount',
  `${ROOT_PATH}/organization/\${organizationId}/inventory/\${inventoryId}/count/\${upc}`,
  'POST'
)


/* ORGANIZATION METHODS */

client.registerMethod(
  'getOrganization',
  `${ROOT_PATH}/organization`,
  'GET'
)


/* PRODUCT METHODS */

client.registerMethod(
  'insertProduct',
  `${ROOT_PATH}/organization/\${organizationId}/product`,
  'POST'
)


function makeApiCall(method, args) {
  return new Promise((resolve, reject) => {
    console.log('args', args)
    const req = client.methods[method](args, (data, response) => {
      resolve(data)
    })

    req.on('requestTimeout', (r) => {
      reject(new Error('Request Timed Out'))
      r.abort()
    })

    req.on('responseTimeout', (r) => {
      reject(new Error('Response Timed Out'))
    })

    req.on('error', (err) => {
      reject(err)
    })
  })
}

class JsonApi {
  async createNewInventory() {
    const result = await makeApiCall('createInventory', {
      path: {
        organizationId: 1
      }
    })
    return result
  }

  getActiveInventory() {
    console.log("ooops. called getActiveInventory")
  }

  async updateCount(key, changes) {
    const result = await makeApiCall('updateInventoryCount', {
      path: {
        organizationId: 1
      }
    })
    return result
  }

  async getAllInventories() {
    const result = await makeApiCall('getInventory', {
      path: {
        organizationId: 1
      }
    })
    return result
  }

  insertProducts(products) {
    return products.map(async (product) => {
      const {
        upc,
        description,
        brand,
        type,
        salesPrices,
        sellinPrice,
        inventoryId,
        reportQty,
        manualQty
      } = product

      const { id: product_id } = await makeApiCall('insertProduct', {
        path: {
          organizationId: 1
        },
        headers: {
          "content-type": "applicaton/json"
        },
        data: {
          upc,
          description,
          brand,
          type,
          sales_price: salesPrices,
          sell_in_price: sellinPrice,
        }
      })

      const { id: inventory_id } = await makeApiCall('insertInventoryCount', {
        path: {
          organizationId: 1,
          inventoryId,
          upc
        },
        headers: {
          "content-type": "applicaton/json"
        },        
        data: {
          reportQty,
          manualQty
        }
      })
      return { inventory_id, product_id }
    })
  }

  async getProductAndCountByUPC(upc, inventoryId) {
    const result = await makeApiCall('getProductAndCountByUPC', {
      path: {
        organizationId: 1,
        inventoryId,
        upc
      }
    })
    return result
  }

  async getInventoryProductsAndCounts(inventoryId, filter = 'all') {
    const result = await makeApiCall('getInventoryProductsAndCounts', {
      path: {
        organizationId: 1,
        inventoryId
      }
    })
    return result
  }

  // insertInventoryCounts(inventoryId, inventoryCounts) {
  //   return inventoryCounts.map(async (inventoryCount) => {
  //
  //     const { upc,
  //       inventoryId,
  //       reportQty,
  //       manualQty
  //     } = inventoryCount
  //
  //     return await makeApiCall('insertInventoryCount', {
  //       path: {
  //         organizationId: 1,
  //         inventoryId,
  //         upc
  //       },
  //       data: {
  //         reportQty,
  //         manualQty
  //       }
  //     })
  //   })
  // }
}

export default JsonApi
