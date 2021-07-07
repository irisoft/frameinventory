import InventorySummaryItem from './InventorySummaryItem'
import InventoryCountSummary from './InventoryCountSummary'

class InventorySummary {
  constructor(json = {}) {
    if (json && typeof json === 'object') {
      this.counts = json.counts
      this.diff = json.diff
      this.mims = json.mims
      this.fifo = json.fifo
    } else {
      this.counts = 0
      this.diff = 0
      this.mims = 0
      this.fifo = 0
    }
  }

  toObject() {
    return {
      counts: this.counts.getDataObject(),
      diff: this.diff.getDataObject(),
      mims: this.mims.getDataObject(),
      fifo: this.fifo.getDataObject(),
    }
  }

  get counts() {
    return this._counts
  }

  set counts(counts) {
    this._counts = new InventoryCountSummary(counts)
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
