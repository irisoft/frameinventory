import TuposModel from './base/tupos-model'

class InventoryStyleDiff extends TuposModel {
  constructor(json) {
    super(json)
    this.upc = json.upc
  }

  get upc() {
    return this._upc
  }

  set upc(upc) {
    super.setterForStrings(upc, 'upc')
  }
}

export default InventoryStyleDiff
