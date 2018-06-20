/* eslint-disable no-console */
export default function setterForDates(newValue, name) {
  if (typeof newValue === 'object' && 'toDate' in newValue && typeof newValue.toDate === 'function') {
    return newValue.toDate()
  }

  const timestamp = Date.parse(newValue)

  if (Number.isNaN(timestamp)) {
    console.warn(`Property ${name} should be a valid date or date string. Got '${newValue}' instead.`)
    return new Date()
  }

  return new Date(timestamp)
}
