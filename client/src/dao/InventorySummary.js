import InventorySummaryItem from './InventorySummaryItem'

class InventorySummary {
  constructor(json) {
    this.diff = json.diff
    this.mims = json.mims
    this.fifo = json.fifo
  }

  toObject() {
    return {
      diff: this.diff,
      mims: this.mims,
      fifo: this.fifo,
    }
  }

  get diff() {
    return this._diff
  }

  set diff(diff) {
    this._diff = new InventorySummaryItem(diff)
  }

  get mims() {
    return this._mims
  }

  set mims(mims) {
    this._mims = new InventorySummaryItem(mims)
  }

  get fifo() {
    return this._fifo
  }

  set fifo(fifo) {
    this._fifo = new InventorySummaryItem(fifo)
  }
}

export default InventorySummary
