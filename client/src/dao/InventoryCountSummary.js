import setNumber from './base/setters/number'

class InventoryCountSummary {
  constructor(json = {}) {
    this.over = json.over || 0
    this.under = json.under || 0
    this.even = json.even || 0
  }

  toObject() {
    return {
      over: this.over,
      under: this.under,
      even: this.even,
    }
  }

  get over() {
    return this._over
  }

  set over(over) {
    this._over = setNumber(over, 'over')
  }

  get under() {
    return this._under
  }

  set under(under) {
    this._under = setNumber(under, 'under')
  }

  get even() {
    return this._even
  }

  set even(even) {
    this._even = setNumber(even, 'even')
  }
}

export default InventoryCountSummary
