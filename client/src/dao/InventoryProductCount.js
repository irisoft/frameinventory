import TuposModel from './base/tupos-model'

class InventoryProductCount extends TuposModel {
  constructor(json) {
    super(json)
    this.id = json.id
    this.inventoryId = json.inventory_id
    this.productId = json.product_id
    this.manualQty = json.manual_qty
    this.reportQty = json.report_qty
    this.upc = json.upc
    this.brand = json.brand
    this.description = json.description
    this.salesPrice = json.sales_price
    this.sellInPrice = json.sell_in_price
    this.type = json.type
    this.organizationId = json.organization_id
    this.overUnder = json.over_under
  }

  get id() {
    return this._id
  }

  set id(id) {
    super.setterForNumbers(id, 'id')
  }


  get inventoryId() {
    return this._inventoryId
  }

  set inventoryId(inventoryId) {
    super.setterForNumbers(inventoryId, 'inventoryId')
  }


  get productId() {
    return this._productId
  }

  set productId(productId) {
    super.setterForNumbers(productId, 'productId')
  }


  get manualQty() {
    return this._manualQty
  }

  set manualQty(manualQty) {
    super.setterForNumbers(manualQty, 'manualQty')
  }


  get reportQty() {
    return this._reportQty
  }

  set reportQty(reportQty) {
    super.setterForNumbers(reportQty, 'reportQty')
  }


  get upc() {
    return this._upc
  }

  set upc(upc) {
    super.setterForNumbers(upc, 'upc')
  }


  get brand() {
    return this._brand
  }

  set brand(brand) {
    super.setterForNumbers(brand, 'brand')
  }


  get description() {
    return this._description
  }

  set description(description) {
    super.setterForNumbers(description, 'description')
  }


  get salesPrice() {
    return this._salesPrice
  }

  set salesPrice(salesPrice) {
    super.setterForNumbers(salesPrice, 'salesPrice')
  }


  get sellInPrice() {
    return this._sellInPrice
  }

  set sellInPrice(sellInPrice) {
    super.setterForNumbers(sellInPrice, 'sellInPrice')
  }


  get type() {
    return this._type
  }

  set type(type) {
    super.setterForNumbers(type, 'type')
  }


  get organizationId() {
    return this._organizationId
  }

  set organizationId(organizationId) {
    super.setterForNumbers(organizationId, 'organizationId')
  }


  get overUnder() {
    return this._overUnder
  }

  set overUnder(overUnder) {
    super.setterForNumbers(overUnder, 'overUnder')
  }
}

export default InventoryProductCount
