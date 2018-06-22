import TuposFirestoreModel from './base/tupos-firestore-model'
import setNumber from './base/setters/number'
import setString from './base/setters/string'
import setGTIN14 from './base/setters/barcodes/gtin-14'

class InventoryCount extends TuposFirestoreModel {
  constructor(json, organizationId = null, inventoryId = null) {
    super()
    this.brand = json.brand
    this.description = json.description
    this.mimsQty = json.mimsQty
    this.salesPrice = json.salesPrice
    this.fifoQty = json.fifoQty
    this.sellInPrice = json.sellInPrice
    this.type = json.type
    this.upc = json.upc

    this.organizationId = organizationId
    this.inventoryId = inventoryId
  }

  static async load(organizationId, inventoryId, upc) {
    if (!organizationId || organizationId === '') throw new Error('Argument `organizationId` is required for InventoryCount')
    if (!inventoryId || inventoryId === '') throw new Error('Argument `inventoryId` is required for InventoryCount')
    if (!upc || upc === '') throw new Error('Argument `upc` is required for InventoryCount')
    const data = await TuposFirestoreModel.load(`/organizations/${organizationId}/inventories/${inventoryId}/counts/${upc}`)
    if (data === null) return null
    return new InventoryCount(data, organizationId, inventoryId)
  }

  static async loadCollection(organizationId, inventoryId, wheres = []) {
    if (!organizationId || organizationId === '') throw new Error('Argument `organizationId` is required for InventoryCount.loadCollection')
    if (!inventoryId || inventoryId === '') throw new Error('Argument `inventoryId` is required for InventoryCount.loadCollection')
    const data = await TuposFirestoreModel.loadCollection(`/organizations/${organizationId}/inventories/${inventoryId}/counts`, wheres)
    if (Array.isArray(data)) {
      return data.map(inventoryCountSnapshot => new InventoryCount(
        inventoryCountSnapshot.data(),
        organizationId,
        inventoryId,
      ))
    }
    return null
  }

  getDataObject() {
    return {
      brand: this.brand,
      description: this.description,
      mimsQty: this.mimsQty,
      salesPrice: this.salesPrice,
      fifoQty: this.fifoQty,
      sellInPrice: this.sellInPrice,
      type: this.type,
      upc: this.upc,
      overUnder: this.overUnder,
    }
  }

  collectionPath() {
    if (this.organizationId === '') throw new Error('Property `organizationId` is required for InventoryCount')
    if (this.inventoryId === '') throw new Error('Property `inventoryId` is required for InventoryCount')
    return `/organizations/${this.organizationId}/inventories/${this.inventoryId}/counts`
  }

  get id() {
    return this.upc
  }

  get overUnder() {
    return (this.fifoQty - this.mimsQty)
  }

  get organizationId() {
    return this._organizationId
  }

  set organizationId(organizationId) {
    this._organizationId = setString(organizationId, 'organizationId')
  }

  get inventoryId() {
    return this._inventoryId
  }

  set inventoryId(inventoryId) {
    this._inventoryId = setString(inventoryId, 'inventoryId')
  }

  get brand() {
    return this._brand
  }

  set brand(brand) {
    this._brand = setString(brand, 'brand')
  }

  get description() {
    return this._description
  }

  set description(description) {
    this._description = setString(description, 'description')
  }

  get mimsQty() {
    return this._mimsQty
  }

  set mimsQty(mimsQty) {
    this._mimsQty = setNumber(mimsQty, 'mimsQty')
  }

  get salesPrice() {
    return this._salesPrice
  }

  set salesPrice(salesPrice) {
    this._salesPrice = setNumber(salesPrice, 'salesPrice', true, 10)
  }

  get fifoQty() {
    return this._fifoQty
  }

  set fifoQty(fifoQty) {
    this._fifoQty = setNumber(fifoQty, 'fifoQty')
  }

  get sellInPrice() {
    return this._sellInPrice
  }

  set sellInPrice(sellInPrice) {
    this._sellInPrice = setNumber(sellInPrice, 'sellInPrice', true, 10)
  }

  get type() {
    return this._type
  }

  set type(type) {
    this._type = setString(type, 'type')
  }

  get upc() {
    return this._upc
  }

  set upc(upc) {
    this._upc = setGTIN14(upc, 'upc')
  }
}

export default InventoryCount
