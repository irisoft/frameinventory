import TuposModel from './base/tupos-model'

class InventoryListItem extends TuposModel {
  constructor(json) {
    super(json)
    this.id = json.id
    this.eventCount = json.event_count
    this.overCount = json.over_count
    this.underCount = json.under_count
    this.startDate = json.start_date
  }

  get id() {
    return this._id
  }

  set id(id) {
    super.setterForNumbers(id, 'id')
  }


  get eventCount() {
    return this._eventCount
  }

  set eventCount(eventCount) {
    super.setterForNumbers(eventCount, 'eventCount')
  }


  get overCount() {
    return this._overCount
  }

  set overCount(overCount) {
    super.setterForNumbers(overCount, 'overCount')
  }


  get underCount() {
    return this._underCount
  }

  set underCount(underCount) {
    super.setterForNumbers(underCount, 'underCount')
  }


  get startDate() {
    return this._startDate
  }

  set startDate(startDate) {
    super.setterForDates(startDate, 'startDate')
  }
}

export default InventoryListItem
