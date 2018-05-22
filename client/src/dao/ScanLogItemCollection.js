import TuposCollection from './base/tupos-collection'
import ScanLogItem from './ScanLogItem'

class ScanLogItemCollection extends TuposCollection {
  constructor(json) {
    super(json, ScanLogItem)
  }
}

export default ScanLogItemCollection
