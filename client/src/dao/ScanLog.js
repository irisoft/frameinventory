import TuposFirestoreModel from './base/tupos-firestore-model'
import setGTIN14 from './base/setters/barcodes/gtin-14'
import setDate from './base/setters/date'
import setString from './base/setters/string'

class ScanLog extends TuposFirestoreModel {
  constructor(json, organizationId = null, inventoryId = null, scanId = null) {
    super()
    this.upc = json.upc
    this.scannedAt = json.scannedAt

    this.organizationId = organizationId
    this.inventoryId = inventoryId
    this.scanId = scanId
  }

  static async load(organizationId, inventoryId, scanId) {
    if (!organizationId || organizationId === '') throw new Error('Argument `organizationId` is required for ScanLog')
    if (!inventoryId || inventoryId === '') throw new Error('Argument `inventoryId` is required for ScanLog')
    if (!scanId || scanId === '') throw new Error('Argument `scanId` is required for ScanLog')
    const data = await TuposFirestoreModel.load(`/organizations/${organizationId}/inventories/${inventoryId}/scans/${scanId}`)
    if (data === null) return null
    return new ScanLog(data, organizationId, inventoryId, scanId)
  }

  static async loadCollection(
    organizationId,
    inventoryId,
    wheres = [],
    orderBy = null,
    watchFunction = null,
  ) {
    if (!organizationId || organizationId === '') throw new Error('Argument `organizationId` is required for ScanLog.loadCollection')
    if (!inventoryId || inventoryId === '') throw new Error('Argument `inventoryId` is required for ScanLog.loadCollection')

    let internalWatcher = null
    if (typeof watchFunction === 'function') {
      const docs = []
      const getKey = (id) => {
        let key
        docs.forEach((el, idx) => {
          if (el.scanId === id) key = idx
        })
        return key
      }

      internalWatcher = (changes) => {
        changes.forEach((change) => {
          const data = change.doc.data()
          const { id } = change.doc

          if (change.type === 'added') {
            const newScan = new ScanLog(
              data,
              organizationId,
              inventoryId,
              id,
            )
            if (orderBy !== null && typeof orderBy === 'object' && orderBy.directionStr === 'desc') {
              docs.unshift(newScan)
            } else {
              docs.push(newScan)
            }
          }

          if (change.type === 'modified') {
            docs[getKey(id)] = new ScanLog(
              data,
              organizationId,
              inventoryId,
              id,
            )
          }

          if (change.type === 'removed') {
            docs.splice(getKey(id), 1)
          }

          if (orderBy !== null && typeof orderBy === 'object' && 'fieldPath' in orderBy) {
            const direction = (orderBy.directionStr === 'desc') ? -1 : 1
            docs.sort((a, b) => {
              if (a[orderBy.fieldPath] > b[orderBy.fieldPath]) {
                return 1 * direction
              } else if (a[orderBy.fieldPath] < b[orderBy.fieldPath]) {
                return -1 * direction
              }
              return 0
            })
          }

          watchFunction(docs)
        })
      }
    }

    const data = await TuposFirestoreModel.loadCollection(
      `/organizations/${organizationId}/inventories/${inventoryId}/scans`,
      wheres,
      orderBy,
      internalWatcher,
    )

    if (Array.isArray(data)) {
      return data.map(scanLogSnapshot => new ScanLog(
        scanLogSnapshot.data(),
        organizationId,
        inventoryId,
        scanLogSnapshot.id,
      ))
    } else if (typeof data === 'function') {
      return data // unsubscribe function
    }

    return null
  }

  getDataObject() {
    return {
      upc: this.upc,
      scannedAt: this.scannedAt,
    }
  }

  collectionPath() {
    if (this.organizationId === '') throw new Error('Property `organizationId` is required for ScanLog')
    if (this.inventoryId === '') throw new Error('Property `inventoryId` is required for ScanLog')
    return `/organizations/${this.organizationId}/inventories/${this.inventoryId}/scans`
  }

  get id() {
    return this.scanId
  }

  get scanId() {
    return this._scanId
  }

  set scanId(scanId) {
    this._scanId = setString(scanId, 'scanId')
  }

  get scannedAt() {
    return this._scannedAt
  }

  set scannedAt(scannedAt) {
    this._scannedAt = setDate(scannedAt, 'scannedAt')
  }

  get upc() {
    return this._upc
  }

  set upc(upc) {
    this._upc = setGTIN14(upc, 'upc')
  }
}

export default ScanLog
