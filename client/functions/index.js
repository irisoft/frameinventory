/* eslint-disable no-console */
/* eslint comma-dangle: ["error", {"functions": "never"}] */
const functions = require('firebase-functions')
const admin = require('firebase-admin')

try {
  admin.initializeApp()
} catch (e) {
  console.error('Could not init admin:', e.toString())
}

function parseCounter(value) {
  let numericValue = parseInt(value, 10)
  if (Number.isNaN(numericValue)) {
    numericValue = 0
  }
  return numericValue
}

function parseCurrency(value) {
  let numericValue = parseFloat(value)
  if (Number.isNaN(numericValue)) {
    numericValue = 0.0
  }
  return numericValue
}

function incrementCounter(path, increment) {
  const parseFunction = (path.split('/').slice(-1)[0] === 'value') ? parseCurrency : parseCounter
  return admin
    .database()
    .ref(path)
    .transaction(counter => parseFunction(counter) + parseFunction(increment))
}

function updateSummary({
  organizationId,
  inventoryId,
  upc,
  before,
  after
}) {
  const promises = []
  const isNew = (typeof before === 'undefined' || !('mimsQty' in before))
  const counterKeys = {
    'report/counts/over': 0,
    'report/counts/under': 0,
    'report/counts/even': 0,
    'report/counts/total': 0,
    'report/fifo/frames': 0,
    'report/fifo/styles': 0,
    'report/fifo/value': 0.0,
    'report/mims/frames': 0,
    'report/mims/styles': 0,
    'report/mims/value': 0.0,
    'report/diff/frames': 0,
    'report/diff/styles': 0,
    'report/diff/value': 0.0
  }

  counterKeys['report/counts/total'] += 1

  if (after.fifoQty > after.mimsQty) {
    counterKeys['report/counts/over'] += 1
  } else if (after.fifoQty < after.mimsQty) {
    counterKeys['report/counts/under'] += 1
  } else {
    counterKeys['report/counts/even'] += 1
  }

  if (!isNew) {
    counterKeys['report/counts/total'] -= 1
    if (before.fifoQty > before.mimsQty) {
      counterKeys['report/counts/over'] -= 1
    } else if (before.fifoQty < before.mimsQty) {
      counterKeys['report/counts/under'] -= 1
    } else {
      counterKeys['report/counts/even'] -= 1
    }
  }

  if (after.fifoQty > 0 && (isNew || before.fifoQty <= 0)) counterKeys['report/fifo/styles'] += 1
  if (after.mimsQty > 0 && (isNew || before.mimsQty <= 0)) counterKeys['report/mims/styles'] += 1

  if (!isNew) {
    counterKeys['report/fifo/frames'] -= before.fifoQty
    counterKeys['report/mims/frames'] -= before.mimsQty

    counterKeys['report/fifo/value'] -= (before.sellInPrice * before.fifoQty)
    counterKeys['report/mims/value'] -= (before.sellInPrice * before.mimsQty)
  }

  counterKeys['report/fifo/frames'] += after.fifoQty
  counterKeys['report/mims/frames'] += after.mimsQty

  counterKeys['report/fifo/value'] += (after.sellInPrice * after.fifoQty)
  counterKeys['report/mims/value'] += (after.sellInPrice * after.mimsQty)

  counterKeys['report/diff/frames'] = counterKeys['report/fifo/frames'] - counterKeys['report/mims/frames']
  counterKeys['report/diff/styles'] = counterKeys['report/fifo/styles'] - counterKeys['report/mims/styles']
  counterKeys['report/diff/value'] = counterKeys['report/fifo/value'] - counterKeys['report/mims/value']

  Object.keys(counterKeys).forEach((counterKey) => {
    promises.push(incrementCounter(`organizations/${organizationId}/inventories/${inventoryId}/${counterKey}`, counterKeys[counterKey]))
  })

  return Promise.all(promises).then(() => {
    console.log(
      organizationId,
      inventoryId,
      upc
    )
  }).catch((e) => {
    console.error(
      organizationId,
      inventoryId,
      upc,
      e.toString()
    )
  })
}

exports.updateInventoryReport = functions.firestore
  .document('/organizations/{organizationId}/inventories/{inventoryId}/counts/{upc}')
  .onWrite((change, context) => {
    const {
      organizationId,
      inventoryId,
      upc
    } = context.params

    if (!change.after.exists) return

    const before = change.before.data()
    const after = change.after.data()

    return updateSummary({
      organizationId,
      inventoryId,
      upc,
      before,
      after
    })
  })

exports.updateQtyAfterScan = functions.firestore
  .document('/organizations/{organizationId}/inventories/{inventoryId}/scans/{scanId}')
  .onWrite((change, context) => {
    const {
      organizationId,
      inventoryId
    } = context.params

    const isNew = !change.before.exists && change.after.exists
    const isDelete = change.before.exists && !change.after.exists

    const incrementFifoQty = (data, increment) => {
      const { upc } = data
      try {
        const inventoryCountPath = `/organizations/${organizationId}/inventories/${inventoryId}/counts/${upc}`
        const inventoryCountRef = admin.firestore().doc(inventoryCountPath)
        let inventoryCount = {}
        let previousFifoQty = 0
        let fifoQty
        let isNewProduct
        return admin
          .firestore()
          .runTransaction(transaction => transaction
            .get(inventoryCountRef)
            .then((inventoryCountDoc) => {
              isNewProduct = !inventoryCountDoc.exists

              if (isNewProduct) {
                fifoQty = previousFifoQty + increment
                inventoryCount = {
                  upc,
                  mimsQty: 0,
                  fifoQty,
                  overUnder: fifoQty
                }
                return transaction.set(inventoryCountRef, inventoryCount)
              }

              const previousInventoryDoc = inventoryCountDoc.data()
              const { mimsQty } = previousInventoryDoc
              previousFifoQty = previousInventoryDoc.fifoQty
              fifoQty = previousFifoQty + increment
              inventoryCount = {
                fifoQty,
                overUnder: fifoQty - mimsQty
              }
              return transaction.update(inventoryCountRef, inventoryCount)
            })).then(() => {
            console.log(
              organizationId,
              inventoryId,
              upc,
              `From ${previousFifoQty} to ${fifoQty}`,
              (isNewProduct) ? 'New Product' : ''
            )
            return null
          }).catch((e) => {
            console.error(
              organizationId,
              inventoryId,
              upc,
              e.toString()
            )
            return null
          })
      } catch (e) {
        console.error(
          organizationId,
          inventoryId,
          upc,
          e.toString()
        )
        return false
      }
    }

    if (isNew) {
      return incrementFifoQty(change.after.data(), 1)
    }

    if (isDelete) {
      return incrementFifoQty(change.before.data(), -1)
    }
  })

// exports.updateFirestoreWithSummary =  functions.database
//   .ref('/organizations/{organizationId}/inventories/{inventoryId}/report')
//   .onUpdate(({ after }) => after
// .ref
// .parent
// .child('lastUpdated')
// .set(admin.database.ServerValue.TIMESTAMP))
