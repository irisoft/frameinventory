/* eslint-disable no-console */
export default function setterForStrings(newValue, name) {
  const type = typeof newValue
  const isString = type === 'string'

  if (!isString) {
    console.warn(`Property ${name} should be string. Got ${type} instead.`)
  }

  return isString ? newValue : ''
}
