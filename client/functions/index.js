/* eslint-disable no-console */
/* eslint comma-dangle: ["error", {"functions": "never"}] */
const functions = require('firebase-functions')

function initializeSummaryObject(summary) {
  return Object.assign({}, {
    frames: 0,
    styles: 0,
    value: 0
  }, summary)
}

function updateSummary(inventory = {}, before, after) {
  const {
    report: {
      fifo,
      mims,
      diff
    },
    counts
  } = inventory

  const isNew = (typeof before === 'undefined')

  const newFifo = initializeSummaryObject(fifo)
  const newMims = initializeSummaryObject(mims)
  const newDiff = initializeSummaryObject(diff)

  const newCounts = Object.assign({}, {
    over: 0,
    under: 0,
    even: 0
  }, counts)

  if (after.scannedQty > after.reportQty) {
    newCounts.over += 1
  } else if (after.scannedQty < after.reportQty) {
    newCounts.under += 1
  } else {
    newCounts.even += 1
  }

  if (!isNew) {
    if (before.scannedQty > before.reportQty) {
      newCounts.over -= 1
    } else if (before.scannedQty < before.reportQty) {
      newCounts.under -= 1
    } else {
      newCounts.even -= 1
    }
  }

  if (after.scannedQty > 0 && (isNew || before.scannedQty <= 0)) newFifo.styles += 1
  if (after.reportQty > 0 && (isNew || before.reportQty <= 0)) newMims.styles += 1

  if (!isNew) {
    newFifo.frames -= before.scannedQty
    newMims.frames -= before.reportQty

    newFifo.value -= (before.sellInPrice * before.scannedQty)
    newMims.value -= (before.sellInPrice * before.reportQty)
  }

  newFifo.frames += after.scannedQty
  newMims.frames += after.reportQty

  newFifo.value += (after.sellInPrice * after.scannedQty)
  newMims.value += (after.sellInPrice * after.reportQty)

  newDiff.frames = newFifo.frames - newMims.frames
  newDiff.styles = newFifo.styles - newMims.styles
  newDiff.value = newFifo.value - newMims.value

  return {
    report: {
      fifo: newFifo,
      mims: newMims,
      diff: newDiff
    },
    counts: newCounts
  }
}

exports.calculateInventorySummaryFields = functions.firestore
  .document('/organizations/{organizationId}/inventories/{inventoryId}/counts/{countId}')
  .onWrite((change) => {
    if (!change.after.exists) return

    const { before, after } = change

    const beforeData = before.data()
    const afterData = after.data()
    const inventoryRef = change.after.ref.parent.parent

    return change.after.ref.firestore.runTransaction((transaction) => {

      // This code may get re-run multiple times if there are conflicts.
      return transaction.get(inventoryRef).then((inventoryDoc) => {
        if (!inventoryDoc.exists) {
          throw new Error('Document does not exist!')
        }

        const inventoryData = inventoryDoc.data()

        const updatedInventory = Object.assign(
          {},
          updateSummary(inventoryData, beforeData, afterData)
        )

        transaction.update(inventoryRef, updatedInventory)
      })
    }).then(() => {
      console.log('Transaction successfully committed!')
    }).catch((error) => {
      console.log('Transaction failed: ', error)
    })
  })
