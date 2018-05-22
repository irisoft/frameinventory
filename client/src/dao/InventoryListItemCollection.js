import TuposCollection from './base/tupos-collection'
import InventoryListItem from './InventoryListItem'

class InventoryListItemCollection extends TuposCollection {
  constructor(json) {
    super(json, InventoryListItem)
  }
}

export default InventoryListItemCollection
