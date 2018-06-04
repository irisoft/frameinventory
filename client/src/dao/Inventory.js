import TuposFirestoreModel from './base/tupos-firestore-model'
import InventoryCountSummary from './InventoryCountSummary'
import InventorySummary from './InventorySummary'
import setDate from './base/setters/date'
import setString from './base/setters/string'

class Inventory extends TuposFirestoreModel {
  constructor(json, organizationId = null, inventoryId = null) {
    super(json)
    this.counts = json.counts
    this.locationId = json.locationId
    this.report = json.report
    this.startedAt = json.startedAt
    this.status = json.status

    this.organizationId = organizationId
    this.inventoryId = inventoryId
  }

  getDataObject() {
    return {
      counts: this.counts,
      locationId: this.locationId,
      report: this.report,
      startedAt: this.startedAt,
      status: this.status,
    }
  }

  collectionPath() {
    if (this.organizationId === '') throw new Error('Property `organizationId` is required for Inventory')
    if (this.inventoryId === '') throw new Error('Property `inventoryId` is required for Inventory')
    return `/organizations/${this.organizationId}/inventories/${this.inventoryId}`
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

  get counts() {
    return this._counts
  }

  set counts(counts) {
    this._counts = new InventoryCountSummary(counts)
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
