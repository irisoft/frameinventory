import TuposCollection from './base/tupos-collection'
import InventoryStyleDiff from './InventoryStyleDiff'

class InventoryStyleDiffCollection extends TuposCollection {
  constructor(json) {
    super(json, InventoryStyleDiff)
  }
}

export default InventoryStyleDiffCollection
