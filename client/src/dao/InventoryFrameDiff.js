import TuposModel from './base/tupos-model'

class InventoryFrameDiff extends TuposModel {
  constructor(json) {
    super(json)
    this.upc = json.upc
    this.qty = json.qty
  }

  get upc() {
    return this._upc
  }

  set upc(upc) {
    super.setterForStrings(upc, 'upc')
  }

  get qty() {
    return this._qty
  }

  set qty(qty) {
    super.setterForNumbers(qty, 'qty')
  }
}

export default InventoryFrameDiff
