import TuposCollection from './base/tupos-collection'
import InventoryProductCount from './InventoryProductCount'

class InventoryProductCountCollection extends TuposCollection {
  constructor(json) {
    super(json, InventoryProductCount)
  }
}

export default InventoryProductCountCollection
