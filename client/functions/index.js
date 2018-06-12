/* eslint-disable no-console */
/* eslint comma-dangle: ["error", {"functions": "never"}] */
const functions = require('firebase-functions')
const admin = require('firebase-admin')

try {
  admin.initializeApp()
} catch (e) {
  console.log('Could not init admin:', e)
}

function parseCounter(value) {
  let numericValue = parseInt(value, 10)
  if (Number.isNaN(numericValue)) {
    numericValue = 0
  }
  return numericValue
}

function incrementCounter(path, increment) {
  return admin
    .database()
    .ref(path)
    .transaction(counter => parseCounter(counter) + parseCounter(increment))
}

function updateSummary({
  organizationId,
  inventoryId,
  before,
  after
}) {
  const promises = []
  const isNew = (typeof before === 'undefined' || !('reportQty' in before))
  const counterKeys = {
    'report/counts/over': 0,
    'report/counts/under': 0,
    'report/counts/even': 0,
    'report/counts/total': 0,
    'report/fifo/frames': 0,
    'report/fifo/styles': 0,
    'report/fifo/value': 0,
    'report/mims/frames': 0,
    'report/mims/styles': 0,
    'report/mims/value': 0,
    'report/diff/frames': 0,
    'report/diff/styles': 0,
    'report/diff/value': 0
  }

  counterKeys['report/counts/total'] += 1

  if (after.scannedQty > after.reportQty) {
    counterKeys['report/counts/over'] += 1
  } else if (after.scannedQty < after.reportQty) {
    counterKeys['report/counts/under'] += 1
  } else {
    counterKeys['report/counts/even'] += 1
  }

  if (!isNew) {
    counterKeys['report/counts/total'] -= 1
    if (before.scannedQty > before.reportQty) {
      counterKeys['report/counts/over'] -= 1
    } else if (before.scannedQty < before.reportQty) {
      counterKeys['report/counts/under'] -= 1
    } else {
      counterKeys['report/counts/even'] -= 1
    }
  }

  if (after.scannedQty > 0 && (isNew || before.scannedQty <= 0)) counterKeys['report/fifo/styles'] += 1
  if (after.reportQty > 0 && (isNew || before.reportQty <= 0)) counterKeys['report/mims/styles'] += 1

  if (!isNew) {
    counterKeys['report/fifo/frames'] -= before.scannedQty
    counterKeys['report/mims/frames'] -= before.reportQty

    counterKeys['report/fifo/value'] -= (before.sellInPrice * before.scannedQty)
    counterKeys['report/mims/value'] -= (before.sellInPrice * before.reportQty)
  }

  counterKeys['report/fifo/frames'] += after.scannedQty
  counterKeys['report/mims/frames'] += after.reportQty

  counterKeys['report/fifo/value'] += (after.sellInPrice * after.scannedQty)
  counterKeys['report/mims/value'] += (after.sellInPrice * after.reportQty)

  counterKeys['report/diff/frames'] = counterKeys['report/fifo/frames'] - counterKeys['report/mims/frames']
  counterKeys['report/diff/styles'] = counterKeys['report/fifo/styles'] - counterKeys['report/mims/styles']
  counterKeys['report/diff/value'] = counterKeys['report/fifo/value'] - counterKeys['report/mims/value']

  Object.keys(counterKeys).forEach((counterKey) => {
    promises.push(incrementCounter(`organizations/${organizationId}/inventories/${inventoryId}/${counterKey}`, counterKeys[counterKey]))
  })

  return Promise.all(promises)
}

exports.calculateInventorySummaryFields = functions.firestore
  .document('/organizations/{organizationId}/inventories/{inventoryId}/counts/{countId}')
  .onWrite((change, context) => {
    const {
      organizationId,
      inventoryId
    } = context.params

    if (!change.after.exists) return

    const before = change.before.data()
    const after = change.after.data()

    return updateSummary({
      organizationId,
      inventoryId,
      before,
      after
    })
  })

exports.updateFirestoreWithSummary = functions.database
  .ref('/organizations/{organizationId}/inventories/{inventoryId}/report')
  .onUpdate(({ after }) => after.ref.parent.child('lastUpdated').set(admin.database.ServerValue.TIMESTAMP))
