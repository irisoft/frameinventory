/* global firebase */
/* eslint-disable no-console */
// import InventoryFrameDiffCollection from '../dao/InventoryFrameDiffCollection'
// import InventoryStyleDiffCollection from '../dao/InventoryStyleDiffCollection'

const firestore = firebase.firestore()
const firestoreSettings = {
  timestampsInSnapshots: true,
}
firestore.settings(firestoreSettings)

const JsonApi = token => ({
  createNewInventory: async () => {
    let ref
    try {
      ref = await firestore.collection('organizations')
        .doc('po6IONOcohOE9a8U06yH')
        .collection('inventories')
        .add({
          status: 'active',
          locationId: 'organizations/po6IONOcohOE9a8U06yH/locations/Oea2rlsW1hnN3vUmOObU',
          startedAt: new Date(),
        })
    } catch (e) {
      console.error('Error creating Inventory', e)
    }
    return ref
  },

  updateCount: async (upc, inventoryId, scannedQty) => {
    let ref
    try {
      ref = await firestore.collection('organizations')
        .doc('po6IONOcohOE9a8U06yH')
        .collection('inventories')
        .doc(inventoryId)
        .collection('counts')
        .doc(upc)
        .update({
          scannedQty,
        })
    } catch (e) {
      console.error('Error updating Count', e)
    }
    return ref
  },

  getAllInventories: async () => {
    let querySnapshot
    try {
      querySnapshot = await firestore.collection('organizations')
        .doc('po6IONOcohOE9a8U06yH')
        .collection('inventories')
        .get()
    } catch (e) {
      console.error('Error getting list of Inventories', e)
    }
    return querySnapshot.docs
  },

  // insertProducts: async (inventoryId, products) => {
  //   const promises = []
  //   const countsRef = firestore.collection('organizations')
  //     .doc('po6IONOcohOE9a8U06yH')
  //     .collection('inventories')
  //     .doc(inventoryId)
  //     .collection('counts')
  //
  //   products.forEach((product) => {
  //     const { upc } = product
  //     try {
  //       promises.push(countsRef.doc(upc).set(product))
  //     } catch (e) {
  //       console.error('Error uploading Product', e)
  //     }
  //   })
  //
  //   await Promise.all(promises)
  // },

  // createOrganization: async (orgName, firstName, lastName, email, password) => {
  //   const result = await makeApiCall('createOrganization', null, {
  //     orgName,
  //     firstName,
  //     lastName,
  //     email,
  //     password,
  //   }, token)
  //   return result
  // },

  getProductAndCountByUPC: async (upc, inventoryId) => {
    let ref
    try {
      ref = await firestore.collection('organizations')
        .doc('po6IONOcohOE9a8U06yH')
        .collection('inventories')
        .doc(inventoryId)
        .collection('counts')
        .doc(upc)
    } catch (e) {
      console.error(e)
    }

    return await ref.get()
  },

  getInventorySummary: async (inventoryId) => {
    // const result = await makeApiCall(
    //   'getInventorySummary',
    //   {
    //     organizationId: 1,
    //     inventoryId,
    //   },
    //   null,
    //   token,
    // )
    // return result
  },

  getScanLog: async (inventoryId, timestamp) => {
    let querySnapshot
    try {
      querySnapshot = await firestore.collection('organizations')
        .doc('po6IONOcohOE9a8U06yH')
        .collection('inventories')
        .doc(inventoryId)
        .collection('scans')
        .where('scannedAt', '>=', Math.ceil(timestamp / 1000))
        .get()
    } catch (e) {
      console.error(e)
    }
    return querySnapshot.docs
  },

  deleteScanLog: async (inventoryId, id) => {
    // const result = await makeApiCall(
    //   'deleteScanLog',
    //   {
    //     organizationId: 1,
    //     inventoryId,
    //     id,
    //   },
    //   null,
    //   token,
    // )
    // return result
  },

  getInventoryFramesDiff: async (inventoryId) => {
    // const [over, under] = await makeApiCall(
    //   'getInventoryFramesDiff',
    //   {
    //     organizationId: 1,
    //     inventoryId,
    //   },
    //   null,
    //   token,
    // )
    // return {
    //   over: new InventoryFrameDiffCollection(over),
    //   under: new InventoryFrameDiffCollection(under),
    // }
  },

  getInventoryStylesDiff: async (inventoryId) => {
    // const result = await makeApiCall(
    //   'getInventoryStylesDiff',
    //   {
    //     organizationId: 1,
    //     inventoryId,
    //   },
    //   null,
    //   token,
    // )
    // return new InventoryStyleDiffCollection(result)
  },

  getInventoryProductsAndCounts: async (inventoryId, filter = 'all') => {
    let querySnapshot
    try {
      querySnapshot = await firestore.collection('organizations')
        .doc('po6IONOcohOE9a8U06yH')
        .collection('inventories')
        .doc(inventoryId)
        .collection('counts')
        .get()
    } catch (e) {
      console.error(e)
    }

    return querySnapshot.docs

    // const result = await makeApiCall(
    //   'getInventoryProductsAndCounts',
    //   {
    //     organizationId: 1,
    //     inventoryId,
    //     filter,
    //   },
    //   null,
    //   token,
    // )
    // return result
  },
})

export default JsonApi
