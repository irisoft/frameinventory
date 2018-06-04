import setNumber from './base/setters/number'

class InventorySummaryItem {
  constructor(json) {
    this.frames = json.frames
    this.styles = json.styles
    this.value = json.value
  }

  toObject() {
    return {
      frames: this.frames,
      styles: this.styles,
      value: this.value,
    }
  }

  get frames() {
    return this._frames
  }

  set frames(frames) {
    this._frames = setNumber(frames, 'frames')
  }

  get styles() {
    return this._styles
  }

  set styles(styles) {
    this._styles = setNumber(styles, 'styles')
  }

  get value() {
    return this._value
  }

  set value(value) {
    this._value = setNumber(value, 'value', true, 10)
  }
}

export default InventorySummaryItem
