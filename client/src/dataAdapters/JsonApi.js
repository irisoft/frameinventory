import request from 'request-json'
import InventoryFrameDiffCollection from '../dao/InventoryFrameDiffCollection'
import InventoryStyleDiffCollection from '../dao/InventoryStyleDiffCollection'

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

  getScanLog: ({ organizationId, inventoryId, timestamp }) => (
    {
      path: `/organization/${organizationId}/inventory/${inventoryId}/getScanLog/${timestamp}`,
      method: 'get',
    }
  ),

  deleteScanLog: ({ organizationId, inventoryId, id }) => (
    {
      path: `/organization/${organizationId}/inventory/${inventoryId}/deleteScanLog/${id}`,
      method: 'get',
    }
  ),

  getInventoryStylesDiff: ({ organizationId, inventoryId }) => (
    {
      path: `/organization/${organizationId}/inventory/${inventoryId}/getInventoryStylesDiff`,
      method: 'get',
    }
  ),

  getInventoryFramesDiff: ({ organizationId, inventoryId }) => (
    {
      path: `/organization/${organizationId}/inventory/${inventoryId}/getInventoryFramesDiff`,
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

  getScanLog: async (inventoryId, timestamp) => {
    const result = await makeApiCall(
      'getScanLog',
      {
        organizationId: 1,
        inventoryId,
        timestamp: Math.ceil(timestamp / 1000),
      },
      null,
      token,
    )
    return result
  },

  deleteScanLog: async (inventoryId, id) => {
    const result = await makeApiCall(
      'deleteScanLog',
      {
        organizationId: 1,
        inventoryId,
        id,
      },
      null,
      token,
    )
    return result
  },

  getInventoryFramesDiff: async (inventoryId) => {
    const [over, under] = await makeApiCall(
      'getInventoryFramesDiff',
      {
        organizationId: 1,
        inventoryId,
      },
      null,
      token,
    )
    return {
      over: new InventoryFrameDiffCollection(over),
      under: new InventoryFrameDiffCollection(under),
    }
  },

  getInventoryStylesDiff: async (inventoryId) => {
    const result = await makeApiCall(
      'getInventoryStylesDiff',
      {
        organizationId: 1,
        inventoryId,
      },
      null,
      token,
    )
    return new InventoryStyleDiffCollection(result)
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
