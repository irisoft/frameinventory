import TuposModel from './base/tupos-model'

class ScanLogItem extends TuposModel {
  constructor(json) {
    super(json)
    this.id = json.id
    this.scanTime = json.scan_time
    this.qtyDiff = json.qty_diff
    this.scannedQty = json.scannedQty
    this.reportQty = json.report_qty
    this.upc = json.upc
    this.brand = json.brand
    this.description = json.description
    this.type = json.type
  }

  get id() {
    return this._id
  }

  set id(id) {
    super.setterForNumbers(id, 'id')
  }

  get scanTime() {
    return this._scanTime
  }

  set scanTime(scanTime) {
    super.setterForDates(scanTime, 'scanTime')
  }

  get qtyDiff() {
    return this._qtyDiff
  }

  set qtyDiff(qtyDiff) {
    super.setterForNumbers(qtyDiff, 'qtyDiff')
  }

  get scannedQty() {
    return this._scannedQty
  }

  set scannedQty(scannedQty) {
    super.setterForNumbers(scannedQty, 'scannedQty')
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
    super.setterForDates(upc, 'upc')
  }

  get brand() {
    return this._brand
  }

  set brand(brand) {
    super.setterForStrings(brand, 'brand')
  }

  get description() {
    return this._description
  }

  set description(description) {
    super.setterForStrings(description, 'description')
  }

  get type() {
    return this._type
  }

  set type(type) {
    super.setterForStrings(type, 'type')
  }
}

export default ScanLogItem
