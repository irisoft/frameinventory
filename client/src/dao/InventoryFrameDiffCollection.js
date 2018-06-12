import TuposCollection from './base/tupos-collection'
import InventoryFrameDiff from './InventoryFrameDiff'

class InventoryFrameDiffCollection extends TuposCollection {
  constructor(json) {
    super(json, InventoryFrameDiff)
  }
}

export default InventoryFrameDiffCollection
