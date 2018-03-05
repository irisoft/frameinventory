import request from 'request-json'

const client = request.createClient(window.location.origin)

const apiMethods = {

  /* INVENTORY METHODS */

  getInventory: ({ organizationId }) => (
    {
      path: `/organization/${organizationId}/inventory`,
      method: 'get'
    }
  ),

  createInventory: ({ organizationId }) => (
    {
      path: `/organization/${organizationId}/inventory`,
      method: 'post'
    }
  ),

  getProductAndCountByUPC: ({ organizationId, inventoryId, upc }) => (
    {
      path: `/organization/${organizationId}/inventory/${inventoryId}/getProductAndCountByUPC/${upc}`,
      method: 'get'
    }
  ),

  getInventoryProductsAndCounts: ({ organizationId, inventoryId, filter }) => (
    {
      path: `/organization/${organizationId}/inventory/${inventoryId}/getInventoryProductsAndCounts?filter=${filter}`,
      method: 'get'
    }
  ),

  uploadProductsAndCounts: ({ organizationId, inventoryId }) => (
    {
      path: `/organization/${organizationId}/inventory/${inventoryId}/uploadProductsAndCounts`,
      method: 'post'
    }
  ),

  /* INVENTORY COUNT METHODS */

  updateInventoryCount: ({ organizationId, inventoryId, upc }) => (
    {
      path: `/organization/${organizationId}/inventory/${inventoryId}/count/${upc}`,
      method: 'put'
    }
  ),

  insertInventoryCount: ({ organizationId, inventoryId, upc }) => (
    {
      path: `/organization/${organizationId}/inventory/${inventoryId}/count/${upc}`,
      method: 'post'
    }
  ),


  /* ORGANIZATION METHODS */

  getOrganization: () => (
    {
      path: `/organization`,
      method: 'get'
    }
  ),


  /* PRODUCT METHODS */

  insertProduct: ({ organizationId }) => (
    {
      path: `/organization/${organizationId}/product`,
      method: 'post'
    }
  )
}

function makeApiCall(name, pathParams, payload) {
  return new Promise((resolve, reject) => {

    const { path, method } = apiMethods[name](pathParams)

    const handleResponse = (err, res, body) => {
      if (err) return reject(err)
      else return resolve(body)
    }

    if (['get', 'head', 'del'].includes(method)) {
      client[method](path, handleResponse)
    } else if (['post', 'put'].includes(method)) {
      client[method](path, payload, handleResponse)
    } else {
      return reject(new Error(`Invalid API method [${method}]`))
    }
  })
}

class JsonApi {
  async createNewInventory() {
    const result = await makeApiCall('createInventory', { organizationId: 1 })
    return result
  }

  async updateCount(upc, inventoryId, manualQty) {
    const result = await makeApiCall('updateInventoryCount', {
      organizationId: 1,
      inventoryId,
      upc
    }, { manualQty })
    return result
  }

  async getAllInventories() {
    const result = await makeApiCall('getInventory', { organizationId: 1 })
    return result
  }

  async insertProducts(inventoryId, products) {
    const result = await makeApiCall('uploadProductsAndCounts', {
      organizationId: 1,
      inventoryId
    }, { products })
    return result
  }

  async getProductAndCountByUPC(upc, inventoryId) {
    const result = await makeApiCall(
      'getProductAndCountByUPC',
      {
        organizationId: 1,
        inventoryId,
        upc
      }
    )
    return result
  }

  async getInventoryProductsAndCounts(inventoryId, filter = 'all') {
    const result = await makeApiCall(
      'getInventoryProductsAndCounts',
      {
        organizationId: 1,
        inventoryId,
        filter
      }
    )
    return result
  }
}

export default JsonApi
