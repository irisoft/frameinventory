/* eslint-disable no-console */
export default function setterForNumbers(newValue, name, float = false, radix = 10) {
  if (!Number.isNaN(newValue)) {
    if (float) {
      return parseFloat(newValue, radix)
    }
    return parseInt(newValue, radix)
  }
  console.warn(`Property ${name} should be number. Got ${typeof newValue} instead.`)
  return NaN
}
