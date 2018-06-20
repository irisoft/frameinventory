import TuposFirestoreModel from './base/tupos-firestore-model'
import InventoryCountSummary from './InventoryCountSummary'
import InventorySummary from './InventorySummary'
import InventoryCount from './InventoryCount'
import setDate from './base/setters/date'
import setString from './base/setters/string'

class Inventory extends TuposFirestoreModel {
  constructor(json, organizationId = null, inventoryId = null) {
    super(json)
    this.locationId = json.locationId
    this.startedAt = json.startedAt
    this.status = json.status

    this.organizationId = organizationId
    this.inventoryId = inventoryId
  }

  static async load(organizationId, inventoryId) {
    if (!organizationId || organizationId === '') throw new Error('Property `organizationId` is required for Inventory')
    if (!inventoryId || inventoryId === '') throw new Error('Property `inventoryId` is required for Inventory')
    const data = await TuposFirestoreModel.load(`/organizations/${organizationId}/inventories/${inventoryId}`)
    const inventory = new Inventory(data, organizationId, inventoryId)
    await inventory.registerReportWatcher(null, false)
    return inventory
  }

  static async loadCollection(organizationId, wheres = []) {
    if (!organizationId || organizationId === '') throw new Error('Argument `organizationId` is required for Inventory.loadCollection')
    const data = await TuposFirestoreModel.loadCollection(`/organizations/${organizationId}/inventories`, wheres)
    if (Array.isArray(data)) {
      return Promise.all(data.map(async (inventorySnapshot) => {
        const inventory = new Inventory(
          inventorySnapshot.data(),
          organizationId,
          inventorySnapshot.id,
        )
        await inventory.registerReportWatcher(null, false)
        return inventory
      }))
    }
    return null
  }

  getDataObject() {
    return {
      locationId: this.locationId,
      report: this.report.getDataObject(),
      startedAt: this.startedAt,
      status: this.status,
    }
  }

  collectionPath() {
    if (this.organizationId === '') throw new Error('Property `organizationId` is required for Inventory')
    return `/organizations/${this.organizationId}/inventories`
  }

  registerReportWatcher(watchFunction, isRealtime = false) {
    return new Promise((resolve) => {
      const reportPath = `organizations/${this.organizationId}/inventories/${this.inventoryId}/report`
      return TuposFirestoreModel.registerDatabaseWatcher(reportPath, (json) => {
        this.report = json
        if (typeof watchFunction === 'function') {
          watchFunction(this.report)
        }
        resolve()
      }, isRealtime)
    })
  }

  async getItems() {
    return InventoryCount.loadCollection(this.organizationId, this.inventoryId)
  }

  async getStylesDiff() {
    const wheres = [
      ['mimsQty', '==', 0],
      ['fifoQty', '>', 0],
    ]

    const styles = await InventoryCount.loadCollection(
      this.organizationId,
      this.inventoryId,
      wheres,
    )

    return styles
  }

  get id() {
    return this.inventoryId
  }

  get organizationId() {
    return this._organizationId
  }

  set organizationId(organizationId) {
    this._organizationId = setString(organizationId, 'organizationId')
  }

  get inventoryId() {
    return this._inventoryId
  }

  set inventoryId(inventoryId) {
    this._inventoryId = setString(inventoryId, 'inventoryId')
  }

  get locationId() {
    return this._locationId
  }

  set locationId(locationId) {
    this._locationId = setString(locationId, 'locationId')
  }

  get report() {
    return this._report
  }

  set report(report) {
    this._report = new InventorySummary(report)
  }

  get startedAt() {
    return this._startedAt
  }

  set startedAt(startedAt) {
    this._startedAt = setDate(startedAt, 'startedAt')
  }

  get status() {
    return this._status
  }

  set status(status) {
    this._status = setString(status, 'status')
  }
}

export default Inventory
