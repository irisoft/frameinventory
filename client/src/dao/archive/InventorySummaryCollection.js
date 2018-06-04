import TuposCollection from './base/tupos-collection'
import InventorySummary from './InventorySummary'

class InventorySummaryCollection extends TuposCollection {
  constructor(json) {
    super(json, InventorySummary)
  }
}

export default InventorySummaryCollection
