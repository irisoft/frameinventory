import TuposFirestoreModel from './base/tupos-firestore-model'
import setNumber from './base/setters/number'
import setString from './base/setters/string'
import setGTIN14 from './base/setters/barcodes/gtin-14'

class InventoryCount extends TuposFirestoreModel {
  constructor(json, organizationId = null, inventoryId = null) {
    super()
    this.brand = json.brand
    this.description = json.description
    this.reportQty = json.reportQty
    this.salesPrice = json.salesPrice
    this.scannedQty = json.scannedQty
    this.sellInPrice = json.sellInPrice
    this.type = json.type
    this.upc = json.upc

    this.organizationId = organizationId
    this.inventoryId = inventoryId
  }

  getDataObject() {
    return {
      brand: this.brand,
      description: this.description,
      reportQty: this.reportQty,
      salesPrice: this.salesPrice,
      scannedQty: this.scannedQty,
      sellInPrice: this.sellInPrice,
      type: this.type,
      upc: this.upc,
    }
  }

  collectionPath() {
    if (this.organizationId === '') throw new Error('Property `organizationId` is required for InventoryCount')
    if (this.inventoryId === '') throw new Error('Property `inventoryId` is required for InventoryCount')
    if (this.upc === '') throw new Error('Property `upc` is required for InventoryCount')
    return `/organizations/${this.organizationId}/inventories/${this.inventoryId}/counts/${this.upc}`
  }

  get id() {
    return this.upc
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

  get reportQty() {
    return this._reportQty
  }

  set reportQty(reportQty) {
    this._reportQty = setNumber(reportQty, 'reportQty')
  }

  get salesPrice() {
    return this._salesPrice
  }

  set salesPrice(salesPrice) {
    this._salesPrice = setNumber(salesPrice, 'salesPrice', true, 10)
  }

  get scannedQty() {
    return this._scannedQty
  }

  set scannedQty(scannedQty) {
    this._scannedQty = setNumber(scannedQty, 'scannedQty')
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
