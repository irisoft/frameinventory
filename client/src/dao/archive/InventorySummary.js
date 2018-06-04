import TuposModel from './base/tupos-model'

class InventorySummary extends TuposModel {
  constructor(json) {
    super(json)
    this.startDate = json.start_date
    this.reportStyleCount = json.report_style_count
    this.reportFrameCount = json.report_frame_count
    this.reportValue = json.report_value
    this.scanStyleCount = json.scan_style_count
    this.scanFrameCount = json.scan_frame_count
    this.scanValue = json.scan_value
    this.styleDiff = json.style_diff
    this.frameDiff = json.frame_diff
    this.valueDiff = json.value_diff
    this.stylesUnder = json.styles_under
    this.stylesOver = json.styles_over
  }

  get startDate() {
    return this._startDate
  }

  set startDate(startDate) {
    super.setterForNumbers(startDate, 'startDate')
  }


  get reportStyleCount() {
    return this._reportStyleCount
  }

  set reportStyleCount(reportStyleCount) {
    super.setterForNumbers(reportStyleCount, 'reportStyleCount')
  }


  get reportFrameCount() {
    return this._reportFrameCount
  }

  set reportFrameCount(reportFrameCount) {
    super.setterForNumbers(reportFrameCount, 'reportFrameCount')
  }


  get reportValue() {
    return this._reportValue
  }

  set reportValue(reportValue) {
    super.setterForNumbers(reportValue, 'reportValue')
  }


  get scanStyleCount() {
    return this._scanStyleCount
  }

  set scanStyleCount(scanStyleCount) {
    super.setterForNumbers(scanStyleCount, 'scanStyleCount')
  }


  get scanFrameCount() {
    return this._scanFrameCount
  }

  set scanFrameCount(scanFrameCount) {
    super.setterForNumbers(scanFrameCount, 'scanFrameCount')
  }


  get scanValue() {
    return this._scanValue
  }

  set scanValue(scanValue) {
    super.setterForNumbers(scanValue, 'scanValue')
  }


  get styleDiff() {
    return this._styleDiff
  }

  set styleDiff(styleDiff) {
    super.setterForNumbers(styleDiff, 'styleDiff')
  }


  get frameDiff() {
    return this._frameDiff
  }

  set frameDiff(frameDiff) {
    super.setterForNumbers(frameDiff, 'frameDiff')
  }


  get valueDiff() {
    return this._valueDiff
  }

  set valueDiff(valueDiff) {
    super.setterForNumbers(valueDiff, 'valueDiff')
  }


  get stylesUnder() {
    return this._stylesUnder
  }

  set stylesUnder(stylesUnder) {
    super.setterForNumbers(stylesUnder, 'stylesUnder')
  }


  get stylesOver() {
    return this._stylesOver
  }

  set stylesOver(stylesOver) {
    super.setterForNumbers(stylesOver, 'stylesOver')
  }
}

export default InventorySummary
