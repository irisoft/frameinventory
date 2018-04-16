import request from 'request-json'

const client = request.createClient(window.location.origin)

const apiMethods = {

  /* INVENTORY METHODS */

  getInventory: ({ organizationId }) => (
    {
      path: `/organization/${organizationId}/inventory`,
      method: 'get',
    }
  ),

  createInventory: ({ organizationId }) => (
    {
      path: `/organization/${organizationId}/inventory`,
      method: 'post',
    }
  ),

  getProductAndCountByUPC: ({ organizationId, inventoryId, upc }) => (
    {
      path: `/organization/${organizationId}/inventory/${inventoryId}/getProductAndCountByUPC/${upc}`,
      method: 'get',
    }
  ),

  getInventorySummary: ({ organizationId, inventoryId }) => (
    {
      path: `/organization/${organizationId}/inventory/${inventoryId}/getInventorySummary`,
      method: 'get',
    }
  ),

  getInventoryProductsAndCounts: ({ organizationId, inventoryId, filter }) => (
    {
      path: `/organization/${organizationId}/inventory/${inventoryId}/getInventoryProductsAndCounts?filter=${filter}`,
      method: 'get',
    }
  ),

  uploadProductsAndCounts: ({ organizationId, inventoryId }) => (
    {
      path: `/organization/${organizationId}/inventory/${inventoryId}/uploadProductsAndCounts`,
      method: 'post',
    }
  ),

  /* INVENTORY COUNT METHODS */

  updateInventoryCount: ({ organizationId, inventoryId, upc }) => (
    {
      path: `/organization/${organizationId}/inventory/${inventoryId}/count/${upc}`,
      method: 'put',
    }
  ),

  insertInventoryCount: ({ organizationId, inventoryId, upc }) => (
    {
      path: `/organization/${organizationId}/inventory/${inventoryId}/count/${upc}`,
      method: 'post',
    }
  ),


  /* ORGANIZATION METHODS */

  getOrganization: () => (
    {
      path: '/organization',
      method: 'get',
    }
  ),

  createOrganization: () => (
    {
      path: '/organization',
      method: 'post',
    }
  ),

  /* PRODUCT METHODS */

  insertProduct: ({ organizationId }) => (
    {
      path: `/organization/${organizationId}/product`,
      method: 'post',
    }
  ),
}

export function makeApiCall(name, pathParams, payload, token = false) {
  return new Promise((resolve, reject) => {
    const { path, method } = apiMethods[name](pathParams)

    const handleResponse = (err, res, body) => {
      if (err) return reject(err)
      return resolve(body)
    }

    if (token) {
      client.headers.Authorization = `Bearer ${token}`
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

const JsonApi = token => ({
  createNewInventory: async () => {
    const result = await makeApiCall('createInventory', { organizationId: 1 }, null, token)
    return result
  },

  updateCount: async (upc, inventoryId, manualQty) => {
    const result = await makeApiCall('updateInventoryCount', {
      organizationId: 1,
      inventoryId,
      upc,
    }, { manualQty }, token)
    return result
  },

  getAllInventories: async () => {
    const result = await makeApiCall('getInventory', { organizationId: 1 }, null, token)
    return result
  },

  insertProducts: async (inventoryId, products) => {
    const result = await makeApiCall('uploadProductsAndCounts', {
      organizationId: 1,
      inventoryId,
    }, { products }, token)
    return result
  },

  createOrganization: async (orgName, firstName, lastName, email, password) => {
    const result = await makeApiCall('createOrganization', null, {
      orgName,
      firstName,
      lastName,
      email,
      password,
    }, token)
    return result
  },

  getProductAndCountByUPC: async (upc, inventoryId) => {
    const result = await makeApiCall(
      'getProductAndCountByUPC',
      {
        organizationId: 1,
        inventoryId,
        upc,
      },
      null,
      token,
    )
    return result
  },

  getInventorySummary: async (inventoryId) => {
    const result = await makeApiCall(
      'getInventorySummary',
      {
        organizationId: 1,
        inventoryId,
      },
      null,
      token,
    )
    return result
  },

  getInventoryProductsAndCounts: async (inventoryId, filter = 'all') => {
    const result = await makeApiCall(
      'getInventoryProductsAndCounts',
      {
        organizationId: 1,
        inventoryId,
        filter,
      },
      null,
      token,
    )
    return result
  },
})

export default JsonApi
