/* eslint-disable no-console */
export default function setterForStrings(newValue) {
  const { length } = newValue.toString()
  if (length === 14) return newValue.toString()
  if (length < 14) {
    return newValue.toString().padStart(14, '0')
  }
  if (length > 14) {
    return newValue.toString().slice(-14)
  }
}
