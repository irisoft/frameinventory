import Dexie from 'dexie'

function getProducts(db) {
  return db.product.toArray()
}

function getProduct(db, upc) {
  return db.product.where({ upc }).toArray()
}

function getInventoryCounts(db, inventoryId) {
  return db.inventoryCount.where({ inventoryId }).toArray()
}

function getInventoryCount(db, upc) {
  return db.inventoryCount.where({ upc }).toArray()
}

class LocalIndexedDB {
  constructor() {
    // Setup New Database
    this.db = new Dexie("test")

    // Define Schema
    this.db.version(1).stores({
      product: "&upc,description,brand,type,salesPrice,sellinPrice",
      inventory: "++id,startDate,status",
      inventoryCount: "[inventoryId+upc],upc,reportQty,manualQty"
    })

    this.db.version(2).stores({
      product: "&upc,description,brand,type,salesPrice,sellinPrice",
      inventory: "++id,startDate,status",
      inventoryCount: "[inventoryId+upc],inventoryId,upc,reportQty,manualQty"
    })
  }

  createNewInventory() {
    return this.db.inventory.put({ startDate: new Date(), status: 'active' })
  }

  getActiveInventory() {
    return this.db.inventory.where({ status: 'active' }).toArray()
  }

  insertProducts(products) {
    return this.db.product.bulkPut(products)
  }

  getProductAndCountByUPC(upc) {
    return getProduct(this.db, upc).then((product) => {
      return getInventoryCount(this.db, upc).then((inventoryCount) => {
        return {
          product,
          inventoryCount
        }
      })
    })
  }

  getInventoryProductsAndCounts(inventoryId) {
    return getProducts(this.db).then((products) => {
      return getInventoryCounts(this.db, inventoryId).then((inventoryCounts) => {
        return products.map((product) => {
          return Object.assign({}, product, inventoryCounts.find((ic) => {
            return (product.upc === ic.upc)
          }))
        })
      })
    })
  }

  insertInventoryCounts(inventoryCounts) {
    return this.db.inventoryCount.bulkPut(inventoryCounts)
  }
}

export default LocalIndexedDB
