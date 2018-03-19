import Dexie from 'dexie'

function getProducts(db) {
  return db.product.toArray()
}

function getProduct(db, upc) {
  return db.product.where({ upc }).toArray()
}

function getInventoryCounts(db, inventoryId, filter) {
  let collection = db.inventoryCount.where({ inventoryId })

  if (filter === 'even') {
    collection = collection.and(item => item.manualQty === item.reportQty)
  } else if (filter === 'over') {
    collection = collection.and(item =>
      parseInt(item.manualQty.toString(), 10) > parseInt(item.reportQty.toString(), 10))
  } else if (filter === 'under') {
    collection = collection.and(item =>
      parseInt(item.manualQty.toString(), 10) < parseInt(item.reportQty.toString(), 10))
  }

  return collection.toArray()
}

function getInventoryCount(db, upc, inventoryId) {
  return db.inventoryCount.where({ upc, inventoryId }).toArray()
}

class LocalIndexedDB {
  constructor() {
    // Setup New Database
    this.db = new Dexie('test')

    // Define Schema
    this.db.version(1).stores({
      product: '&upc,description,brand,type,salesPrice,sellinPrice',
      inventory: '++id,startDate,status',
      inventoryCount: '[inventoryId+upc],upc,reportQty,manualQty',
    })

    this.db.version(2).stores({
      product: '&upc,description,brand,type,salesPrice,sellinPrice',
      inventory: '++id,startDate,status',
      inventoryCount: '[inventoryId+upc],inventoryId,upc,reportQty,manualQty',
    })
  }

  /**/
  createNewInventory() {
    return this.db.inventory.put({ startDate: new Date(), status: 'active' })
  }

  /**/
  getActiveInventory() {
    return this.db.inventory.where({ status: 'active' }).toArray()
  }

  /**/
  updateCount(key, changes) {
    return this.db.inventoryCount.update(key, changes)
  }

  /**/
  async getAllInventories() {
    const inventories = await this.db.inventory.toArray()
    const inventoriesWithCounts = await Promise.all(inventories.map(async (inventory) => {
      const { startDate, id } = inventory
      let overCount = 0
      let underCount = 0

      const productsAndCounts = await this.getInventoryProductsAndCounts(inventory.id)

      productsAndCounts.forEach((product) => {
        const { manualQty, reportQty } = product
        if (manualQty > reportQty) {
          overCount += 1
        } else if (reportQty > manualQty) {
          underCount += 1
        }
      })

      return {
        id,
        startDate,
        overCount,
        underCount,
      }
    }))

    return inventoriesWithCounts
  }

  /**/
  insertProducts(products) {
    return this.db.product.bulkPut(products)
  }

  /**/
  async getProductAndCountByUPC(upc, inventoryId) {
    const product = await getProduct(this.db, upc)
    const inventoryCount = await getInventoryCount(this.db, upc, inventoryId)
    return {
      product,
      inventoryCount,
    }
  }

  /**/
  async getInventoryProductsAndCounts(inventoryId, filter = 'all') {
    const products = await getProducts(this.db)
    const inventoryCounts = await getInventoryCounts(this.db, inventoryId, filter)
    return inventoryCounts.map(ic =>
      Object.assign({}, ic, products.find(product => (product.upc === ic.upc))))
  }

  /**/
  insertInventoryCounts(inventoryCounts) {
    return this.db.inventoryCount.bulkPut(inventoryCounts)
  }
}

export default LocalIndexedDB
